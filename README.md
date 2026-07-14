# Birthday Date-stamped Promos

This site fetches card data from the Scryfall API, filters the date-stamped promo cards based on the user's birth month and day, and displays the images of the filtered cards.

## Notes

- The site filters the cards based on the user's birth month and day. It includes a card in the filtered data if the card's release date is within 10 days of the user's birth date, regardless of the year. This is because the `released_at` for these cards is when the actual set released rather than what is stamped on the card. Manual verification is required.
- Prerelease promos created in Strixhaven and later are excluded, since these cards only include the year in their datestamp.

## Scryfall API usage

The app follows Scryfall's [API guidelines](https://scryfall.com/docs/api):

- **`Accept: application/json`** is sent on every request.
- **Rate limiting**: requests are spaced ~100 ms apart (the search returns ~1,700 cards across ~10 pages).
- **Caching**: results are cached in `localStorage` for 24 hours, so repeat visits don't re-fetch.
- **User-Agent**: browsers forbid scripts from setting the `User-Agent` header, so a custom one is _not_ sent (the attempt would be silently dropped) — the visitor's own browser UA is used. Sending a custom UA would require routing requests through a server-side proxy.

All of the above lives in [`src/lib/scryfall.ts`](src/lib/scryfall.ts) and is covered by tests.

## Development

```sh
npm install
npm run dev      # start the dev server
npm test         # run unit tests
npm run check    # type-check
npm run build    # production build
```
