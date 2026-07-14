import type { ScryfallCard } from './types';

const DAY_MS = 1000 * 60 * 60 * 24;

/** Cards within this many days of the birthday (in either direction) match. */
const WINDOW_DAYS = 10;

/**
 * Returns the cards released within {@link WINDOW_DAYS} of the given birthday,
 * ignoring the year, sorted oldest-first.
 *
 * The set's release year is used to build the comparison date so a birthday is
 * matched against the same year the card actually came out. Both dates are kept
 * in UTC to avoid timezone drift, since `released_at` is parsed as UTC midnight.
 */
export function filterCardsByBirthday(
	cards: ScryfallCard[],
	month: number,
	day: number
): ScryfallCard[] {
	return cards
		.filter((card) => withinWindow(card.released_at, month, day))
		.sort((a, b) => Date.parse(a.released_at) - Date.parse(b.released_at));
}

function withinWindow(releasedAt: string, month: number, day: number): boolean {
	const release = new Date(releasedAt);
	const birthday = new Date(Date.UTC(release.getUTCFullYear(), month - 1, day));
	const diffDays = Math.abs(release.getTime() - birthday.getTime()) / DAY_MS;
	return diffDays <= WINDOW_DAYS;
}

/** Whether the given month/day pair is a usable calendar birthday. */
export function isValidBirthday(month: number | null, day: number | null): boolean {
	return (
		month !== null &&
		day !== null &&
		Number.isInteger(month) &&
		Number.isInteger(day) &&
		month >= 1 &&
		month <= 12 &&
		day >= 1 &&
		day <= 31
	);
}

/** The best border-cropped image URL for a card, handling double-faced cards. */
export function cardImageUrl(card: ScryfallCard): string | undefined {
	return card.image_uris?.border_crop ?? card.card_faces?.[0]?.image_uris?.border_crop;
}
