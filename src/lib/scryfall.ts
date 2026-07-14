import type { ScryfallCard, ScryfallList } from './types';

/** Date-stamped promos before Strixhaven (see README for why STX is the cutoff). */
const SEARCH_URL = 'https://api.scryfall.com/cards/search?q=is%3Adatestamped+date%3Cstx';

/**
 * Scryfall asks clients to insert 50-100ms between requests. We use the upper
 * bound to stay comfortably within their limits.
 * @see https://scryfall.com/docs/api
 */
const RATE_LIMIT_MS = 100;

/** Scryfall asks clients to cache data; promo data changes rarely. */
export const CACHE_KEY = 'scryfall:datestamped-promos';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export interface FetchDeps {
	fetch?: typeof fetch;
	sleep?: (ms: number) => Promise<void>;
}

/**
 * Fetches every page of a Scryfall list endpoint, sending the `Accept` header
 * Scryfall requests and pausing between pages to respect their rate limits.
 *
 * Note: browsers forbid setting a custom `User-Agent` header, so the visitor's
 * own browser UA is sent. A custom UA would require a server-side proxy.
 */
export async function fetchAllPages(url: string, deps: FetchDeps = {}): Promise<ScryfallCard[]> {
	const fetchFn = deps.fetch ?? globalThis.fetch;
	const sleepFn = deps.sleep ?? sleep;

	const cards: ScryfallCard[] = [];
	let nextUrl: string | undefined = url;
	let isFirstPage = true;

	while (nextUrl) {
		if (!isFirstPage) await sleepFn(RATE_LIMIT_MS);
		isFirstPage = false;

		const response = await fetchFn(nextUrl, {
			headers: { Accept: 'application/json' }
		});
		if (!response.ok) {
			throw new Error(`Scryfall request failed with status ${response.status}`);
		}

		const page: ScryfallList = await response.json();
		cards.push(...page.data);
		nextUrl = page.has_more ? page.next_page : undefined;
	}

	return cards;
}

interface CacheEntry {
	fetchedAt: number;
	cards: ScryfallCard[];
}

/** Returns cached cards if present and within the TTL, otherwise null. */
export function readCache(storage: Storage, now: number = Date.now()): ScryfallCard[] | null {
	const raw = storage.getItem(CACHE_KEY);
	if (!raw) return null;
	try {
		const entry: CacheEntry = JSON.parse(raw);
		if (now - entry.fetchedAt > CACHE_TTL_MS) return null;
		return entry.cards;
	} catch {
		return null;
	}
}

export function writeCache(
	storage: Storage,
	cards: ScryfallCard[],
	now: number = Date.now()
): void {
	const entry: CacheEntry = { fetchedAt: now, cards };
	try {
		storage.setItem(CACHE_KEY, JSON.stringify(entry));
	} catch {
		// Ignore quota/serialization errors — caching is best-effort.
	}
}

export interface LoadDeps extends FetchDeps {
	storage?: Storage;
	now?: () => number;
}

/**
 * Loads the date-stamped promo cards, serving fresh cached data when available
 * and otherwise fetching from Scryfall and repopulating the cache.
 */
export async function loadDatestampedPromos(deps: LoadDeps = {}): Promise<ScryfallCard[]> {
	const storage = deps.storage ?? globalThis.localStorage;
	const now = deps.now ?? Date.now;

	const cached = storage ? readCache(storage, now()) : null;
	if (cached) return cached;

	const cards = await fetchAllPages(SEARCH_URL, deps);
	if (storage) writeCache(storage, cards, now());
	return cards;
}
