import * as vscode from 'vscode';
import type { KeyStatus } from '../api';
import {
	computeUsagePercent,
	formatResetCountdown,
	formatNumber,
	formatTimeAgo,
	formatLatency,
} from '../api';

export class UsageViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'opusmax-usage';

	private _view?: vscode.WebviewView;
	private _status: KeyStatus | null = null;

	resolveWebviewView(webviewView: vscode.WebviewView): void {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [],
		};

		webviewView.webview.html = this._buildHtml();

		webviewView.webview.onDidReceiveMessage(({ type }) => {
			if (type === 'requestRefresh') {
				vscode.commands.executeCommand('opusmax.refreshUsage');
			}
		});
	}

	setStatus(status: KeyStatus | null): void {
		this._status = status;
		if (this._view) {
			this._view.webview.html = this._buildHtml();
		}
	}

	private _buildHtml(): string {
		const s = this._status;

		if (!s || s.status !== 'found') {
			return this._buildNoKeyHtml();
		}

		const percent = computeUsagePercent(s);
		const countdown = formatResetCountdown(s.windowResetAt);
		const usedNum = parseInt(s.windowTokensUsed, 10);
		const limitNum = parseInt(s.windowTokenLimit, 10);
		const remaining = limitNum - usedNum;

		const gaugeColor = percent > 90 ? '#f85149' : percent > 70 ? '#d29922' : '#3fb950';
		const circumference = 2 * Math.PI * 42;
		const dashoffset = circumference - (percent / 100) * circumference;

		const resetDate = new Date(s.windowResetAt);
		const windowStart = new Date(s.windowStartedAt);
		const expiresDate = s.expiresAt ? new Date(s.expiresAt) : null;
		const daysLeft = expiresDate
			? Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
			: null;

		const last24h = s.last24h ?? { requests: 0, tokensIn: 0, tokensOut: 0, totalTokens: 0, avgLatencyMs: 0 };

		const logs = (s.recentLogs ?? []).slice(0, 5);

		return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f3f4f6;
  padding: 12px;
  color: #222;
  font-size: 13px;
}

.cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
}

.card-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon { font-size: 14px; }

/* Left card — gauge */
.gauge-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.gauge-svg {
  width: 90px;
  height: 90px;
  flex-shrink: 0;
}

