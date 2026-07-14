import { describe, it, expect } from 'vitest';
import { filterCardsByBirthday, cardImageUrl, isValidBirthday } from './birthday';
import type { ScryfallCard } from './types';

function card(partial: Partial<ScryfallCard>): ScryfallCard {
	return {
		id: Math.random().toString(36).slice(2),
		name: 'Test Card',
		released_at: '2021-01-01',
		scryfall_uri: 'https://scryfall.com/card/test',
		...partial
	};
}

describe('filterCardsByBirthday', () => {
	it('includes cards released within 10 days of the birthday', () => {
		const cards = [card({ released_at: '2019-04-25' })]; // 2 days from Apr 23
		expect(filterCardsByBirthday(cards, 4, 23)).toHaveLength(1);
	});

	it('includes cards exactly 10 days from the birthday', () => {
		const cards = [card({ released_at: '2019-05-03' })]; // 10 days from Apr 23
		expect(filterCardsByBirthday(cards, 4, 23)).toHaveLength(1);
	});

	it('excludes cards more than 10 days from the birthday', () => {
		const cards = [card({ released_at: '2019-04-25' })];
		expect(filterCardsByBirthday(cards, 1, 1)).toHaveLength(0);
	});

	it('matches regardless of the release year', () => {
		const cards = [card({ released_at: '2005-09-15' }), card({ released_at: '2022-09-15' })];
		expect(filterCardsByBirthday(cards, 9, 15)).toHaveLength(2);
	});

	it('sorts matches by release date ascending', () => {
		const cards = [
			card({ id: 'newer', released_at: '2021-04-23' }),
			card({ id: 'older', released_at: '2019-04-23' })
		];
		const result = filterCardsByBirthday(cards, 4, 23);
		expect(result.map((c) => c.id)).toEqual(['older', 'newer']);
	});
});

describe('isValidBirthday', () => {
	it('accepts an in-range month and day', () => {
		expect(isValidBirthday(4, 23)).toBe(true);
	});

	it('rejects null values', () => {
		expect(isValidBirthday(null, 23)).toBe(false);
		expect(isValidBirthday(4, null)).toBe(false);
	});

	it('rejects out-of-range months and days', () => {
		expect(isValidBirthday(0, 15)).toBe(false);
		expect(isValidBirthday(13, 15)).toBe(false);
		expect(isValidBirthday(6, 0)).toBe(false);
		expect(isValidBirthday(6, 32)).toBe(false);
	});

	it('rejects non-integers', () => {
		expect(isValidBirthday(4.5, 23)).toBe(false);
		expect(isValidBirthday(4, 23.9)).toBe(false);
	});
});

describe('cardImageUrl', () => {
	it('uses the top-level image when present', () => {
		const c = card({ image_uris: { border_crop: 'front.png' } });
		expect(cardImageUrl(c)).toBe('front.png');
	});

	it('falls back to the first face for double-faced cards', () => {
		const c = card({
			image_uris: undefined,
			card_faces: [{ image_uris: { border_crop: 'face.png' } }]
		});
		expect(cardImageUrl(c)).toBe('face.png');
	});

	it('returns undefined when no image is available', () => {
		const c = card({ image_uris: undefined, card_faces: undefined });
		expect(cardImageUrl(c)).toBeUndefined();
	});
});
