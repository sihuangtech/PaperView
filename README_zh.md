# PaperView

基于 Tauri v2 构建的跨平台桌面 PDF 阅读器，提供沉浸式双页跨页阅读体验。

## 功能特性

- **双页跨页显示** - 模拟纸质书阅读方式，两页并排显示
- **封面模式** - 第1页单独显示，从第2页起两两配对（2-3、4-5...）
- **多种翻页方式**
  - 鼠标左键点击：右半区下一页，左半区上一页
  - 鼠标右键点击：下一页（已禁用默认右键菜单）
  - 键盘方向键：←/↑/PageUp 上一页，→/↓/PageDown/空格 下一页
  - 鼠标滚轮：向上/向下滚动翻页
- **全屏模式** - 打开 PDF 自动进入全屏，按 ESC 退出
- **自适应缩放** - 页面根据窗口大小自动等比例缩放
- **性能优化** - 页面缓存和预渲染，避免翻页卡顿
- **页码显示** - 屏幕角落显示当前页码/总页数，鼠标静止3秒后自动隐藏
- **多种文件加载方式**
  - 原生文件选择对话框
  - 拖拽文件到窗口
  - 命令行参数传入路径

## 技术栈

- **后端**: Tauri v2 (Rust)
- **前端**: TypeScript + Vite
- **PDF 渲染**: pdfjs-dist
- **插件**:
  - `@tauri-apps/plugin-dialog` - 原生文件对话框
  - `@tauri-apps/plugin-fs` - 文件系统访问
  - `@tauri-apps/plugin-store` - 本地持久化存储

## 环境要求

- [Node.js](https://nodejs.org/) (v18 或更高版本)
- [Rust](https://www.rust-lang.org/tools/install) (最新稳定版)
- Tauri 平台依赖：
  - **Windows**: Microsoft Visual Studio C++ Build Tools, WebView2
  - **macOS**: Xcode Command Line Tools
  - **Linux**: 各种系统包（详见 [Tauri 环境准备](https://tauri.app/start/prerequisites/)）

## 安装

1. 克隆仓库：

```bash
git clone <仓库地址>
cd PaperView
```

2. 安装依赖：

```bash
npm install
```

## 开发模式

启动开发服务器：

```bash
npm run tauri dev
```

此命令会：

- 启动 Vite 开发服务器（支持热更新）
- 启动 Tauri 应用窗口
- 前端代码修改后自动重新加载

## 打包构建

为当前平台构建应用：

```bash
npm run tauri build
```

构建产物位于 `src-tauri/target/release/bundle/` 目录。

### 跨平台打包说明

Tauri 构建原生二进制文件，必须在目标平台上分别构建：

- **Windows**: 在 Windows 上运行 `npm run tauri build` 生成 `.msi` 或 `.exe` (NSIS)
- **macOS**: 在 macOS 上运行 `npm run tauri build` 生成 `.dmg`
- **Linux**: 在 Linux 上运行 `npm run tauri build` 生成 `.deb` 和 `.AppImage`

## 项目结构

```text
PaperView/
├── src/                    # 前端源码 (TypeScript)
│   ├── main.ts            # 主要应用逻辑
│   └── style.css          # 样式文件
├── index.html             # 前端入口
├── src-tauri/             # Tauri 后端 (Rust)
│   ├── src/
│   │   ├── main.rs        # 应用入口
│   │   └── lib.rs         # 插件注册和命令定义
│   ├── capabilities/      # 插件权限配置
│   │   └── default.json
│   ├── tauri.conf.json    # Tauri 配置文件
│   └── Cargo.toml         # Rust 依赖
├── package.json           # Node.js 依赖
├── vite.config.ts         # Vite 配置
└── tsconfig.json          # TypeScript 配置
```

## 使用方法

1. 启动应用
2. 打开 PDF 文件：
   - 点击拖拽区域打开文件选择对话框
   - 将 PDF 文件拖拽到窗口
   - 命令行传入路径：`PaperView path/to/file.pdf`
3. 使用鼠标点击、键盘或滚轮翻页
4. 点击右上角按钮切换封面模式
5. 按 ESC 退出全屏

## 配置文件

用户设置（封面模式偏好）自动保存在：

- **Windows**: `%APPDATA%/com.paperview.app/settings.json`
- **macOS**: `~/Library/Application Support/com.paperview.app/settings.json`
- **Linux**: `~/.config/com.paperview.app/settings.json`

## 许可证

MIT
