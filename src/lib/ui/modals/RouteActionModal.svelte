<script lang="ts" context="module">
  let idCt = 0;
  const uniqueId = () => `route-action-modal-${++idCt}`;
</script>

<script lang="ts">
  import { createFocusTrap } from 'focus-trap';
  import { bodyScrollLock } from '$lib/ui/body-scroll-lock/body-scroll-lock';
  import type { Snippet } from 'svelte';
  import {
    type ModalSize,
    type FullScreenBelowBreakpoint,
    type CloseRouteActionModalFn,
    type ModalPosition
  } from './shared';
  import { page } from '$app/stores';
  import { sineInOut } from 'svelte/easing';
  type P = {
    closeDisabled?: boolean;
    closeModal: CloseRouteActionModalFn;
    closeHref?: string;
    clickOutsideDismisses?: boolean;
    position?: ModalPosition;
    size?: ModalSize;
    fullScreenBelowBreakpoint?: FullScreenBelowBreakpoint;
    backdropVisible?: boolean;
    animationDuration?: number;
    header: string | Snippet;
    children: Snippet;
    footer?: Snippet;
  };
  let {
    closeDisabled,
    closeModal,
    closeHref = $page.url.pathname,
    clickOutsideDismisses = true,
    position = 'centered',
    size = 'medium',
    fullScreenBelowBreakpoint,
    backdropVisible = true,
    animationDuration = 500,
    header,
    children,
    footer
  }: P = $props();

  let contentEl: HTMLElement | undefined = $state();

  $effect(() => {
    const focusTrap = createFocusTrap(contentEl as HTMLElement, {
      allowOutsideClick: true,
      fallbackFocus: contentEl
    });
    focusTrap.activate();
    bodyScrollLock.lock();

    return () => {
      focusTrap.deactivate();
      bodyScrollLock.unlock();
    };
  });

  const headerId = uniqueId();

  const windowHandleKeydown = (event: KeyboardEvent) => {
    if ('Escape' === event.key && !closeDisabled) {
      closeModal();
    }
  };
  const windowHandleMousedown = (event: MouseEvent | TouchEvent) => {
    if (event.target && contentEl && contentEl.contains(event.target as Node)) {
      return;
    }
    if (clickOutsideDismisses === false) {
      return;
    }

    if (!closeDisabled) {
      closeModal();
    }
  };
  const handleCloseLinkClick = (event: MouseEvent) => {
    event.preventDefault();
    if (!closeDisabled) {
      closeModal();
    }
  };
  const modalSlide = (_el: HTMLElement, opts: { duration: number }) => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const calculatedDuration =
      mediaQuery && mediaQuery.matches ? 0 : opts.duration;
    return {
      delay: 0,
      duration: calculatedDuration,
      css: (t: number) => {
        let tyPct = 100 - sineInOut(t) * 100;
        if (tyPct > 99.7) {
          tyPct = 100;
        } else if (tyPct < 0.3) {
          tyPct = 0;
        }
        if (position === 'left') {
          return `transform: translateX(-${tyPct}%)`;
        } else if (position === 'right') {
          return `transform: translateX(${tyPct}%)`;
        } else if (position === 'top') {
          return `transform: translateY(-${tyPct}%)`;
        }
        return `transform: translateY(${tyPct}%)`;
      }
    };
  };
  const backdropFade = (node: HTMLElement, opts: { duration: number }) => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const calculatedDuration =
      mediaQuery && mediaQuery.matches ? 0 : opts.duration;
    const o = +getComputedStyle(node).opacity;
    return {
      duration: calculatedDuration,
      css: (t: number) => `opacity: ${sineInOut(t) * o}`
    };
  };
</script>

<svelte:window
  onkeydown={windowHandleKeydown}
  onmousedown={windowHandleMousedown}
