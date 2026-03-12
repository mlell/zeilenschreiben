<!--
  Displays the currently active typing line with visual highlight.
  Wraps TypingLine to show character-by-character progress and error state.
-->
<script lang="ts">
  import TypingLine from './TypingLine.svelte';

  /** The target text the user should type */
  export let targetText: string;
  /** What the user has typed so far */
  export let typedText: string;
  /** Whether the user made a typing error on this line */
  export let hasError: boolean;
</script>

<div class="relative flex items-start gap-4 p-4 rounded-md text-left">
  <!-- Semi-transparent background overlay requires absolute positioning -->
  <div class="active-line-bg"></div>
  <div class="relative z-10">
    <TypingLine {targetText} {typedText} {hasError} />
  </div>
</div>

<style>
  .active-line-bg {
    position: absolute;
    inset: 0;
    border-radius: var(--radius-md);
    pointer-events: none;
    background-color: var(--color-primary-muted);
    border: var(--border-width) solid var(--color-primary);
  }
</style>
