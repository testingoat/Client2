# ScrollView onScroll Error Fix

## Overview
This document outlines the solution for fixing the ScrollView onScroll error: `TypeError: _this.props.onScroll is not a function (it is Object)` in the ProductDashboard component.

## Problem Analysis
The error occurs because the `onScroll` prop is being passed an object (likely from `Animated.event`) instead of a proper function. In React Native's ScrollView implementation, the `onScroll` prop must be a function that accepts a scroll event object.

Looking at the codebase, the issue is in `ProductDashboard.tsx` where `Animated.event` is being used directly as the `onScroll` prop without proper handling.

## Solution Design

### Root Cause
In the ProductDashboard component, the `onScroll` prop is assigned directly to `RNAnimated.event()` which returns an object rather than a function:

```tsx
onScroll={RNAnimated.event(
  [{nativeEvent: {contentOffset: {y: scrollY}}}],
  {useNativeDriver: true}
)}
```

### Fix Implementation
The solution is to wrap the `Animated.event` in a proper function that can be called by the ScrollView:

```tsx
onScroll={(event) => {
  // Handle the animated event
  const animatedEvent = RNAnimated.event(
    [{nativeEvent: {contentOffset: {y: scrollY}}}],
    {useNativeDriver: true}
  );
  animatedEvent(event);
  
  // Any additional scroll handling can be added here
}}
```

### Alternative Solution
Use the `useAnimatedScrollHandler` hook from `react-native-reanimated` if available:

```tsx
const scrollHandler = useAnimatedScrollHandler({
  onScroll: (event) => {
    // Update animated value directly
    scrollY.value = event.contentOffset.y;
  },
});
```

## Implementation Steps

1. Open `src/features/dashboard/ProductDashboard.tsx`
2. Locate the ScrollView component (around line 162-170)
3. Replace the direct `Animated.event` usage in the `onScroll` prop with a proper function wrapper
4. Save the file and rebuild the application
5. Test the scroll functionality to ensure animations work correctly
6. Verify no regressions in other scroll-dependent features (header animations, back-to-top button)

## Files to Modify

1. `src/features/dashboard/ProductDashboard.tsx` - Primary location of the issue (only instance found)

## Specific Fix for ProductDashboard.tsx

Change the ScrollView component's onScroll prop from:

```tsx
<ScrollView
  ref={scrollViewRef}
  style={styles.scrollView}
  showsVerticalScrollIndicator={false}
  scrollEventThrottle={16}
  onScroll={RNAnimated.event(
    [{nativeEvent: {contentOffset: {y: scrollY}}}],
    {useNativeDriver: true}
  )}
>
```

to:

```tsx
<ScrollView
  ref={scrollViewRef}
  style={styles.scrollView}
  showsVerticalScrollIndicator={false}
  scrollEventThrottle={16}
  onScroll={(event) => {
    const animatedEvent = RNAnimated.event(
      [{nativeEvent: {contentOffset: {y: scrollY}}}],
      {useNativeDriver: true}
    );
    animatedEvent(event);
  }}
>
```

## Testing Plan

1. Verify ScrollView scrolls properly without errors
2. Confirm animated values update correctly during scroll
3. Check that all scroll-dependent UI elements (header animations, back-to-top button) work as expected
4. Test on both iOS and Android platforms

## Risk Assessment

- Low risk as this is a straightforward prop correction
- No dependency changes required
- Minimal impact on existing functionality
- Backward compatible solution

## Performance Considerations

- The fix maintains the use of `useNativeDriver: true` for optimal performance
- No additional re-renders or performance overhead introduced
- Animation流畅度 should remain unaffected