# PaperView

PaperView is a cross-platform desktop PDF reader built with Tauri v2. It focuses on an immersive dual-page spread reading experience for PDFs, especially books, papers, and other page-based documents.

## Features

- **Dual-page spread display** - Simulates physical book reading with two pages side by side.
- **Cover mode** - Displays page 1 alone, then pairs pages from page 2 onward (`2-3`, `4-5`, ...). Cover mode can be toggled at any time.
- **Multiple navigation methods**
  - Left click: right half = next spread, left half = previous spread
  - Right click: next spread, with the default context menu disabled while reading
  - Keyboard: `Left` / `Up` / `PageUp` for previous, `Right` / `Down` / `PageDown` / `Space` for next
  - Mouse wheel: scroll down/up to move forward/back
- **Fullscreen reading** - Opening a PDF automatically enters fullscreen. Press `Esc` to leave fullscreen without closing the app.
- **Adaptive scaling** - Pages are rendered to canvas and scaled to fit the current window while preserving aspect ratio.
- **Performance optimizations** - Rendered pages are cached, and upcoming spreads are preloaded for smoother navigation.
- **Reading UI** - Current page/total pages are shown in the corner and fade out after a short idle period.
- **Theme support** - Light, dark, and system theme modes are available from the top-right theme control, including on the start screen.
- **Multiple file loading methods**
  - Native file dialog
  - Drag and drop
  - Command line path argument
- **Custom app icon** - Project icons are stored in `src-tauri/icons/`, with a source master image included as `paperview-icon-source.png`.

## Tech Stack

- **Backend**: Tauri v2 (Rust)
- **Frontend**: TypeScript + Vite
- **PDF rendering**: `pdfjs-dist`
- **Tauri plugins**:
  - `@tauri-apps/plugin-dialog` - Native file dialogs
  - `@tauri-apps/plugin-fs` - File system access
  - `@tauri-apps/plugin-store` - Persistent settings storage

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Rust](https://www.rust-lang.org/tools/install) stable toolchain
- Platform-specific dependencies for Tauri:
  - **Windows**: Microsoft Visual Studio C++ Build Tools and WebView2
  - **macOS**: Xcode Command Line Tools
  - **Linux**: Required system packages listed in the [Tauri prerequisites](https://tauri.app/start/prerequisites/)

## Installation

```bash
git clone <repository-url>
cd PaperView
npm install
```

## Development

Start the Tauri development app:

```bash
npm run tauri dev
```

This starts the Vite dev server, launches the Tauri window, and reloads frontend changes during development.

## Building

Build the application for the current platform:

```bash
npm run tauri build
```

Build artifacts are written to `src-tauri/target/release/bundle/`.

### Cross-platform Build Notes

Tauri builds native binaries, so each target must be built on its corresponding platform:

- **Windows**: Run `npm run tauri build` on Windows to produce `.msi` and/or `.exe` installers.
- **macOS**: Run `npm run tauri build` on macOS to produce a `.dmg`.
- **Linux**: Run `npm run tauri build` on Linux to produce `.deb` and `.AppImage` packages.

## Project Structure

```text
PaperView/
├── src/                         # Frontend source (TypeScript)
│   ├── main.ts                  # App bootstrap and event wiring
│   ├── state.ts                 # Reader state and spread calculation
│   ├── pdf-loader.ts            # File dialog, drag/drop, CLI path, PDF loading
│   ├── renderer.ts              # PDF.js canvas rendering, cache, preload
│   ├── navigation.ts            # Previous/next spread navigation
│   ├── ui.ts                    # Viewer UI updates and reader controls
│   ├── theme.ts                 # Theme loading, saving, and system sync
│   ├── store.ts                 # Persistent settings store
│   └── style.css                # Application styles
├── index.html                   # Frontend entry point
├── src-tauri/                   # Tauri backend (Rust)
│   ├── src/
│   │   ├── main.rs              # Native app entry
│   │   └── lib.rs               # Plugin registration and commands
│   ├── capabilities/
│   │   └── default.json         # Tauri permissions
│   ├── icons/                   # App icon assets
│   ├── tauri.conf.json          # Tauri configuration
│   └── Cargo.toml               # Rust dependencies
├── package.json                 # Node.js dependencies and scripts
├── vite.config.ts               # Vite configuration
└── tsconfig.json                # TypeScript configuration
```

## Usage

1. Launch PaperView.
2. Open a PDF by clicking the start screen, dragging a PDF into the window, or passing a path on the command line:

```bash
PaperView path/to/file.pdf
```

3. Read with mouse clicks, keyboard shortcuts, or the mouse wheel.
4. Use the top-right controls to switch theme, toggle cover mode, or close the current PDF.
5. Press `Esc` to exit fullscreen.

## Configuration

User settings, including cover mode and theme preference, are saved automatically to `settings.json` in the platform app data directory:

- **Windows**: `%APPDATA%/cn.skstudio.paperview/settings.json`
- **macOS**: `~/Library/Application Support/cn.skstudio.paperview/settings.json`
- **Linux**: `~/.config/cn.skstudio.paperview/settings.json`

## License

MIT
