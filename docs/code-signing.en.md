# PaperView Code Signing and Notarization Guide

This guide explains how to add platform signing to PaperView's GitHub Actions release build. The project uses Tauri v2. The release workflow is `.github/workflows/release.yml`, and the packaging step uses `tauri-apps/tauri-action@v0`.

References:

- Tauri macOS signing and notarization: <https://v2.tauri.app/distribute/sign/macos/>
- Tauri Windows signing: <https://v2.tauri.app/distribute/sign/windows/>
- Tauri Linux signing: <https://v2.tauri.app/distribute/sign/linux/>
- Tauri config reference: <https://v2.tauri.app/reference/config/>

## Important Notes

Operating-system code signing is separate from Tauri updater signing.

- macOS / Windows code signing identifies the publisher to the OS and reduces Gatekeeper, SmartScreen, and antivirus friction.
- macOS notarization is Apple's online review step for Developer ID apps distributed outside the App Store.
- Tauri updater signing only verifies update package integrity. PaperView does not currently enable the Tauri updater, so `TAURI_SIGNING_PRIVATE_KEY` is not needed yet.

This project intentionally does not commit `package-lock.json`, so `.github/workflows/release.yml` must use `npm install`, not `npm ci`. `npm ci` requires a lockfile and will fail in CI without one.

## macOS Signing and Notarization

### Requirements

You need an Apple Developer Program account and:

- A Developer ID Application certificate.
- An Apple ID app-specific password. Do not use your normal Apple ID login password.
- Your Apple Team ID.
- The exported `.p12` certificate file and its export password.

### Create GitHub Secrets

Export the `Developer ID Application` certificate from macOS Keychain Access as a `.p12`, then base64-encode it:

```bash
base64 -i DeveloperIDApplication.p12 | pbcopy
```

In the GitHub repository, open:

`Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

Add:

```text
APPLE_CERTIFICATE              base64-encoded .p12 content
APPLE_CERTIFICATE_PASSWORD     password used when exporting the .p12
APPLE_SIGNING_IDENTITY         Developer ID Application: Your Name (TEAMID)
APPLE_ID                       your Apple ID email
APPLE_PASSWORD                 Apple app-specific password
APPLE_TEAM_ID                  Apple Team ID
```

Newer Tauri CLI versions can infer the signing identity from `APPLE_CERTIFICATE`, but setting `APPLE_SIGNING_IDENTITY` explicitly makes failures easier to diagnose.

### Update the Workflow

In `.github/workflows/release.yml`, pass the macOS secrets to the `Build and publish release` step:

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

This passes the variables to all matrix jobs. A cleaner version is to split macOS and Windows into separate build steps, but the snippet above is the smallest change.

### Optional: Pin the macOS Signing Identity

In `src-tauri/tauri.conf.json`:

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

If you prefer to keep the identity controlled only by GitHub Secrets, do not hard-code it in the config file.

### Verify macOS Artifacts

Download the `.dmg` or `.app.tar.gz` from the GitHub Release draft and verify on macOS:

```bash
spctl -a -vv --type install PaperView.dmg
codesign -dv --verbose=4 /Applications/PaperView.app
xcrun stapler validate /Applications/PaperView.app
```

The signing identity should be your Developer ID Application certificate, and notarization/stapler validation should pass.

## Windows Signing

### Requirements

You need a code signing certificate. Common options:

- OV Code Signing Certificate: cheaper, but SmartScreen reputation must build over time.
- EV Code Signing Certificate: more expensive, better SmartScreen experience, often requires a hardware token or cloud signing.
- Cloud signing provider: Azure Trusted Signing, DigiCert KeyLocker, SignPath, SSL.com eSigner, and similar services are usually better for CI.

### Option A: Sign from the Windows Certificate Store

If you can import a `.pfx` certificate during CI, Tauri can use the default `signtool.exe` flow.

Add GitHub Secrets:

```text
WINDOWS_CERTIFICATE             base64-encoded .pfx content
WINDOWS_CERTIFICATE_PASSWORD    .pfx password
WINDOWS_CERTIFICATE_THUMBPRINT  certificate SHA1 thumbprint
```

Add this step before the Tauri build step for Windows jobs:

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

Then add this to `bundle.windows` in `src-tauri/tauri.conf.json`:

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

`tauri.conf.json` is committed to the repository, so do not put secrets in it. The thumbprint is not a private key and can be committed. If you do not want to commit the thumbprint, use a JS/TS Tauri config or generate an additional config file in CI and pass it to the Tauri CLI.

### Option B: Use a Custom Signing Command

If you use a cloud signing provider or a third-party signing CLI, prefer Tauri's `signCommand`:

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

`%1` is the placeholder Tauri replaces with the path of the file to sign. Adjust the command and arguments for your signing provider.

### Verify Windows Artifacts

On Windows, check the `.exe` or installer:

```powershell
Get-AuthenticodeSignature .\PaperView.exe
```

`Status` should be `Valid`, and `SignerCertificate.Subject` should show your publisher certificate.

## Linux Signing

Linux does not have a single desktop code signing flow like macOS or Windows. For the current GitHub Release distribution model, generate checksums at minimum:

```yaml
- name: Generate checksums
  if: startsWith(matrix.platform, 'ubuntu-')
  shell: bash
  run: |
    find src-tauri/target -type f \( -name '*.AppImage' -o -name '*.deb' -o -name '*.rpm' \) -print0 \
      | xargs -0 shasum -a 256 > SHA256SUMS-${{ matrix.target }}.txt
```

For a stricter release chain, add:

- GPG signatures for `SHA256SUMS`.
- AppImage embedded signatures.
- APT repository GPG signing.
- cosign / sigstore signatures.

## Recommended Rollout

1. Keep `package-lock.json` uncommitted and confirm the release workflow uses `npm install`.
2. Add macOS signing and notarization first, because Gatekeeper blocks unsigned or unnotarized apps most visibly.
3. Add Windows signing next. Prefer a CI-friendly cloud signing provider or an importable certificate flow.
4. For Linux, start with SHA256 checksums. Add GPG/cosign later if you distribute through package repositories.
5. After each workflow change, trigger `workflow_dispatch` manually and verify every artifact from the draft release.
