# PaperView 签名与公证操作指南

本文档说明如何给 PaperView 的 GitHub Actions 自动打包产物加入平台签名。当前项目使用 Tauri v2，release workflow 位于 `.github/workflows/release.yml`，构建动作是 `tauri-apps/tauri-action@v0`。

参考资料：

- Tauri macOS 签名与公证文档：<https://v2.tauri.app/distribute/sign/macos/>
- Tauri Windows 签名文档：<https://v2.tauri.app/distribute/sign/windows/>
- Tauri Linux 签名文档：<https://v2.tauri.app/distribute/sign/linux/>
- Tauri 配置参考：<https://v2.tauri.app/reference/config/>

## 重要提醒

系统代码签名和 Tauri updater 签名不是一回事。

- macOS / Windows 代码签名：让系统识别应用发布者，减少 Gatekeeper、SmartScreen、杀软拦截。
- macOS 公证 notarization：Apple 对 Developer ID 应用的在线审核步骤，面向非 App Store 分发。
- Tauri updater 签名：只用于 Tauri 自动更新包完整性校验。当前 PaperView 没有启用 updater，所以暂时不需要 `TAURI_SIGNING_PRIVATE_KEY`。

当前项目明确不提交 `package-lock.json`，所以 `.github/workflows/release.yml` 需要使用 `npm install`，不能使用 `npm ci`。`npm ci` 要求 lockfile 存在，否则 CI 会失败。

## macOS 签名与公证

### 需要准备的东西

你需要 Apple Developer Program 账号，并准备：

- Developer ID Application 证书。
- Apple ID app-specific password，不能使用 Apple ID 登录密码。
- Apple Team ID。
- 证书 `.p12` 文件和导出密码。

### 生成证书 Secret

在 macOS Keychain Access 中导出 `Developer ID Application` 证书为 `.p12`，然后转成 base64：

```bash
base64 -i DeveloperIDApplication.p12 | pbcopy
```

在 GitHub 仓库中进入：

`Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

添加：

```text
APPLE_CERTIFICATE              base64 后的 .p12 内容
APPLE_CERTIFICATE_PASSWORD     导出 .p12 时设置的密码
APPLE_SIGNING_IDENTITY         Developer ID Application: Your Name (TEAMID)
APPLE_ID                       你的 Apple ID 邮箱
APPLE_PASSWORD                 Apple app-specific password
APPLE_TEAM_ID                  Apple Team ID
```

说明：较新的 Tauri CLI 可以从 `APPLE_CERTIFICATE` 推断签名 identity，但显式设置 `APPLE_SIGNING_IDENTITY` 更容易排错。

### 修改 workflow

在 `.github/workflows/release.yml` 的 `Build and publish release` 步骤里，把 macOS secrets 传给 Tauri action：

```yaml
- name: Build and publish release
  uses: tauri-apps/tauri-action@v0
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
    APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
    APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
    APPLE_ID: ${{ secrets.APPLE_ID }}
    APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
    APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
  with:
    args: ${{ matrix.args }}
    tagName: "${{ github.ref_type == 'tag' && github.ref_name || inputs.tag }}"
    releaseName: "PaperView ${{ github.ref_type == 'tag' && github.ref_name || inputs.tag }}"
    releaseBody: ${{ steps.changelog.outputs.body }}
    releaseDraft: true
    prerelease: false
