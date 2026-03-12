- Each file in `src/domain`, `src/services`, `src/connections`, `src/ui/components`, `src/ui/
- Write the code in a narrative way, similar to literal programming. Like a 
  teacher explaining a concept, organise the code from general to technical:
   - Start with a *1–3 sentence doc comment** at the top describing its role 
     in the [[Domain Model]]
   - Then define the main responsibilities of the code logic or component:
      - Preceed each responsibility unit with a high-level motivation and purpose 
        statement, ca. 3 sentences.
   - After the main units comes the logic implementation: Maximum 30 lines per
     unit.
   - To achieve this unit line limit, extract technical parts into helper
     functions. These follow after the logic implementation section. Helpers
     are only needed if the logic units exceed their line limits
   - Use comments above code sections to explain *why*, never *how*.
- [technique] Test-driven design: write test first, then implement — see [[Tooling]]
- [decision] German-facing UI text; code and comments in English — see [[Domain Model]]

## Styling Guidelines

- **Design tokens** in `src/variables.css`: colors, typography, spacing, borders, effects
- **Tailwind utilities** in class attributes: layout, positioning, responsive, component styling
- **Scoped `<style>` blocks** only for: complex selectors, animations, pseudo-elements
- **Never hardcode** color values — always use `var(--color-*)` tokens
- **Class ordering**: layout → spacing → typography → colors → states

---

relates_to [[Architecture Overview]]
relates_to [[Tooling]]
relates_to [[Domain Model]]
