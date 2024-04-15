<script lang="ts">
  import RouteActionModal from '$lib/ui/modals/RouteActionModal.svelte';
  import { fade } from 'svelte/transition';

  const modals = ['this', 'that', 'tother'] as const;
  let modalState: (typeof modals)[number] | undefined = $state();
  let simpleFadeState = $state(false);
</script>

<main class="container mx-auto my-8 space-y-4 px-4">
  <h1>Welcome to SvelteKit</h1>
  <p>
    Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
  </p>

  <p>
    These modal guys don't have an "in" transition in dev mode. (They're in if
    blocks based on state.)
  </p>
  <div class="flex gap-4">
    {#each modals as m}
      <button
        class="inline-block rounded border px-3 py-2 hover:border-blue-500"
        onclick={() => (modalState = m)}
      >
        Open {m} modal
      </button>
    {/each}
  </div>
  <p>But oddly, this simpler thing, also in an if block, works.</p>

  <div class="flex items-start gap-x-4">
    <button
      class="inline-block rounded border px-3 py-2 hover:border-blue-500"
      onclick={() => (simpleFadeState = !simpleFadeState)}
    >
      Toggle Simpler Fade Thing
    </button>
    {#if simpleFadeState}
      <div
        class="bg-pink-300 p-4 text-purple-800"
        transition:fade|global={{ duration: 500 }}
      >
        Tailwind on vacay in Ibiza
      </div>
    {/if}
  </div>
  <p class="text-2xl">
    Once built and previewed, however, the difference goes away and the modals
    work fine.
  </p>
</main>

{#if modalState === 'this'}
  <RouteActionModal
    closeModal={() => (modalState = undefined)}
    header="This Modal"
  >
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta, non fuga
      voluptatibus eius voluptates eos vitae illo facilis quibusdam, aperiam
      expedita ratione modi explicabo optio consectetur maiores voluptas tempore
      ipsam.
    </p>
  </RouteActionModal>
{:else if modalState === 'that'}
  <RouteActionModal
    position="right"
    closeModal={() => (modalState = undefined)}
    header="That Modal"
  >
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta, non fuga
      voluptatibus eius voluptates eos vitae illo facilis quibusdam, aperiam
      expedita ratione modi explicabo optio consectetur maiores voluptas tempore
      ipsam.
    </p>
  </RouteActionModal>
{:else if modalState === 'tother'}
  <RouteActionModal
    position="bottom"
    closeModal={() => (modalState = undefined)}
    header="Tother Modal"
  >
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta, non fuga
      voluptatibus eius voluptates eos vitae illo facilis quibusdam, aperiam
      expedita ratione modi explicabo optio consectetur maiores voluptas tempore
      ipsam.
    </p>
  </RouteActionModal>
{/if}
