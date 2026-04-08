import * as vscode from 'vscode';
import { KeyStatus, computeUsagePercent, formatResetCountdown } from './api';
import { getKey } from './storage';
import { fetchKeyStatus } from './api';

let statusItem: vscode.StatusBarItem;
let currentStatus: KeyStatus | null = null;
let tickInterval: NodeJS.Timeout | null = null;
let windowResetAt: string | null = null;

function getUsageColor(percent: number): string {
	if (percent > 90) { return '#f85149'; }
	if (percent > 70) { return '#d29922'; }
	return '#3fb950';
}

function buildProgressBar(percent: number): string {
	const filled = Math.round(percent / 10);
	const empty = 10 - filled;
	return '█'.repeat(filled) + '░'.repeat(empty);
}

function buildText(percent: number, countdown: string): string {
	return `$(claude) ${buildProgressBar(percent)} ${percent}% ⏱ ${countdown}`;
}

function buildNoKeyText(): string {
	return '$(claude) ░░░░░░░░░░ --% ⏱ --:--:--';
}

export function initStatusBar(context: vscode.ExtensionContext): void {
	statusItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		100
	);
	statusItem.command = 'opusmax.refreshUsage';
	statusItem.text = buildNoKeyText();
	statusItem.color = '#888888';
	statusItem.show();
	context.subscriptions.push(statusItem);
}

function startTicker(resetAt: string): void {
	stopTicker();
	windowResetAt = resetAt;

	const tick = (): void => {
		if (!windowResetAt) { return; }
		const countdown = formatResetCountdown(windowResetAt);
		if (!currentStatus) { return; }
		const percent = computeUsagePercent(currentStatus);
		statusItem.text = buildText(percent, countdown);
	};

	tick();
	tickInterval = setInterval(tick, 1000);
}

function stopTicker(): void {
	if (tickInterval) {
		clearInterval(tickInterval);
		tickInterval = null;
	}
	windowResetAt = null;
}

export async function refreshUsage(): Promise<void> {
	const key = await getKey();
	if (!key) {
		stopTicker();
		statusItem.text = buildNoKeyText();
		statusItem.color = '#888888';
		currentStatus = null;
		return;
	}

	try {
		statusItem.text = '$(claude) ░░░░░░░░░░ --% ⏱ --:--:--';
		statusItem.color = '#888888';

		const status = await fetchKeyStatus(key);
		currentStatus = status;

		if (status.status !== 'found') {
			stopTicker();
			statusItem.text = '$(claude) ░░░░░░░░░░ --% ⏱ ERR';
			statusItem.color = '#f85149';
			return;
		}

		const percent = computeUsagePercent(status);
		const countdown = formatResetCountdown(status.windowResetAt);
		const color = getUsageColor(percent);

		statusItem.color = color;
		statusItem.text = buildText(percent, countdown);
		startTicker(status.windowResetAt);
	} catch {
		stopTicker();
		statusItem.text = '$(claude) ░░░░░░░░░░ --% ⏱ ERR';
		statusItem.color = '#f85149';
		currentStatus = null;
	}
}

export function getCurrentStatus(): KeyStatus | null {
	return currentStatus;
}
