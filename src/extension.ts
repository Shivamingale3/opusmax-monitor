import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { initStatusBar, refreshUsage } from './statusBar';
import { initStorage } from './storage';

export function activate(_context: vscode.ExtensionContext): void {
	initStorage(_context.secrets);
	registerCommands(_context);
	initStatusBar(_context);
	refreshUsage().catch(console.error);
}

export function deactivate(): void {}
