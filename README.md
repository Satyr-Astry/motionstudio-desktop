# MotionStudio Desktop

Electron 桌面壳：本地静态服务、窗口、原生文件对话框、`.msp` / 导出写盘，以及打包（electron-builder / NSIS）。

**渲染层不在这里。** 它属于核仓 [`motionstudio`](https://github.com/Satyr-Astry/motionstudio)，以 git submodule 挂在 `core/`：

```
motionstudio-desktop/
├─ core/                 ← submodule → motionstudio 核仓（站点根 = core/app/）
├─ main.js               ← 主进程：静态服务 core/app、开窗口、IPC
├─ preload.js            ← 只向渲染进程暴露 window.motionAPI（八路通道）
├─ test/channels.test.mjs← 跨仓通道契约（preload ↔ main ↔ 核仓 ipc.mjs）
└─ package.json          ← electron / electron-builder + NSIS 配置
```

两半只经一条缝合线接触：核仓 `app/shell/ipc.mjs` 的 `bridge()` 读 `window.motionAPI`。通道名与函数名一一对应（见 `test/channels.test.mjs` 的 `SNAPSHOT` 表），改名必须同步 preload / main / 核仓 `ipc.mjs` 三处。

## 要求

- Node 20+（只用来跑 Electron 与打包；应用本身零运行时依赖）
- Windows 10/11（当前验证平台）

## 首次运行

```bash
git clone --recursive https://github.com/Satyr-Astry/motionstudio-desktop.git
cd motionstudio-desktop
npm install
npm start
```

如果 clone 时忘了 `--recursive`（或 npm 11 没跑 `postinstall`）：

```bash
git submodule update --init --recursive
```

> 本地开发时若 `core/` 是本地路径（`.gitmodules` 里 `url=../motionstudio`），新版 git 会拒绝 file 协议的子模块拉取，用：
> `git -c protocol.file.allow=always submodule update --init --recursive`

## 改渲染层代码

渲染层是**核仓**的代码，不要在壳仓里直接改 `core/` 后当成本仓提交：

```bash
cd core                     # 这是核仓完整工作树，可以跑 npm test / npm run check
git switch -c fix/xxx
# 改 app/ 下的代码 …
git commit -am "fix: …"
cd ..
git add core && git commit -m "chore(core): bump to <sha>"   # 只 bump 指针
```

核仓还可以单独当静态站点部署（`npm run serve` → `http://127.0.0.1:43117`），不需要壳仓。

## 质量门

壳仓自己能守的只有两条：

```bash
npm run check:syntax   # node --check main.js / preload.js（这两个文件不在核仓的闸里）
npm test               # test/channels.test.mjs：八路通道契约
```

核仓的四道质量门（测试 / 静态 / 语法 / 分层 / 文档 / 本地化）在 `core/` 里跑：

```bash
cd core && npm ci && npm test && npm run check && npm run smoke
```

壳仓**没有**核仓那几道闸（它们只扫 `app/`，在壳仓会直接崩）；别把「壳仓测试绿」当成「渲染层没问题」。

## 打包

```bash
npm run dist       # NSIS 安装包 → dist/MotionStudio-<version>-setup.exe
npm run dist:dir   # 免安装目录 → dist/win-unpacked/
```

- `build.files` 只收 `main.js` / `preload.js` / `package.json` 与 `core/app/**/*`，核仓的 `tests/`、`docs/`、检查脚本天然不进包；`!core/.git` 必须留（submodule 的 `.git` 是文件不是目录）。
- 打包后核对：`resources/app.asar` 里应有 `core/app/index.html`、`core/app/shell/app.mjs`，**不应有** `core/.git` 或 `core/tests/`。
- `appId`（`com.satyr.motionstudio`）与 `productName`（`MotionStudio`）**不要改**：改了之后老用户的覆盖升级会变成「装了两个应用」。仓库名只是开发者组织方式。

## 版本号规则

1. 核仓 `version` 是唯一的产品版本号（核仓 CHANGELOG 首段）。
2. 壳仓 `version` 默认与核仓完全相同（安装包文件名用 `MotionStudio-<version>-setup.exe`）。
3. 壳仓单独修 bug：`<核版本>.<壳修订>`（如 `0.6.0.1`），只在本仓 CHANGELOG 记一行。
4. 两仓都打 `v<version>` tag。
5. bump 核指针时若要发版，必须同时对齐 `version`。

## 从「单仓时代」迁移

旧仓库（`motionstudio`）现在只放核（渲染层 + 测试 + 文档）；桌面壳已独立到本仓。之前 clone 过单仓的用户：

- 只想用桌面版：重新 `git clone --recursive` 本仓；
- 旧单仓 clone 仍然可以当核用（`npm run serve`），但不再有 `main.js` / 打包脚本；
- 不要在旧 clone 里把 `app/` 换成 submodule 后继续用旧壳 —— 旧壳的 `main.js` 找的是 `app/`，不是 `core/app/`。

## 许可

MIT，与核仓一致。Copyright © 2026 Satyr_Astry。
