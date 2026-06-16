# PaperView

A cross-platform desktop PDF reader built with Tauri v2, featuring an immersive dual-page spread reading experience.

## Features

- **Dual-page Spread Display** - Simulates physical book reading with two pages side by side
- **Cover Mode** - First page displayed alone, then pairs from page 2 onwards (2-3, 4-5...)
- **Multiple Navigation Methods**
  - Mouse left click: right half = next page, left half = previous page
  - Mouse right click: next page (context menu disabled)
  - Keyboard: Arrow keys, PageUp/PageDown, Space
  - Mouse wheel: scroll up/down to navigate
- **Fullscreen Mode** - Automatic fullscreen when opening PDF, ESC to exit
- **Adaptive Scaling** - Pages auto-fit to window size maintaining aspect ratio
- **Performance Optimization** - Page caching and pre-rendering for smooth navigation
- **Page Info Display** - Current page/total pages shown in corner, auto-hide after 3 seconds
- **Multiple File Loading**
  - Native file dialog
  - Drag and drop
  - Command line arguments

## Tech Stack

- **Backend**: Tauri v2 (Rust)
- **Frontend**: TypeScript + Vite
- **PDF Rendering**: pdfjs-dist
- **Plugins**:
  - `@tauri-apps/plugin-dialog` - Native file dialogs
  - `@tauri-apps/plugin-fs` - File system access
  - `@tauri-apps/plugin-store` - Persistent settings storage

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- Platform-specific dependencies for Tauri:
  - **Windows**: Microsoft Visual Studio C++ Build Tools, WebView2
  - **macOS**: Xcode Command Line Tools
  - **Linux**: Various system packages (see [Tauri prerequisites](https://tauri.app/start/prerequisites/))

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd PaperView
```

2. Install dependencies:

```bash
npm install
```

## Development

Start the development server:

```bash
npm run tauri dev
```

This will:

- Start the Vite dev server for hot module replacement
- Launch the Tauri application window
- Auto-reload on frontend changes

## Building

Build the application for your current platform:

```bash
npm run tauri build
```

The built application will be located in `src-tauri/target/release/bundle/`.

### Cross-platform Build Notes

Tauri builds native binaries, so you must build on each target platform:

- **Windows**: Run `npm run tauri build` on Windows to produce `.msi` or `.exe` (NSIS)
- **macOS**: Run `npm run tauri build` on macOS to produce `.dmg`
- **Linux**: Run `npm run tauri build` on Linux to produce `.deb` and `.AppImage`

## Project Structure

```text
PaperView/
├── src/                    # Frontend source (TypeScript)
│   ├── main.ts            # Main application logic
│   └── style.css          # Styles
├── index.html             # Frontend entry point
├── src-tauri/             # Tauri backend (Rust)
│   ├── src/
│   │   ├── main.rs        # Application entry
│   │   └── lib.rs         # Plugin registration & commands
│   ├── capabilities/      # Plugin permissions
│   │   └── default.json
│   ├── tauri.conf.json    # Tauri configuration
│   └── Cargo.toml         # Rust dependencies
├── package.json           # Node.js dependencies
├── vite.config.ts         # Vite configuration
└── tsconfig.json          # TypeScript configuration
```

## Usage

1. Launch the application
2. Open a PDF file by:
   - Clicking the drop zone to open file dialog
   - Dragging a PDF file onto the window
   - Passing PDF path as command line argument: `PaperView path/to/file.pdf`
3. Navigate pages using mouse clicks, keyboard, or scroll wheel
4. Toggle cover mode using the button in top-right corner
5. Press ESC to exit fullscreen

## Configuration

User settings (cover mode preference) are automatically saved to:

- **Windows**: `%APPDATA%/com.paperview.app/settings.json`
- **macOS**: `~/Library/Application Support/com.paperview.app/settings.json`
- **Linux**: `~/.config/com.paperview.app/settings.json`

## License

MIT
