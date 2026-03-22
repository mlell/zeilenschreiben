<!--
  Renders active typing affordances separately from line text rendering.
  This isolates transient guidance from persistent line visualization.
-->
<script lang="ts">
  export let variant: 'error' | 'success' = 'error';
</script>

<span
  class="message-bubble"
  class:error-bubble={variant === 'error'}
  class:success-bubble={variant === 'success'}
  data-testid={variant === 'error' ? 'error-bubble' : 'success-bubble'}
>
  ENTER drücken
</span>

<style>
  .message-bubble {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: bold;
    white-space: nowrap;
    z-index: 20;
  }

  .error-bubble {
    background-color: var(--color-error);
    color: white;
  }

  .success-bubble {
    background-color: var(--color-success);
    color: white;
  }

  @media (prefers-color-scheme: dark) {
    .error-bubble {
      background-color: var(--color-error-muted);
    }
  }
</style>
