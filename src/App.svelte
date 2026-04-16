<script lang="ts">
  import { onMount } from 'svelte';
  import axios from 'axios';

  let birthMonth: number | null = null;
  let birthDay: number | null = null;
  let cards: any[] = [];
  let data: any[] | null = null;
  let loading: boolean = false;

  async function fetchCards(url: string): Promise<any[]> {
    let response = await axios.get(url);
    let result: any[] = response.data.data;

    while (response.data.has_more) {
      response = await axios.get(response.data.next_page);
      result = [...result, ...response.data.data];
    }

    return result;
  }

  // Load cards on mount
  async function loadData(): Promise<void> {
    if (!data) {
      loading = true;
      try {
        data = await fetchCards(
          `https://api.scryfall.com/cards/search?q=is%3Adatestamped+date%3Cstx`,
        );
      } finally {
        loading = false;
      }
    }
  }

  // Reactive: filter and sort cards when inputs change
  $: if (birthMonth && birthDay && data) {
    const filteredCards = data.filter((card: any) => {
      const releaseDate = new Date(card.released_at);
      const birthDate = new Date(
        releaseDate.getFullYear(),
        (birthMonth as number) - 1,
        birthDay as number,
      );
      return (
        Math.abs(
          (releaseDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24),
        ) <= 10
      );
    });

    filteredCards.sort(
      (a: any, b: any) =>
        new Date(a.released_at).getTime() - new Date(b.released_at).getTime(),
    );

    cards = filteredCards;
  } else {
    cards = [];
  }

  function handleInputChange(e: Event, setter: (value: number) => void): void {
    const value = (e.target as HTMLInputElement).value;
    if (
      !isNaN(Number(value)) &&
      !value.includes('e') &&
      Number.isInteger(Number(value))
    ) {
      setter(Number(value));
    }
  }

  // Load data on component mount
  onMount(() => {
    loadData();
  });
</script>

<div class="mx-auto items-center mt-5">
  <div class="text-center">
    <h1 class="text-4xl">Birthday Date-stamped Promos</h1>
  </div>
  <div class="my-4 mx-auto items-center text-center">
    <label>
      Birth Month:
      <input
        type="number"
        min="1"
        max="12"
        on:change={(e) => handleInputChange(e, (v) => (birthMonth = v))}
        class="mx-2"
      />
    </label>
    <label>
      Birthday:
      <input
        type="number"
        min="1"
        max="31"
        on:change={(e) => handleInputChange(e, (v) => (birthDay = v))}
        class="mx-2"
      />
    </label>
  </div>
  {#if birthMonth && birthDay}
    {#if loading}
      <div class="text-center mt-12">
        <p>Loading...</p>
      </div>
    {:else if cards.length > 0}
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto p-4 max-w-7xl"
      >
        {#each cards as card (card.id)}
          <a
            href={card.scryfall_uri}
            target="_blank"
            rel="noopener noreferrer"
            class="block"
          >
            <img
              class="w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              src={card.image_uris?.border_crop ||
                card.card_faces[0].image_uris.border_crop}
              alt={card.name}
            />
            <span class="block text-center mt-2">{card.name}</span>
          </a>
        {/each}
      </div>
    {:else}
      <div class="text-center mt-12">
        <p>I'm afraid there are no cards with your birthday on them.</p>
      </div>
    {/if}
  {/if}
</div>

<style global>
  @import './index.css';
</style>
