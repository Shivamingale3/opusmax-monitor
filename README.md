# OpusMax Monitor

Monitor your OpusMax API key usage directly in the VS Code status bar.

## Features

- **Live status bar** — shows usage percentage, progress bar, and countdown timer to your usage window reset
- **$(claude) icon** — displays in the VS Code status bar alongside your usage stats
- **Auto-load** — activates on VS Code startup automatically
- **Secure key storage** — your API key is stored securely using VS Code's SecretStorage
- **Click to refresh** — click the status bar item anytime to fetch fresh data
- **Color-coded** — green (≤70%), yellow (71-90%), red (>90%)

## Status Bar Format

```
$(claude) ████████░░ 80% ⏱ 02:14:32
```

- `████████░░` — 10-character progress bar
- `80%` — current usage percentage
- `02:14:32` — live countdown to window reset (ticks every second, no API calls)

## Commands (Ctrl+Shift+P)

| Command | Description |
|---|---|
| `OpusMax: Configure Key` | Enter or update your OpusMax API key |
| `OpusMax: Refresh Usage` | Manually refresh usage data |
| `OpusMax: Clear Key` | Remove your stored API key |

## Setup

1. Install the extension
2. Press `Ctrl+Shift+P` → `OpusMax: Configure Key`
3. Enter your OpusMax API key
4. The status bar will show your usage immediately

## Installation

### Local (.vsix)
```bash
code --install-extension opusmax-monitor-0.0.1.vsix
```

### From VS Code Marketplace
Search for **OpusMax Monitor** in the Extensions view.

## License

MIT
