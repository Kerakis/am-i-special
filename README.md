# Birthday Prerelease Promos

This site fetches card data from the Scryfall API, filters the date-stamped promo cards based on the user's birth month and day, and displays the images of the filtered cards.

## Notes

- The site filters the cards based on the user's birth month and day. It includes a card in the filtered data if the card's release date is within 10 days of the user's birth date, regardless of the year. This is because the `released_at` for these cards is when the actual set released rather than what is stamped on the card. Manual verification is required.
- Prerelease promos created in Strixhaven and later are excluded, since these cards only include the year in their datestamp.
