<!--
  Displays the currently active typing line with visual highlight.
  Wraps TypingLine to show character-by-character progress and error state.
-->
<script lang="ts">
  import TypingLine from './TypingLine.svelte';

  /**
   * The target text the user should type
   */
  export let targetText: string;

  /**
   * What the user has typed so far
   */
  export let typedText: string;

  /**
   * Whether the user made a typing error on this line
   */
  export let hasError: boolean;
</script>

<div class="active-line">
  <!-- Semi-transparent background highlights the active line -->
  <div class="active-line-bg"></div>
  <div class="active-line-content">
    <TypingLine {targetText} {typedText} {hasError} />
  </div>
</div>

<style>
  .active-line {
    /* Relative positioning enables the background overlay */
    position: relative;
    padding: var(--spacing-sm);
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    border-radius: var(--border-radius);
    text-align: left;
  }

  .active-line-bg {
    /* Semi-transparent background layer behind the text */
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(33, 150, 243, 0.2);
    border: var(--border-width) solid var(--color-primary);
    border-radius: var(--border-radius);
    pointer-events: none;
  }

  .active-line-content {
    /* Content layer sits above the background */
    position: relative;
    z-index: 1;
  }
</style>
