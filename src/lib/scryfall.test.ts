import { describe, it, expect, vi } from 'vitest';
import { fetchAllPages, readCache, writeCache, loadDatestampedPromos, CACHE_KEY } from './scryfall';
import type { ScryfallCard } from './types';

function makeResponse(body: unknown, ok = true, status = 200): Response {
	return { ok, status, json: async () => body } as Response;
}

function fakeStorage(): Storage {
	const map = new Map<string, string>();
	return {
		getItem: (k: string) => map.get(k) ?? null,
		setItem: (k: string, v: string) => void map.set(k, v),
		removeItem: (k: string) => void map.delete(k),
		clear: () => map.clear(),
		key: () => null,
		get length() {
			return map.size;
		}
	} as Storage;
}

describe('fetchAllPages', () => {
	it('sends an Accept: application/json header', async () => {
		const fetchMock = vi.fn().mockResolvedValue(makeResponse({ data: [], has_more: false }));
		await fetchAllPages('https://api/x', {
			fetch: fetchMock,
			sleep: async () => {}
		});
		expect(fetchMock).toHaveBeenCalledWith('https://api/x', {
			headers: { Accept: 'application/json' }
		});
	});

	it('follows pagination and concatenates every page', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				makeResponse({
					data: [{ id: '1' }],
					has_more: true,
					next_page: 'https://api/p2'
				})
			)
			.mockResolvedValueOnce(makeResponse({ data: [{ id: '2' }], has_more: false }));
		const cards = await fetchAllPages('https://api/p1', {
			fetch: fetchMock,
			sleep: async () => {}
		});
		expect(cards.map((c) => c.id)).toEqual(['1', '2']);
	});

	it('waits between page requests but not before the first', async () => {
		const sleep = vi.fn().mockResolvedValue(undefined);
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				makeResponse({
					data: [],
					has_more: true,
					next_page: 'https://api/p2'
				})
			)
			.mockResolvedValueOnce(makeResponse({ data: [], has_more: false }));
		await fetchAllPages('https://api/p1', { fetch: fetchMock, sleep });
		expect(sleep).toHaveBeenCalledTimes(1);
	});

	it('throws when a request is not ok', async () => {
		const fetchMock = vi.fn().mockResolvedValue(makeResponse(null, false, 429));
		await expect(
			fetchAllPages('https://api/x', {
				fetch: fetchMock,
				sleep: async () => {}
			})
		).rejects.toThrow();
	});
});

describe('cache', () => {
	it('round-trips cards', () => {
		const s = fakeStorage();
		const cards = [{ id: '1' }] as ScryfallCard[];
		writeCache(s, cards, 1000);
		expect(readCache(s, 1000)).toEqual(cards);
	});

	it('returns null once the cache is older than the TTL', () => {
		const s = fakeStorage();
		writeCache(s, [{ id: '1' }] as ScryfallCard[], 0);
		const dayPlus = 24 * 60 * 60 * 1000 + 1;
		expect(readCache(s, dayPlus)).toBeNull();
	});

	it('returns null when nothing is cached', () => {
		expect(readCache(fakeStorage(), 0)).toBeNull();
	});

	it('returns null on corrupt cache data', () => {
		const s = fakeStorage();
		s.setItem(CACHE_KEY, 'not json');
		expect(readCache(s, 0)).toBeNull();
	});
});

describe('loadDatestampedPromos', () => {
	it('returns cached cards without fetching when the cache is fresh', async () => {
		const s = fakeStorage();
		writeCache(s, [{ id: 'cached' }] as ScryfallCard[], 1000);
		const fetchMock = vi.fn();
		const cards = await loadDatestampedPromos({
			storage: s,
			fetch: fetchMock,
			sleep: async () => {},
			now: () => 1000
		});
		expect(cards.map((c) => c.id)).toEqual(['cached']);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('fetches and populates the cache when nothing is cached', async () => {
		const s = fakeStorage();
		const fetchMock = vi
			.fn()
			.mockResolvedValue(makeResponse({ data: [{ id: 'fresh' }], has_more: false }));
		const cards = await loadDatestampedPromos({
			storage: s,
			fetch: fetchMock,
			sleep: async () => {},
			now: () => 1000
		});
		expect(cards.map((c) => c.id)).toEqual(['fresh']);
		expect(readCache(s, 1000)?.map((c) => c.id)).toEqual(['fresh']);
	});
});
