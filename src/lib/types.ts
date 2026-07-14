/** Subset of the Scryfall card object that this app relies on. */
interface ScryfallImageUris {
	border_crop: string;
}

interface ScryfallCardFace {
	image_uris?: ScryfallImageUris;
}

export interface ScryfallCard {
	id: string;
	name: string;
	/** ISO date (YYYY-MM-DD) the card's set was released. */
	released_at: string;
	scryfall_uri: string;
	image_uris?: ScryfallImageUris;
	card_faces?: ScryfallCardFace[];
}

/** A paginated Scryfall list response. */
export interface ScryfallList {
	data: ScryfallCard[];
	has_more: boolean;
	next_page?: string;
}