```

这会把这些变量传给所有平台 job。更干净的写法是把 macOS 和 Windows 拆成不同 step，但上面是最小改动。

### 可选：在 Tauri 配置中固定 macOS identity

在 `src-tauri/tauri.conf.json` 中：

```json
{
  "bundle": {
    "macOS": {
      "minimumSystemVersion": "10.15",
      "signingIdentity": "Developer ID Application: Your Name (TEAMID)"
    }
  }
}
```

如果希望完全用 GitHub Secrets 控制 identity，可以不写死在配置文件里。

### 验证 macOS 产物

下载 GitHub Release draft 中的 `.dmg` 或 `.app.tar.gz`，在 macOS 上检查：

```bash
spctl -a -vv --type install PaperView.dmg
codesign -dv --verbose=4 /Applications/PaperView.app
xcrun stapler validate /Applications/PaperView.app
```

期望看到签名 identity 是 Developer ID Application，并且 notarization/stapler 校验通过。

## Windows 签名

### 需要准备的东西

你需要代码签名证书。常见选择：

- OV Code Signing Certificate：成本较低，但 SmartScreen 信誉需要积累。
- EV Code Signing Certificate：更贵，信誉体验更好，通常需要硬件 token 或云签名。
- 云签名服务：Azure Trusted Signing、DigiCert KeyLocker、SignPath、SSL.com eSigner 等，更适合 CI。

### 方案 A：Windows runner 证书库签名

如果你能在 CI 中导入 `.pfx` 证书，可以使用 Tauri 默认的 `signtool.exe`。

添加 GitHub Secrets：

```text
WINDOWS_CERTIFICATE             base64 后的 .pfx 内容
WINDOWS_CERTIFICATE_PASSWORD    .pfx 密码
WINDOWS_CERTIFICATE_THUMBPRINT  证书 SHA1 thumbprint
```

在 Windows job 的 build 前加入导入证书步骤：

```yaml
- name: Import Windows signing certificate
  if: startsWith(matrix.platform, 'windows-')
  shell: pwsh
  run: |
    $certPath = "$env:RUNNER_TEMP\codesign.pfx"
    [IO.File]::WriteAllBytes($certPath, [Convert]::FromBase64String("${{ secrets.WINDOWS_CERTIFICATE }}"))
    $password = ConvertTo-SecureString "${{ secrets.WINDOWS_CERTIFICATE_PASSWORD }}" -AsPlainText -Force
    Import-PfxCertificate -FilePath $certPath -CertStoreLocation Cert:\CurrentUser\My -Password $password
```

然后在 `src-tauri/tauri.conf.json` 的 `bundle.windows` 中加入：

```json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_CERTIFICATE_THUMBPRINT",
      "digestAlgorithm": "sha256",
      "timestampUrl": "http://timestamp.digicert.com",
      "nsis": {
        "installMode": "both"
      }
    }
  }
}
```

注意：`tauri.conf.json` 是提交到仓库的文件，不适合放私密信息。thumbprint 不是私钥，可以提交。如果你不想把 thumbprint 写入仓库，可以把 Tauri 配置改成 JS/TS 配置或在 CI 中生成额外 config 再传给 Tauri CLI。

### 方案 B：自定义签名命令

如果使用云签名或第三方签名 CLI，优先使用 Tauri 的 `signCommand`。配置示例：

```json
{
  "bundle": {
    "windows": {
      "digestAlgorithm": "sha256",
      "timestampUrl": "http://timestamp.digicert.com",
      "signCommand": {
        "cmd": "your-signing-tool",
        "args": ["sign", "%1"]
      },
      "nsis": {
        "installMode": "both"
      }
    }
  }
}
```

`%1` 是 Tauri 替换为待签名文件路径的占位符。具体参数按你的签名服务文档调整。

### 验证 Windows 产物

在 Windows 上检查 `.exe` 或安装包：

```powershell
Get-AuthenticodeSignature .\PaperView.exe
```

期望 `Status` 为 `Valid`，`SignerCertificate.Subject` 显示你的发布者证书。

## Linux 签名

Linux 没有 macOS / Windows 那样统一的桌面代码签名体验。对当前 GitHub Release 分发方式，建议至少生成校验和：

```yaml
- name: Generate checksums
  if: startsWith(matrix.platform, 'ubuntu-')
  shell: bash
  run: |
    find src-tauri/target -type f \( -name '*.AppImage' -o -name '*.deb' -o -name '*.rpm' \) -print0 \
      | xargs -0 shasum -a 256 > SHA256SUMS-${{ matrix.target }}.txt
```

如果需要更严格的发布链，可以再加入：

- GPG 签名 `SHA256SUMS`。
- AppImage embedded signature。
- APT repository GPG 签名。
- cosign / sigstore 签名。

## 推荐落地顺序

1. 保持 `package-lock.json` 不提交，并确认 release workflow 使用 `npm install`。
2. 先做 macOS 签名和公证，因为 Gatekeeper 对未公证应用影响最大。
3. 再做 Windows 签名，优先选择适合 CI 的云签名或可自动导入的证书方案。
4. Linux 先加 SHA256 checksums，后续如果要正式分发包仓库，再补 GPG/cosign。
5. 每次改完 workflow 后，先用 `workflow_dispatch` 手动触发一次，确认 draft release 的产物都能安装和验证。
