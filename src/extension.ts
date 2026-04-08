import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { initStatusBar, refreshUsage } from './statusBar';
import { UsageViewProvider } from './view/usageView';
import { initStorage } from './storage';

export function activate(_context: vscode.ExtensionContext): void {
	const usageViewProvider = new UsageViewProvider();

	// Initialize secret storage
	initStorage(_context.secrets);

	// Register commands (Ctrl+Shift+P)
	registerCommands(_context);

	// Register the webview panel
	_context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			UsageViewProvider.viewType,
			usageViewProvider
		)
	);

	// Create and initialize the status bar
	initStatusBar(_context, usageViewProvider);

	// Load key and refresh on startup
	refreshUsage().catch(console.error);
}

export function deactivate(): void {}
