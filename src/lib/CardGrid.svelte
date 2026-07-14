<script lang="ts">
	import type { ScryfallCard } from './types';
	import { cardImageUrl } from './birthday';

	let { cards }: { cards: ScryfallCard[] } = $props();
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto p-4 max-w-7xl">
	{#each cards as card (card.id)}
		{@const image = cardImageUrl(card)}
		<a href={card.scryfall_uri} target="_blank" rel="noopener noreferrer" class="block">
			{#if image}
				<img
					class="w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow"
					src={image}
					alt={card.name}
					loading="lazy"
				/>
			{/if}
			<span class="block text-center mt-2">{card.name}</span>
		</a>
	{/each}
</div>
