import * as vscode from 'vscode';
import { storeKey, deleteKey, getKey } from './storage';
import { refreshUsage } from './statusBar';

export function registerCommands(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('opusmax.configureKey', async () => {
			const current = await getKey();
			const input = await vscode.window.showInputBox({
				prompt: 'Enter your OpusMax API key',
				value: current ?? '',
				password: true,
				ignoreFocusOut: true,
			});

			if (input === undefined) { return; }

			if (!input.trim()) {
				await vscode.window.showWarningMessage('Key cannot be empty.');
				return;
			}

			await storeKey(input.trim());
			await vscode.window.showInformationMessage('OpusMax API key saved.');
			await refreshUsage();
		}),

		vscode.commands.registerCommand('opusmax.refreshUsage', async () => {
			await refreshUsage();
		}),

		vscode.commands.registerCommand('opusmax.clearKey', async () => {
			const confirmed = await vscode.window.showQuickPick(['Yes', 'No'], {
				canPickMany: false,
				placeHolder: 'Remove your OpusMax API key?',
			});

			if (confirmed === 'Yes') {
				await deleteKey();
				await vscode.window.showInformationMessage('OpusMax API key cleared.');
				await refreshUsage();
			}
		})
	);
}
