If the Home header/search changes cause issues, revert these files:

- `src/features/dashboard/ProductDashboard.tsx`
- `src/components/dashboard/FunctionalSearchBar.tsx`

Minimal revert:
1) Undo the `RNAnimated.View` wrapper around `AnimatedHeader` in `ProductDashboard.tsx`
2) Restore shadow styles in `FunctionalSearchBar.tsx` (searchContainer + suggestionsContainer)

