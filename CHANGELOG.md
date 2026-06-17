# Changelog

All notable changes to PaperView are documented in this file.

## [v0.1.0] - 2026-06-17

### Added

- Added drag-and-drop PDF opening from the welcome screen.
- Added automatic fullscreen mode when a PDF is opened.
- Added Escape key support for exiting fullscreen mode.
- Added light, dark, and system theme switching from the welcome screen and reader view.
- Added a custom PaperView application icon for desktop installers.
- Added GitHub Actions release automation for Windows, macOS, and Linux installers.
- Added multi-architecture release builds for macOS, Windows, and Linux.

### Changed

- Improved PDF spread rendering so cover pages use the full available width.
- Improved canvas caching to avoid blurry pages when switching layouts or display sizes.
- Updated English and Chinese README documentation.
- Updated Cargo dependencies with the official Cargo command-line workflow.

### Fixed

- Fixed dropped PDF files not being read from the drag-and-drop event.
- Fixed fullscreen permission configuration for the Tauri window API.
