import React from 'react';
import CustomText from '@components/ui/CustomText';

/**
 * Sanitize utility to force-wrap any stray strings in CustomText
 * This is a defensive utility to prevent "Text strings must be rendered within a <Text> component" errors
 */
export function sanitize(node: any): any {
  if (node == null || node === false) return null;

  if (typeof node === 'string' || typeof node === 'number') {
    if (__DEV__) {
      console.warn('🚨 SANITIZE: Wrapping stray string/number:', node);
    }
    return <CustomText>{String(node)}</CustomText>;
  }

  if (Array.isArray(node)) {
    return node.map(sanitize);
  }

  if (React.isValidElement(node)) {
    const props = node.props || {};
    const children = 'children' in props ? sanitize(props.children) : props.children;
    return React.cloneElement(node, { ...props, children });
  }

  return null;
}
