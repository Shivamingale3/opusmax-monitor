import * as vscode from 'vscode';
import {
	KeyStatus,
	computeUsagePercent,
	formatResetCountdown,
	formatNumber,
} from './api';
import { getKey } from './storage';
import { fetchKeyStatus } from './api';
import { UsageViewProvider } from './view/usageView';

let statusItem: vscode.StatusBarItem;
let currentStatus: KeyStatus | null = null;
let usageViewProvider: UsageViewProvider;

function getProgressBar(percent: number): string {
	const filled = Math.round(percent / 10);
	const empty = 10 - filled;
	return '█'.repeat(filled) + '░'.repeat(empty);
}

function getUsageColor(percent: number): string {
	if (percent > 90) { return '#f85149'; }
	if (percent > 70) { return '#d29922'; }
	return '#3fb950';
}

function getCircularIndicator(percent: number): string {
	// Unicode quarter-circle fills to approximate a pie chart
	if (percent >= 87.5) { return '◉'; }
	if (percent >= 75) { return '◐'; }
	if (percent >= 62.5) { return '◓'; }
	if (percent >= 50) { return '◔'; }
	if (percent >= 37.5) { return '◑'; }
	if (percent >= 25) { return '◒'; }
	if (percent >= 12.5) { return '◕'; }
	if (percent > 0) { return '◎'; }
	return '◯';
}

function buildTooltip(status: KeyStatus): vscode.MarkdownString {
	const percent = computeUsagePercent(status);
	const usedNum = parseInt(status.windowTokensUsed, 10);
	const limitNum = parseInt(status.windowTokenLimit, 10);
	const remaining = limitNum - usedNum;
	const countdown = formatResetCountdown(status.windowResetAt);
	const resetTime = new Date(status.windowResetAt).toLocaleTimeString();
	const progressBar = getProgressBar(percent);

	// Path to the logo — resolved to a file:// URI
	const logoUri = vscode.Uri.joinPath(
		vscode.Uri.file('/home/leadows/Projects/practice/opusmax-usage@opusmax/opusmax-monitor'),
		'claude_logo.png'
	);

	const md = new vscode.MarkdownString('', true);
	md.isTrusted = true;

	md.appendMarkdown(
		`# ⚡ OpusMax Monitor  \n` +
		`![Claude Logo](${logoUri.with({ scheme: 'file' }).toString()} "Logo"){width=48 height=48 style="float:right;margin-left:10px"}  \n\n`
	);

	md.appendMarkdown(`**${status.name ?? 'API Key'}** &nbsp;|&nbsp; **Plan:** ${(status.planName ?? 'Unknown').toUpperCase()}  \n`);
	md.appendMarkdown(`**Status:** ${status.isActive ? '✅ ACTIVE' : '❌ INACTIVE'}  \n\n`);

	md.appendMarkdown(`---\n\n`);

	md.appendMarkdown(`### 📊 5-Hour Window\n\n`);
	md.appendMarkdown(`\`\`\`\n`);
	md.appendMarkdown(` ${progressBar} ${percent}%\n`);
	md.appendMarkdown(`\`\`\`\n`);
	md.appendMarkdown(`**Used:** ${formatNumber(usedNum)} / ${formatNumber(limitNum)} tokens  \n`);
	md.appendMarkdown(`**Remaining:** ${formatNumber(remaining)} tokens  \n\n`);

	md.appendMarkdown(`### ⏱ Resets In\n\n`);
	md.appendMarkdown(`**\`${countdown}\`**  \n`);
	md.appendMarkdown(`Reset at ${resetTime}  \n\n`);

	md.appendMarkdown(`---\n\n`);

	md.appendMarkdown(`### 📈 Stats\n\n`);
	md.appendMarkdown(`| Metric | Value |\n|---|---|\n`);
	md.appendMarkdown(`| Total Requests | ${status.totalRequests ?? 0} |\n`);
	md.appendMarkdown(`| 24h Requests | ${status.last24h?.requests ?? 0} |\n`);
	md.appendMarkdown(`| 24h Tokens | ${formatNumber(status.last24h?.totalTokens ?? 0)} |\n`);
	md.appendMarkdown(`| Avg Latency | ${status.last24h?.avgLatencyMs ? (status.last24h!.avgLatencyMs / 1000).toFixed(1) + 's' : 'N/A'} |\n`);
	md.appendMarkdown(`| Rate Limit | ${status.rateLimit ?? '?'} req/min |\n\n`);

	md.appendMarkdown(`---\n\n`);
	md.appendMarkdown(`> 💡 Click **OpusMax: Refresh Usage** to update\n`);
	md.appendMarkdown(`> ⚙️ Use **Ctrl+Shift+P → OpusMax: Configure Key** to change key`);

	return md;
}

export function initStatusBar(context: vscode.ExtensionContext, provider: UsageViewProvider): void {
	usageViewProvider = provider;
	statusItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		100
	);
	statusItem.command = 'opusmax.refreshUsage';
	statusItem.text = '⚡ Setup';
	statusItem.tooltip = new vscode.MarkdownString(
		'⚡ **OpusMax Monitor** — Run `OpusMax: Configure Key` to get started',
		true
	);
	statusItem.color = '#888888';
	statusItem.show();
	context.subscriptions.push(statusItem);
}

export async function refreshUsage(): Promise<void> {
	const key = await getKey();
	if (!key) {
		statusItem.text = '⚡ Setup';
		statusItem.tooltip = new vscode.MarkdownString(
			'⚡ **OpusMax Monitor** — Run `OpusMax: Configure Key` to get started',
			true
		);
		statusItem.color = '#888888';
		currentStatus = null;
		return;
	}

	try {
		statusItem.text = '⚡ Loading...';
		statusItem.color = '#888888';

		const status = await fetchKeyStatus(key);
		currentStatus = status;

		if (status.status !== 'found') {
			statusItem.text = '❌ Invalid Key';
			statusItem.color = '#f85149';
			statusItem.tooltip = new vscode.MarkdownString(
				'❌ **Invalid OpusMax Key** — The key was not found on the server',
				true
			);
			return;
		}

		const percent = computeUsagePercent(status);
		const countdown = formatResetCountdown(status.windowResetAt);
		const color = getUsageColor(percent);
		const circular = getCircularIndicator(percent);

		statusItem.color = color;
		statusItem.text = `${circular} ${percent}% ⏱ ${countdown}`;
		statusItem.tooltip = buildTooltip(status);

		usageViewProvider.setStatus(status);
	} catch (err) {
		statusItem.text = '❌ Error';
		statusItem.color = '#f85149';
		statusItem.tooltip = new vscode.MarkdownString(
			`❌ **Connection Error**\n\n${String(err)}\n\nCheck your network or API key.`,
			true
		);
		currentStatus = null;
	}
}

export function getCurrentStatus(): KeyStatus | null {
	return currentStatus;
}
