# Client-only Weather Badge Integration (Plan + Implementation Notes)

This app currently uses a client-only integration for Google Weather API Current Conditions to show a one-word badge (e.g., "🌧 Rain"). No new dependencies were added.

## Where
- Service: `src/service/weatherService.ts`
- Store: `src/state/weatherStore.ts` (zustand)
- Header usage: `src/components/dashboard/Header.tsx`
- Secrets template: `src/config/localSecrets.example.ts` (copy to `localSecrets.ts`, gitignored)

## How it works
1. Header requests location via `@react-native-community/geolocation` (already in app).
2. On first location retrieval, we call `useWeatherStore.getState().refresh(lat, lng)`.
3. `refresh` uses `fetchCurrentConditions` from `weatherService` to call Google:
   - `POST https://weatherdata.googleapis.com/v1/currentConditions:lookup?key=API_KEY`
   - Body: `{ location: { latitude, longitude } }`
4. Response is mapped defensively to one-word labels and emojis.
5. Header renders `{current?.icon} {current?.label}` with safe defaults (☀️ Sunny) if anything fails.

## Security & Risk Notes (Client-only)
- API key exposure: Even with Android app restrictions (package name + SHA-1), a determined attacker can extract the key from the bundle. Rate limiting and restrictions help, but this is less secure than a server proxy.
- Quota/Cost: Each client makes requests. We mitigate with a 10-minute refresh policy and significant location change triggers only.
- Offline/Failure: We default to "Sunny" visually and do not block UI.

## Recommendations
- Short term: Keep client-only with a **restricted** key and 10-minute refresh.
- Medium term: Move to a server proxy for better security, caching, and retry logic.
- Observability: Log errors only in __DEV__ and never surface raw messages to the UI.

## Setup Steps
1. Copy `src/config/localSecrets.example.ts` → `src/config/localSecrets.ts` and fill your restricted key.
2. Ensure `.gitignore` includes `src/config/localSecrets.ts` (already added).
3. Build and run. The header badge should show an icon + one-word label.

## Refresh Policy
- Initial fetch on first location retrieval.
- Future enhancements (optional):
  - App focus refresh
  - Background timer every 10 minutes (stop when app backgrounded)
  - Refresh when distance moved > 1 km

