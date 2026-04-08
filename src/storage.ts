import * as vscode from 'vscode';

const STORAGE_KEY = 'opusmax-api-key';

let _secrets: vscode.SecretStorage;

export function initStorage(secrets: vscode.SecretStorage): void {
	_secrets = secrets;
}

export async function storeKey(key: string): Promise<void> {
	await _secrets.store(STORAGE_KEY, key);
}

export async function getKey(): Promise<string | undefined> {
	return _secrets.get(STORAGE_KEY);
}

export async function deleteKey(): Promise<void> {
	await _secrets.delete(STORAGE_KEY);
}
