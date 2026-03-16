<!--
  Layout.svelte - Consistent layout wrapper with configurable width.
  Provides the <main> semantic element with appropriate width constraints
  for different page types (narrow forms, wide content, full width).
-->
<script lang="ts">
  export let width: 'narrow' | 'wide' | 'full' = 'narrow';
  
  const widthClasses = {
    narrow: 'max-w-xl',
    wide: 'max-w-5xl',
    full: 'max-w-none'
  };
  
  $: mainClass = `${widthClasses[width]} mx-auto p-8`;
</script>

<main class={mainClass}>
  <slot />
</main>
