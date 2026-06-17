<script lang="ts">
  import { onMount } from 'svelte';
  import { loadDatestampedPromos } from './lib/scryfall';
  import { filterCardsByBirthday, isValidBirthday } from './lib/birthday';
  import type { ScryfallCard } from './lib/types';
  import BirthdayForm from './lib/BirthdayForm.svelte';
  import CardGrid from './lib/CardGrid.svelte';

  let birthMonth = $state<number | null>(null);
  let birthDay = $state<number | null>(null);
  let allCards = $state<ScryfallCard[]>([]);
  let status = $state<'loading' | 'ready' | 'error'>('loading');

  const hasBirthday = $derived(isValidBirthday(birthMonth, birthDay));
  const cards = $derived(
    hasBirthday ? filterCardsByBirthday(allCards, birthMonth!, birthDay!) : [],
  );

  async function load(): Promise<void> {
    status = 'loading';
    try {
      allCards = await loadDatestampedPromos();
      status = 'ready';
    } catch (error) {
      console.error('Failed to load cards from Scryfall', error);
      status = 'error';
    }
  }

  onMount(load);
</script>

<main class="mx-auto mt-5 px-4">
  <h1 class="text-center text-4xl">Birthday Date-stamped Promos</h1>

  <BirthdayForm bind:month={birthMonth} bind:day={birthDay} />

  {#if hasBirthday}
    {#if status === 'loading'}
      <p class="mt-12 text-center">Loading cards…</p>
    {:else if status === 'error'}
      <div class="mt-12 text-center">
        <p>Sorry — we couldn't reach Scryfall to load the cards.</p>
        <button
          onclick={load}
          class="mt-3 rounded-md border border-gray-300 px-4 py-1 dark:border-gray-600"
        >
          Try again
        </button>
      </div>
    {:else if cards.length > 0}
      <p class="mt-6 text-center">
        Found {cards.length} card{cards.length === 1 ? '' : 's'}.
      </p>
      <CardGrid {cards} />
    {:else}
      <p class="mt-12 text-center">
        I'm afraid there are no cards with your birthday on them.
      </p>
    {/if}
  {/if}
</main>