.gauge-track { fill: none; stroke: #e5e7eb; stroke-width: 7; }
.gauge-fill {
  fill: none;
  stroke: ${gaugeColor};
  stroke-width: 7;
  stroke-linecap: round;
  stroke-dasharray: ${circumference};
  stroke-dashoffset: ${dashoffset};
  transform-origin: center;
  transform: rotate(-90deg);
  transition: stroke-dashoffset 0.5s ease;
}

.gauge-center {
  font-size: 18px;
  font-weight: 700;
  fill: ${gaugeColor};
}

.gauge-sub {
  font-size: 9px;
  fill: #9ca3af;
}

.stats-list { flex: 1; }
.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
  font-size: 12px;
}
.stat-label { color: #6b7280; }
.stat-value { font-weight: 600; }

/* Right card — reset countdown */
.countdown {
  font-size: 28px;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 4px;
  font-variant-numeric: tabular-nums;
}
.reset-time { font-size: 11px; color: #6b7280; margin-bottom: 8px; }
.meta-row {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
  font-size: 12px;
}

/* Summary tiles */
.tiles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.tile {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
  position: relative;
}

.tile-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 16px;
}

.tile-label {
  font-size: 10px;
  text-transform: uppercase;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 4px;
}

.tile-value {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

/* Active key banner */
.banner {
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.banner-check {
  width: 28px;
  height: 28px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
}

.banner-info { flex: 1; min-width: 0; }
.banner-name {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 3px;
}

.banner-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
}

.badge-active {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.badge-plan {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.badge-expired {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.key-prefix {
  font-size: 11px;
  color: #6b7280;
  font-family: monospace;
}

/* Recent logs */
.logs-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.logs-table th {
  text-align: left;
  color: #9ca3af;
  font-weight: 600;
  font-size: 10px;
  padding: 4px 6px;
  border-bottom: 1px solid #f3f4f6;
}

.logs-table td {
  padding: 5px 6px;
  border-bottom: 1px solid #f9fafb;
}

.logs-table tr:last-child td { border-bottom: none; }

.model-badge {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 10px;
  font-weight: 600;
}

.status-ok { color: #10b981; }
.status-err { color: #ef4444; }

.footer-note {
  text-align: center;
  font-size: 10px;
  color: #9ca3af;
  margin-top: 6px;
}

.footer-note a {
  color: #6b7280;
  text-decoration: none;
}
</style>
</head>
<body>

<div class="banner">
  <div class="banner-check">✓</div>
  <div class="banner-info">
    <div class="banner-name">${s.name ?? 'Key'}</div>
    <div class="banner-badges">
      <span class="badge badge-active">ACTIVE</span>
      <span class="badge badge-plan">${(s.planName ?? 'Unknown Plan').toUpperCase()}</span>
      ${s.isExpired ? '<span class="badge badge-expired">EXPIRED</span>' : ''}
      ${s.isOverLimit ? '<span class="badge badge-expired">OVER LIMIT</span>' : ''}
    </div>
  </div>
  <div class="key-prefix">${s.keyPrefix ?? ''}...........</div>
</div>

<div class="cards">
  <div class="card">
    <div class="card-title"><span class="icon">⏱</span> 5-Hour Window</div>
    <div class="gauge-wrap">
      <svg class="gauge-svg" viewBox="0 0 100 100">
        <circle class="gauge-track" cx="50" cy="50" r="42"/>
        <circle class="gauge-fill" cx="50" cy="50" r="42"/>
        <text class="gauge-center" x="50" y="47" text-anchor="middle">${percent}%</text>
        <text class="gauge-sub" x="50" y="61" text-anchor="middle">used</text>
      </svg>
      <div class="stats-list">
        <div class="stat-row"><span class="stat-label">Used</span><span class="stat-value">${formatNumber(usedNum)}</span></div>
        <div class="stat-row"><span class="stat-label">Remaining</span><span class="stat-value">${formatNumber(remaining)}</span></div>
        <div class="stat-row"><span class="stat-label">Budget</span><span class="stat-value">${formatNumber(limitNum)}</span></div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title"><span class="icon">🔄</span> Window Reset</div>
    <div class="countdown" id="countdown">${countdown}</div>
    <div class="reset-time">Resets at ${resetDate.toLocaleTimeString()}</div>
    <div class="meta-row">
      <div class="stat-label">Started</div>
      <div class="stat-value">${windowStart.toLocaleDateString()} ${windowStart.toLocaleTimeString()}</div>
    </div>
    <div class="meta-row">
      <div class="stat-label">Created</div>
      <div class="stat-value">${s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}</div>
    </div>
    ${expiresDate ? `<div class="meta-row">
      <div class="stat-label">Expires</div>
      <div class="stat-value">${daysLeft !== null && daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}</div>
    </div>` : ''}
    <div class="meta-row">
      <div class="stat-label">Last Used</div>
      <div class="stat-value">${s.lastUsedAt ? formatTimeAgo(s.lastUsedAt) : 'N/A'}</div>
    </div>
    <div class="meta-row">
      <div class="stat-label">Rate Limit</div>
      <div class="stat-value">${s.rateLimit ?? '?'} req/min</div>
    </div>
  </div>
</div>

<div class="tiles">
  <div class="tile">
    <div class="tile-icon">📈</div>
    <div class="tile-label">Total Requests</div>
    <div class="tile-value">${s.totalRequests ?? 0}</div>
  </div>
  <div class="tile">
    <div class="tile-icon">⏳</div>
    <div class="tile-label">24h Requests</div>
    <div class="tile-value">${last24h.requests}</div>
  </div>
  <div class="tile">
    <div class="tile-icon">🟢</div>
    <div class="tile-label">24h Tokens</div>
    <div class="tile-value">${formatNumber(last24h.totalTokens)}</div>
  </div>
  <div class="tile">
    <div class="tile-icon">⏱</div>
    <div class="tile-label">Avg Latency</div>
    <div class="tile-value">${formatLatency(last24h.avgLatencyMs)}</div>
  </div>
</div>

<div class="logs-card">
  <div class="card-title"><span class="icon">📋</span> Recent Requests</div>
  <table class="logs-table">
    <thead>
      <tr>
        <th>Model</th>
        <th>In</th>
        <th>Out</th>
        <th>Total</th>
        <th>Latency</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${logs.map(log => /* html */`
      <tr>
        <td><span class="model-badge">${log.model}</span></td>
        <td>${formatNumber(log.tokensIn)}</td>
        <td>${formatNumber(log.tokensOut)}</td>
        <td>${formatNumber(log.total)}</td>
        <td>${formatLatency(log.latency)}</td>
        <td class="${log.status === 200 ? 'status-ok' : 'status-err'}">${log.status}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>

<div class="footer-note">
  Click refresh in the status bar to update · No auto-polling
</div>

<script>
(function() {
  // Live countdown timer
  const resetAt = new Date('${s.windowResetAt}').getTime();
  const el = document.getElementById('countdown');

  function tick() {
    const diff = resetAt - Date.now();
    if (diff <= 0) { el.textContent = '00:00:00'; return; }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const sec = Math.floor((diff % 60000) / 1000);
    el.textContent =
      String(h).padStart(2,'0') + ':' +
      String(m).padStart(2,'0') + ':' +
      String(sec).padStart(2,'0');
  }

  setInterval(tick, 1000);
  tick();
})();
</script>
</body>
</html>`;
	}

	private _buildNoKeyHtml(): string {
		return /* html */`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f3f4f6;
  padding: 24px;
  text-align: center;
  color: #374151;
}
.msg { font-size: 14px; margin-bottom: 8px; }
.sub { font-size: 12px; color: #6b7280; }
button {
  margin-top: 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
}
button:hover { background: #1d4ed8; }
</style>
</head>
<body>
  <div class="msg">No API key configured</div>
  <div class="sub">Press <b>Ctrl+Shift+P</b> and run<br><b>OpusMax: Configure Key</b></div>
  <button onclick="acquireVsCodeApi().postMessage({type:'requestRefresh'})">Configure Now</button>
</body>
</html>`;
	}
}
