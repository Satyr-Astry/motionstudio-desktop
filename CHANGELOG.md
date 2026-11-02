# Changelog — MotionStudio Desktop

本仓只记**壳**的变化（Electron 主进程 / preload / 打包配置）。渲染层、功能与数据格式的变化在核仓 [`motionstudio`](https://github.com/Satyr-Astry/motionstudio) 的 `CHANGELOG.md`。

版本号规则见 README：壳仓 `version` 默认与核仓相同；壳单独修 bug 用 `<核版本>.<壳修订>`。

## v0.6.4 — 2026-11-03 · 跟随核仓 0.6.4（submodule 指针 + 版本对齐）

- `core` submodule 由 `v0.6.3`（`1514302`）前进到 `v0.6.4`（`f4e6344`）：核仓这一版把保存路径的位图编码减半、打开路径 assets 并行解码（C1 可行部分）。**壳代码未变**，通道契约测试不受影响。
- `version` 同步为 `0.6.4`。

## v0.6.3 — 2026-11-03 · 跟随核仓 0.6.3（submodule 指针 + 版本对齐）

- `core` submodule 由 `v0.6.2`（`9f94055`）前进到 `v0.6.3`（`1514302`）：核仓这一版把时间轴上的「通道独立键」按通道上色并补进图例（B1）。**壳代码未变**，通道契约测试不受影响。
- `version` 同步为 `0.6.3`。

## v0.6.2 — 2026-11-03 · 跟随核仓 0.6.2（submodule 指针 + 版本对齐）

- `core` submodule 由 `v0.6.1`（`77828c6`）前进到 `v0.6.2`（`9f94055`）：核仓这一版是命中掩膜只存非透明像素包围盒（C2 常驻内存优化）。**壳代码未变**，通道契约测试不受影响。
- `version` 同步为 `0.6.2`。

## v0.6.1 — 2026-11-03 · 跟随核仓 0.6.1（submodule 指针 + 版本对齐）

- `core` submodule 由 `v0.6.0`（`6daaa23`）前进到 `v0.6.1`（`77828c6`）：核仓这一版是曲线通道折叠（B2）与 WebM 透明背景的诚实提示（A2 退路），外加待修清单校准。**壳代码未变**（`main.js` / `preload.js` / 打包配置一字未动），通道契约测试不受影响。
- `version` 同步为 `0.6.1`（规则 5：bump 核指针时同时对齐版本，安装包名才是产品版本）。

## v0.6.0 — 2026-11-03 · 首次独立：壳从单仓拆出

- 从 `motionstudio@0e58994`（`v0.5.0-alpha.47-split-baseline`）导入 `main.js` / `preload.js`，核仓改为 **git submodule** 挂在 `core/`。
- `main.js`：`APP_DIR` 由 `__dirname/app` 改为 `__dirname/core/app`（核仓的站点根自带一层 `app/`）；删掉死常量 `INDEX`。
- 打包：`build.files` 指向 `core/app/**/*` 并显式排除 `!core/.git`（submodule 的 `.git` 是文件，会被 electron-builder 收集）；去掉悬空的 `buildResources: "build"`。
- 新增 `test/channels.test.mjs`：`SNAPSHOT` 表统一八路通道（`exportFrames` / `exportSheet` / `saveProject` / `saveProjectTo` / `loadProject` / `importFile` / `saveBinary` / `openFolder`），断言 preload ↔ main 一一对应，并在子模块就位时与核仓 `app/shell/ipc.mjs` 的实际调用名对账。
- 弃用旧的手写打包脚本（`tools-pack.mjs`）：electron-builder 的 NSIS / dir 目标已覆盖，且它对 submodule 的 `.git` 文件没有过滤。
- 产品标识不变：`appId = com.satyr.motionstudio`、`productName = MotionStudio`、安装目录 `%LOCALAPPDATA%\Programs\MotionStudio`。
