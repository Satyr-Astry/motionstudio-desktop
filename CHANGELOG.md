# Changelog — MotionStudio Desktop

本仓只记**壳**的变化（Electron 主进程 / preload / 打包配置）。渲染层、功能与数据格式的变化在核仓 [`motionstudio`](https://github.com/Satyr-Astry/motionstudio) 的 `CHANGELOG.md`。

版本号规则见 README：壳仓 `version` 默认与核仓相同；壳单独修 bug 用 `<核版本>.<壳修订>`。

## v0.6.0 — 2026-11-03 · 首次独立：壳从单仓拆出

- 从 `motionstudio@0e58994`（`v0.5.0-alpha.47-split-baseline`）导入 `main.js` / `preload.js`，核仓改为 **git submodule** 挂在 `core/`。
- `main.js`：`APP_DIR` 由 `__dirname/app` 改为 `__dirname/core/app`（核仓的站点根自带一层 `app/`）；删掉死常量 `INDEX`。
- 打包：`build.files` 指向 `core/app/**/*` 并显式排除 `!core/.git`（submodule 的 `.git` 是文件，会被 electron-builder 收集）；去掉悬空的 `buildResources: "build"`。
- 新增 `test/channels.test.mjs`：`SNAPSHOT` 表统一八路通道（`exportFrames` / `exportSheet` / `saveProject` / `saveProjectTo` / `loadProject` / `importFile` / `saveBinary` / `openFolder`），断言 preload ↔ main 一一对应，并在子模块就位时与核仓 `app/shell/ipc.mjs` 的实际调用名对账。
- 弃用旧的手写打包脚本（`tools-pack.mjs`）：electron-builder 的 NSIS / dir 目标已覆盖，且它对 submodule 的 `.git` 文件没有过滤。
- 产品标识不变：`appId = com.satyr.motionstudio`、`productName = MotionStudio`、安装目录 `%LOCALAPPDATA%\Programs\MotionStudio`。
