// 跨仓通道契约（mvp：拆仓后唯一能同时看见 preload / main / 核仓 ipc.mjs 的地方）。
//
// 拆仓前这条断言住在核仓的 tests/ipc-contract.test.mjs 里（三方交叉）。
// 拆仓后壳仓自己守 preload ↔ main；核仓那一侧由核仓自己的快照测试守。
// 这里再补一条「核仓 ipc.mjs 声明要调用的方法，preload 都暴露了」—— 只有壳仓能看见三者。
//
// 规矩：方法名与通道名共用下面一张 SNAPSHOT 表；任何一边改名，这里先红，
// 红文案直接说「同步 preload / main / ipc.mjs 三处」。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const invokeRe = /ipcRenderer\.invoke\(\s*'([^']+)'/g;
const handleRe = /ipcMain\.handle\(\s*'([^']+)'/g;
const calledRe = /call\(\s*'([A-Za-z]+)'/g;

/** 核仓 `ipc.mjs` 的函数名 ↔ 壳仓通道名（唯一权威表）。 */
const SNAPSHOT = {
    exportFrames: 'ms:export-frames',
    exportSheet: 'ms:export-sheet',
    saveProject: 'ms:save-project',
    saveProjectTo: 'ms:save-project-to',
    loadProject: 'ms:load-project',
    importFile: 'ms:import-file',
    saveBinary: 'ms:save-binary',
    openFolder: 'ms:open-folder',
};

/** `ipc.mjs` 里保留的兼容老名字（只出现在软兜底分支，不算缺通道）。 */
const LEGACY = new Set(['openInFolder']);

const pre = read('../preload.js');
const main = read('../main.js');
const preChannels = [...pre.matchAll(invokeRe)].map((m) => m[1]).sort();
const mainChannels = [...main.matchAll(handleRe)].map((m) => m[1]).sort();
const CORE_IPC = new URL('../core/app/shell/ipc.mjs', import.meta.url);
const HAS_CORE = existsSync(CORE_IPC);

test('preload 暴露的通道与 main 注册的通道一一对应', () => {
    assert.equal(preChannels.length, Object.keys(SNAPSHOT).length, 'preload 的通道数要等于快照');
    assert.deepEqual(preChannels, mainChannels, 'preload 与 main 的通道集合必须完全一致');
});

test('通道名与快照一致（改名要同步 preload / main / 核仓 ipc.mjs 三处）', () => {
    assert.deepEqual([...new Set(preChannels)].sort(), Object.values(SNAPSHOT).sort());
});

test('通道名都以 ms: 开头（主进程命名空间）', () => {
    for (const c of preChannels) assert.ok(c.startsWith('ms:'), '通道名应带 ms: 前缀：' + c);
});

test('核仓 ipc.mjs 调用的方法名，preload 都暴露了（submodule 挂 core/）', { skip: !HAS_CORE && '还没 git submodule update --init' }, () => {
    const src = read('../core/app/shell/ipc.mjs');
    const calls = [...src.matchAll(calledRe)].map((m) => m[1]);
    // preload 暴露的方法名：exposeInMainWorld 对象里 `方法: ` 行（4 空格缩进）
    const methods = [...pre.matchAll(/^\s{4}(\w+):\s/gm)].map((m) => m[1]);
    for (const name of calls) {
        if (LEGACY.has(name)) continue;
        assert.ok(methods.includes(name), '核仓要调用 ' + name + '，但壳仓 preload 没有暴露它');
    }
});

test('核仓 ipc.mjs 的方法名集合与快照一致（两仓同一张表）', { skip: !HAS_CORE && '还没 git submodule update --init' }, () => {
    const src = read('../core/app/shell/ipc.mjs');
    const calls = [...new Set([...src.matchAll(calledRe)].map((m) => m[1]))]
        .filter((n) => !LEGACY.has(n))
        .sort();
    assert.deepEqual(calls, Object.keys(SNAPSHOT).sort(), '核仓桥方法名变了：同步 preload / main / ipc.mjs 三处');
});
