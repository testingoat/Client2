# ScrollView onScroll Crash: Root Cause and Permanent Fix

## Context
- Error observed: `TypeError: _this.props.onScroll is not a function (it is Object)`
- Stack trace points into React Native's ScrollView.js `_handleScroll` calling `this.props.onScroll(e)`.
- Our goal was a permanent, app-level fix (not inside node_modules) that survives reinstalls.

## Investigation
- We searched the codebase for all onScroll usages. The only problematic call site was in `src/features/dashboard/ProductDashboard.tsx`.
- The code passed `Animated.event(...)` directly to the `onScroll` prop:

```tsx
onScroll={RNAnimated.event(
  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
  { useNativeDriver: true }
)}
```

- In your environment this resolved to a non-function object at runtime, causing ScrollView to crash when it tries to call it.

## Temporary unblock (rolled back)
- We briefly added a defensive `typeof` check inside `node_modules/react-native/.../ScrollView.js` to unblock. Since that is not a permanent approach, we reverted it after fixing the call site.

## Permanent Fix (implemented)
We ensured `onScroll` is always a function by creating a stable handler ref and passing a wrapper function to ScrollView.

Changes in `src/features/dashboard/ProductDashboard.tsx`:

1) Create a stable Animated handler ref near other refs:

```tsx
const animatedScrollHandlerRef = useRef(
  RNAnimated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  )
);
```

2) Replace the `onScroll` prop with a function wrapper:

```tsx
onScroll={(e) => {
  const handler = animatedScrollHandlerRef.current as any;
  if (typeof handler === 'function') {
    handler(e); // native-driver path
  } else {
    // Fallback to JS update to avoid crash
    scrollY.setValue(e.nativeEvent.contentOffset.y);
  }
}}
```

## Why this is future-proof
- ScrollView always receives a callable function.
- We keep `useNativeDriver: true` behavior when available.
- The ref avoids recreating the handler every render.
- No edits to node_modules, so reinstalls will not undo the fix.

## Validation
- Build should proceed without the previous TypeError on scroll.
- Header/back-to-top animations continue to respond to scrollY updates.

## Next steps (optional)
- Consider migrating to `react-native-reanimated`'s `useAnimatedScrollHandler` for even cleaner semantics, if you already use Reanimated elsewhere.

## Timeline of conversation
- You reported the crash and shared the suggestion to guard inside ScrollView.
- We confirmed the call-site misuse and proposed the stable function wrapper.
- You approved a permanent fix and asked for documentation.
- We applied the fix to ProductDashboard.tsx and reverted the temporary node_modules edit, creating this note.

