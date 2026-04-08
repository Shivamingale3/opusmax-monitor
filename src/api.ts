export interface Last24h {
	requests: number;
	tokensIn: number;
	tokensOut: number;
	totalTokens: number;
	avgLatencyMs: number;
}

export interface RecentLog {
	model: string;
	tokensIn: number;
	tokensOut: number;
	total: number;
	latency: number;
	status: number;
	time: string;
}

export interface KeyStatus {
	status: 'found' | 'not_found';
	name?: string;
	keyPrefix?: string;
	isActive?: boolean;
	rateLimit?: number;
	windowTokenLimit: string;
	windowTokensUsed: string;
	windowStartedAt: string;
	windowResetAt: string;
	windowActive?: boolean;
	planName?: string;
	expiresAt?: string;
	lastUsedAt?: string;
	createdAt?: string;
	isExpired?: boolean;
	isOverLimit?: boolean;
	totalRequests?: number;
	last24h?: Last24h;
	recentLogs?: RecentLog[];
}

const BASE_URL = 'https://api.opusmax.pro/api/key-status';

export async function fetchKeyStatus(key: string): Promise<KeyStatus> {
	const url = `${BASE_URL}?key=${encodeURIComponent(key)}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`API request failed with status ${response.status}`);
	}

	return response.json() as Promise<KeyStatus>;
}

export function computeUsagePercent(status: KeyStatus): number {
	const used = parseInt(status.windowTokensUsed, 10);
	const limit = parseInt(status.windowTokenLimit, 10);
	if (limit === 0) { return 0; }
	return Math.min(Math.round((used / limit) * 100), 100);
}

export function formatResetCountdown(resetAt: string): string {
	const reset = new Date(resetAt).getTime();
	const now = Date.now();
	const diff = reset - now;
	if (diff <= 0) { return '00:00:00'; }

	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((diff % (1000 * 60)) / 1000);

	return [hours, minutes, seconds]
		.map(n => String(n).padStart(2, '0'))
		.join(':');
}

export function formatNumber(n: number): string {
	if (n >= 1_000_000) { return `${(n / 1_000_000).toFixed(1)}M`; }
	if (n >= 1_000) { return `${(n / 1_000).toFixed(1)}K`; }
	return String(n);
}

export function formatTimeAgo(iso: string): string {
	const diff = Date.now() - new Date(iso).getTime();
	const minutes = Math.floor(diff / (1000 * 60));
	if (minutes < 1) { return 'just now'; }
	if (minutes < 60) { return `${minutes}m ago`; }
	const hours = Math.floor(minutes / 60);
	if (hours < 24) { return `${hours}h ago`; }
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

export function formatLatency(ms: number): string {
	if (ms >= 1000) { return `${(ms / 1000).toFixed(1)}s`; }
	return `${ms}ms`;
}