/>
{#if backdropVisible}
  <div
    class="modal-backdrop"
    transition:backdropFade|global={{ duration: animationDuration }}
  ></div>
{/if}
<div
  class="modal"
  class:modal-position-fullscreen={position === 'fullscreen'}
  class:modal-position-centered={position === 'centered'}
  class:modal-position-left={position === 'left'}
  class:modal-position-right={position === 'right'}
  class:modal-position-top={position === 'top'}
  class:modal-position-bottom={position === 'bottom'}
  class:modal-max={position !== 'fullscreen' && size === 'max'}
  class:modal-large={position !== 'fullscreen' && size === 'large'}
  class:modal-medium={(position !== 'fullscreen' && size === 'medium') || !size}
  class:modal-small={position !== 'fullscreen' && size === 'small'}
  class:modal-tiny={position !== 'fullscreen' && size === 'tiny'}
  class:modal-no-footer={footer === undefined}
  class:modal-fullscreen-below-sm={position !== 'fullscreen' &&
    fullScreenBelowBreakpoint === 'sm'}
  class:modal-fullscreen-below-md={position !== 'fullscreen' &&
    fullScreenBelowBreakpoint === 'md'}
  class:modal-fullscreen-below-lg={position !== 'fullscreen' &&
    fullScreenBelowBreakpoint === 'lg'}
  class:modal-fullscreen-below-xl={position !== 'fullscreen' &&
    fullScreenBelowBreakpoint === 'xl'}
  class:modal-fullscreen-below-2xl={position !== 'fullscreen' &&
    fullScreenBelowBreakpoint === '2xl'}
  role="dialog"
  aria-modal="true"
  aria-labelledby={headerId}
  transition:modalSlide|global={{ duration: animationDuration }}
>
  <div class="modal-content" tabindex="-1" bind:this={contentEl}>
    <header class="modal-header">
      <h1 id={headerId}>
        {#if typeof header === 'string'}
          {header}
        {:else}
          {@render header()}
        {/if}
      </h1>
      <a
        href={closeHref}
        class="button glass"
        class:disabled={closeDisabled}
        onclick={handleCloseLinkClick}
        aria-label="Close"
      >
        close
      </a>
    </header>
    <div class="modal-body">
      {@render children()}
    </div>
    {#if footer}
      <footer class="modal-footer">
        {@render footer()}
      </footer>
    {/if}
  </div>
</div>

<style lang="postcss">
  .modal-backdrop {
    @apply fixed 
      bottom-0 
      left-0 
      right-0 
      top-0 
      z-10 
      bg-black/50;
  }

  .modal {
    --modal-padding: 1rem;
    --modal-vertical-margin: 2rem;
    --modal-horizontal-margin: 1rem;
    @apply fixed 
      bottom-0 
      left-0 
      right-0
      top-0 
      z-[11];
  }
  .modal > .modal-content {
    @apply relative flex flex-col;
  }

  .modal > .modal-content > .modal-body,
  .modal > .modal-content > .modal-header,
  .modal > .modal-content > .modal-footer {
    @apply border-solid 
      border-gray-200 
      bg-white;
  }
  .modal > .modal-content > .modal-header,
  .modal > .modal-content > .modal-footer {
    @apply flex 
      h-14
      shrink-0
      grow-0 
      items-center 
      justify-between 
      px-[var(--modal-padding)];
  }
  .modal > .modal-content > .modal-body {
    @apply grow
      border-b
      border-t
      p-[var(--modal-padding)];
  }

  .modal > .modal-content > .modal-header > h1 {
    @apply max-w-[calc(100%-3rem)] 
      overflow-hidden 
      text-ellipsis 
      whitespace-nowrap 
      text-nowrap 
      text-xl
      font-medium;
  }

  .modal.modal-position-fullscreen {
    & {
      @apply overflow-hidden;
    }
    & > .modal-content {
      @apply absolute 
        bottom-0
        left-0
        right-0
        top-0
        w-auto
        max-w-none
        translate-x-0
        translate-y-0 
        p-0;
    }
    & > .modal-content > .modal-footer,
    & > .modal-content > .modal-header {
      @apply rounded-none border-none;
    }

    & > .modal-content > .modal-body {
      @apply overflow-y-scroll rounded-none border-l-0 border-r-0;
    }
  }

  .modal.modal-position-centered {
    @apply overflow-y-scroll;
  }
  .modal.modal-position-centered > .modal-content {
    --max-width: calc(100% - calc(var(--modal-horizontal-margin) * 2));
    --translate-y: max(-50%, calc(-50dvh + var(--modal-vertical-margin)));
    @apply absolute 
      left-1/2
      top-1/2 
      max-w-[var(--max-width)]
      -translate-x-1/2
      translate-y-[var(--translate-y)]
      pb-[var(--modal-vertical-margin)]
      drop-shadow;
  }
  .modal.modal-position-centered > .modal-content > .modal-header {
    @apply rounded-t border-l border-r border-t;
  }
  .modal.modal-position-centered > .modal-content > .modal-footer {
    @apply rounded-b border-b border-l border-r;
  }
  .modal.modal-position-centered > .modal-content > .modal-body {
    @apply border-l border-r;
  }
  .modal.modal-position-centered.modal-no-footer
    > .modal-content
    > .modal-body {
    @apply rounded-b;
  }

  .modal.modal-position-left,
  .modal.modal-position-right {
    @apply overflow-hidden;
  }
  .modal.modal-position-left > .modal-content,
  .modal.modal-position-right > .modal-content {
    --max-width: calc(100% - var(--modal-horizontal-margin));
    @apply absolute bottom-0 top-0 max-w-[var(--max-width)];
  }
  .modal.modal-position-left > .modal-content {
    @apply left-0 right-auto;
  }
  .modal.modal-position-right > .modal-content {
    @apply left-auto right-0;
  }
  .modal.modal-position-left > .modal-content > .modal-body,
  .modal.modal-position-right > .modal-content > .modal-body {
    @apply overflow-y-scroll;
  }
  .modal.modal-position-left > .modal-content > .modal-header,
  .modal.modal-position-left > .modal-content > .modal-footer,
  .modal.modal-position-left > .modal-content > .modal-body {
    @apply border-r;
  }
  .modal.modal-position-right > .modal-content > .modal-header,
  .modal.modal-position-right > .modal-content > .modal-footer,
  .modal.modal-position-right > .modal-content > .modal-body {
    @apply border-l;
  }

  .modal.modal-position-top,
  .modal.modal-position-bottom {
    @apply overflow-hidden;
  }

  .modal.modal-position-top > .modal-content,
  .modal.modal-position-bottom > .modal-content {
    --max-width: calc(100% - calc(var(--modal-horizontal-margin) * 2));
    --max-height: calc(100% - var(--modal-vertical-margin));
    @apply absolute left-1/2 max-h-[var(--max-height)] max-w-[var(--max-width)] -translate-x-1/2;
  }
  .modal.modal-position-top > .modal-content {
    @apply top-0;
  }
  .modal.modal-position-bottom > .modal-content {
    @apply bottom-0;
  }

  .modal.modal-position-top > .modal-content > .modal-header,
  .modal.modal-position-bottom > .modal-content > .modal-header,
  .modal.modal-position-top > .modal-content > .modal-footer,
  .modal.modal-position-bottom > .modal-content > .modal-footer,
  .modal.modal-position-top > .modal-content > .modal-body,
  .modal.modal-position-bottom > .modal-content > .modal-body {
    @apply overflow-y-scroll border-l border-r;
  }

  .modal.modal-position-top > .modal-content > .modal-footer {
    @apply rounded-b border-b;
  }
  .modal.modal-position-bottom > .modal-content > .modal-header {
    @apply rounded-t border-t;
  }

  .modal.modal-tiny > .modal-content {
    @apply w-80;
  }
  .modal.modal-small > .modal-content {
    @apply w-[30rem];
  }
  .modal.modal-medium > .modal-content {
    @apply w-[40rem];
  }
  .modal.modal-large > .modal-content {
    @apply w-[60rem];
  }
  .modal.modal-max > .modal-content {
    --w: calc(100% - calc(2 * var(--modal-horizontal-margin)));
    @apply w-[var(--w)];
  }
  .modal.modal-fullscreen-below-sm {
    @media (max-width: 639px) {
      & {
        @apply overflow-hidden;
      }
      & > .modal-content {
        @apply absolute 
      bottom-0 
      left-0 
      right-0 
      top-0 
      w-auto 
      max-w-none 
      translate-x-0 
      translate-y-0 
      p-0;
      }
      & > .modal-content > .modal-header,
      & > .modal-content > .modal-footer {
        @apply rounded-none border-none;
      }

      & > .modal-content > .modal-body {
        @apply overflow-y-scroll rounded-none border-l-0 border-r-0;
      }
    }
  }
  .modal.modal-fullscreen-below-md {
    @media (max-width: 767.9px) {
      & {
        @apply overflow-hidden;
      }
      & > .modal-content {
        @apply absolute 
      bottom-0 
      left-0 
      right-0 
      top-0 
      w-auto 
      max-w-none 
      translate-x-0 
      translate-y-0 
      p-0;
      }
      & > .modal-content > .modal-header,
      & > .modal-content > .modal-footer {
        @apply rounded-none border-none;
      }

      & > .modal-content > .modal-body {
        @apply overflow-y-scroll rounded-none border-l-0 border-r-0;
      }
    }
  }

  .modal.modal-fullscreen-below-lg {
    @media (max-width: 1023.9px) {
      & {
        @apply overflow-hidden;
      }
      & > .modal-content {
        @apply absolute 
      bottom-0 
      left-0 
      right-0 
      top-0 
      w-auto 
      max-w-none 
      translate-x-0 
      translate-y-0 
      p-0;
      }
      & > .modal-content > .modal-header,
      & > .modal-content > .modal-footer {
        @apply rounded-none border-none;
      }

      & > .modal-content > .modal-body {
        @apply overflow-y-scroll rounded-none border-l-0 border-r-0;
      }
    }
  }

  .modal.modal-fullscreen-below-xl {
    @media (max-width: 1279.9px) {
      & {
        @apply overflow-hidden;
      }
      & > .modal-content {
        @apply absolute 
      bottom-0 
      left-0 
      right-0 
      top-0 
      w-auto 
      max-w-none 
      translate-x-0 
      translate-y-0 
      p-0;
      }
      & > .modal-content > .modal-header,
      & > .modal-content > .modal-footer {
        @apply rounded-none border-none;
      }

      & > .modal-content > .modal-body {
        @apply overflow-y-scroll rounded-none border-l-0 border-r-0;
      }
    }
  }
  .modal.modal-fullscreen-below-2xl {
    @media (max-width: 1535.9px) {
      & {
        @apply overflow-hidden;
      }
      & > .modal-content {
        @apply absolute 
      bottom-0 
      left-0 
      right-0 
      top-0 
      w-auto 
      max-w-none 
      translate-x-0 
      translate-y-0 
      p-0;
      }
      & > .modal-content > .modal-header,
      & > .modal-content > .modal-footer {
        @apply rounded-none border-none;
      }

      & > .modal-content > .modal-body {
        @apply overflow-y-scroll rounded-none border-l-0 border-r-0;
      }
    }
  }
</style>
