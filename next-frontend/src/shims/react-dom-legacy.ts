/**
 * react-dom-legacy.ts — Turbopack-safe compatibility shim
 *
 * white-web-sdk v2.16.54 was written for React 16 and uses:
 *   fl = P(require("react-dom"))   // interop wrap
 *   fl.render(element, container)
 *   fl.unmountComponentAtNode(container)
 *   kS.createPortal(...)
 *   Qd.unstable_batchedUpdates(...)
 *
 * React 19 dropped `render` and `unmountComponentAtNode` entirely.
 * This shim restores them using createRoot while re-exporting all real
 * React 19 react-dom APIs so the rest of the app is unaffected.
 *
 * IMPORTANT — No import from 'react-dom'
 * ----------------------------------------
 * Turbopack's resolveAlias is global: every `import 'react-dom'` across
 * the entire app lands here. Importing from 'react-dom' inside this file
 * would create a circular resolution. Instead we import from:
 *   • next/dist/compiled/react-dom  — the real React 19 named surface
 *   • react-dom/client              — createRoot / hydrateRoot
 * Neither of those specifiers is re-aliased by Turbopack.
 */

// ─── Real React 19 react-dom surface (via Next's compiled copy) ─────────────
import type { ReactNode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';

// Import the compiled copy which is NOT aliased — safe from circular dep.
// We use a type-cast because Next's internal typings may be incomplete.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ReactDOM = require('next/dist/compiled/react-dom') as {
  createPortal: typeof import('react-dom')['createPortal'];
  flushSync: typeof import('react-dom')['flushSync'];
  unstable_batchedUpdates: (fn: () => void) => void;
  [key: string]: unknown;
};

// ─── Named re-exports (React 19 API — app code uses these) ──────────────────
export const createPortal          = _ReactDOM.createPortal;
export const flushSync             = _ReactDOM.flushSync;
export const unstable_batchedUpdates = _ReactDOM.unstable_batchedUpdates;
export { createRoot, hydrateRoot };

// Forward every other key from the compiled react-dom so unknown named imports
// still resolve rather than throwing at runtime.
// (e.g. preload, prefetchDNS, preinit, useFormStatus, …)
export const preconnect      = (_ReactDOM as any).preconnect;
export const prefetchDNS     = (_ReactDOM as any).prefetchDNS;
export const preinit         = (_ReactDOM as any).preinit;
export const preinitModule   = (_ReactDOM as any).preinitModule;
export const preload         = (_ReactDOM as any).preload;
export const preloadModule   = (_ReactDOM as any).preloadModule;
export const requestFormReset = (_ReactDOM as any).requestFormReset;
export const useFormState    = (_ReactDOM as any).useFormState;
export const useFormStatus   = (_ReactDOM as any).useFormStatus;
export const version         = (_ReactDOM as any).version;

// ─── Legacy render shim — the core fix ──────────────────────────────────────
// WeakMap lets us reuse the same Root for repeated renders into the same
// container, matching the old ReactDOM.render() behaviour.

const rootCache = new WeakMap<Element, Root>();

/**
 * ReactDOM.render(element, container) — React 16/17/18 legacy API.
 * Implemented via createRoot so it works in React 19.
 */
export function render(element: ReactNode, container: Element | null): void {
  if (!container) {
    console.warn('[react-dom-legacy shim] render() called with a null container.');
    return;
  }
  let root = rootCache.get(container);
  if (!root) {
    root = createRoot(container);
    rootCache.set(container, root);
  }
  root.render(element as any);
}

/**
 * ReactDOM.unmountComponentAtNode(container) — React 16/17/18 legacy API.
 */
export function unmountComponentAtNode(container: Element | null): boolean {
  if (!container) return false;
  const root = rootCache.get(container);
  if (root) {
    root.unmount();
    rootCache.delete(container);
    return true;
  }
  return false;
}

// ─── Default export ──────────────────────────────────────────────────────────
// white-web-sdk uses the interop helper P(require("react-dom")) which accesses:
//   • named exports  → covered by the `export function render` etc. above
//   • .default       → accessed by some bundler interop patterns
//
// We spread _ReactDOM so that runtime property lookups on the default object
// (e.g. `fl.createPortal`, `fl.unstable_batchedUpdates`) keep working.
const shim = {
  ..._ReactDOM,
  createRoot,
  hydrateRoot,
  render,
  unmountComponentAtNode,
};

export default shim;
