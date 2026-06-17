<script lang="ts">
  let {
    month = $bindable(),
    day = $bindable(),
  }: { month: number | null; day: number | null } = $props();

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const fieldClass =
    'rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-2 py-1';
</script>

<div class="my-4 flex flex-wrap items-center justify-center gap-4">
  <label class="flex items-center gap-2">
    Birth Month:
    <select bind:value={month} class={fieldClass}>
      <option value={null} disabled selected>Month</option>
      {#each months as name, i}
        <option value={i + 1}>{name}</option>
      {/each}
    </select>
  </label>
  <label class="flex items-center gap-2">
    Birth Day:
    <input
      type="number"
      min="1"
      max="31"
      placeholder="Day"
      bind:value={day}
      class="{fieldClass} w-20"
    />
  </label>
</div>
