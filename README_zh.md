# PaperView

PaperView 是一个基于 Tauri v2 构建的跨平台桌面 PDF 阅读器，专注于沉浸式双页跨页阅读体验，适合阅读书籍、论文和其他分页文档。

## 功能特性

- **双页跨页显示** - 模拟纸质书阅读方式，两页并排显示。
- **封面模式** - 第 1 页单独显示，从第 2 页起两两配对（`2-3`、`4-5`、...），可随时开关。
- **多种翻页方式**
  - 鼠标左键点击：右半区下一组跨页，左半区上一组跨页
  - 鼠标右键点击：下一组跨页，阅读时会禁用默认右键菜单
  - 键盘：`Left` / `Up` / `PageUp` 上一组，`Right` / `Down` / `PageDown` / `Space` 下一组
  - 鼠标滚轮：向下/向上滚动翻页
- **全屏阅读** - 打开 PDF 后自动进入全屏，按 `Esc` 退出全屏但不关闭应用。
- **自适应缩放** - 使用 canvas 渲染 PDF 页面，根据当前窗口尺寸等比例缩放。
- **性能优化** - 已渲染页面会缓存，并预加载后续跨页，减少翻页卡顿。
- **阅读辅助 UI** - 屏幕角落显示当前页码/总页数，鼠标静止一段时间后自动淡出。
- **主题支持** - 支持浅色、深色、跟随系统，右上角主题控件在首页和阅读界面均可使用。
- **多种文件加载方式**
  - 原生文件选择对话框
  - 拖拽 PDF 文件到窗口
  - 命令行参数传入 PDF 路径
- **自定义应用图标** - 图标资源位于 `src-tauri/icons/`，并保留了高清母版 `paperview-icon-source.png`。

## 技术栈

- **后端**: Tauri v2 (Rust)
- **前端**: TypeScript + Vite
- **PDF 渲染**: `pdfjs-dist`
- **Tauri 插件**:
  - `@tauri-apps/plugin-dialog` - 原生文件选择对话框
  - `@tauri-apps/plugin-fs` - 文件系统访问
  - `@tauri-apps/plugin-store` - 本地持久化设置

## 环境要求

- [Node.js](https://nodejs.org/) v18 或更高版本
- [Rust](https://www.rust-lang.org/tools/install) 稳定版工具链
- Tauri 平台依赖：
  - **Windows**: Microsoft Visual Studio C++ Build Tools 和 WebView2
  - **macOS**: Xcode Command Line Tools
  - **Linux**: 详见 [Tauri 环境准备](https://tauri.app/start/prerequisites/) 中列出的系统依赖

## 安装

```bash
git clone <仓库地址>
cd PaperView
npm install
```

## 开发模式

启动 Tauri 开发应用：

```bash
npm run tauri dev
```

此命令会启动 Vite 开发服务器、打开 Tauri 应用窗口，并在前端代码变化时自动刷新。

## 打包构建

为当前平台构建应用：

```bash
npm run tauri build
```

构建产物位于 `src-tauri/target/release/bundle/` 目录。

### 跨平台打包说明

Tauri 构建的是原生二进制文件，需要在目标平台上分别构建：

- **Windows**: 在 Windows 上运行 `npm run tauri build` 生成 `.msi` 和/或 `.exe` 安装包。
- **macOS**: 在 macOS 上运行 `npm run tauri build` 生成 `.dmg`。
- **Linux**: 在 Linux 上运行 `npm run tauri build` 生成 `.deb` 和 `.AppImage`。

## 项目结构

```text
PaperView/
├── src/                         # 前端源码 (TypeScript)
│   ├── main.ts                  # 应用初始化和事件绑定
│   ├── state.ts                 # 阅读器状态和跨页计算
│   ├── pdf-loader.ts            # 文件对话框、拖拽、命令行路径和 PDF 加载
│   ├── renderer.ts              # PDF.js canvas 渲染、缓存和预加载
│   ├── navigation.ts            # 上一组/下一组跨页导航
│   ├── ui.ts                    # 阅读界面更新和控制按钮
│   ├── theme.ts                 # 主题读取、保存和系统主题同步
│   ├── store.ts                 # 本地持久化设置
│   └── style.css                # 应用样式
├── index.html                   # 前端入口
├── src-tauri/                   # Tauri 后端 (Rust)
│   ├── src/
│   │   ├── main.rs              # 原生应用入口
│   │   └── lib.rs               # 插件注册和命令定义
│   ├── capabilities/
│   │   └── default.json         # Tauri 权限配置
│   ├── icons/                   # 应用图标资源
│   ├── tauri.conf.json          # Tauri 配置文件
│   └── Cargo.toml               # Rust 依赖
├── package.json                 # Node.js 依赖和脚本
├── vite.config.ts               # Vite 配置
└── tsconfig.json                # TypeScript 配置
```

## 使用方法

1. 启动 PaperView。
2. 打开 PDF：点击首页选择文件、将 PDF 拖拽到窗口，或通过命令行传入路径：

```bash
PaperView path/to/file.pdf
```

3. 使用鼠标点击、键盘快捷键或滚轮翻页。
4. 使用右上角按钮切换主题、开关封面模式或关闭当前 PDF。
5. 按 `Esc` 退出全屏。

## 配置文件

用户设置，包括封面模式和主题偏好，会自动保存到平台应用数据目录下的 `settings.json`：

- **Windows**: `%APPDATA%/cn.skstudio.paperview/settings.json`
- **macOS**: `~/Library/Application Support/cn.skstudio.paperview/settings.json`
- **Linux**: `~/.config/cn.skstudio.paperview/settings.json`

## 许可证

MIT
