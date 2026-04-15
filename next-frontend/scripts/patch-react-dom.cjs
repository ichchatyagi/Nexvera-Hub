#!/usr/bin/env node
/**
 * patch-react-dom.cjs
 *
 * Fixes the white-web-sdk + React 19 incompatibility by patching
 * white-web-sdk/index.js directly at the require("react-dom") call-site.
 *
 * WHY THIS APPROACH (v3):
 * ─────────────────────────────────────────────────────────────────────────
 * • Next.js 16 uses Turbopack by default.
 * • Turbopack's resolveAlias does NOT intercept CJS require() calls from
 *   within node_modules packages.
 * • Patching react-dom/index.js is not effective because Turbopack maintains
 *   a persistent module cache (.next) keyed by the SOURCE file path+hash of
 *   the requiring module (white-web-sdk), not react-dom. So react-dom changes
 *   don't invalidate the white-web-sdk chunk.
 * • Patching white-web-sdk/index.js directly changes the SOURCE of the chunk,
 *   which invalidates Turbopack's cache and forces a fresh compile.
 *
 * WHAT THE PATCH DOES:
 * ─────────────────────────────────────────────────────────────────────────
 * white-web-sdk does:
 *   fl = P(require("react-dom"))
 *   ...
 *   fl.render(element, container)           // React 16 API — removed in React 19
 *   fl.unmountComponentAtNode(container)    // React 16 API — removed in React 19
 *
 * We replace the require() call with an IIFE that:
 *   1. require()s react-dom normally
 *   2. If render() is missing (React 19), injects it via createRoot
 *   3. Returns the patched module object
 *
 * IDEMPOTENCY: Both patches check a sentinel string before writing.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── Patch 1: white-web-sdk/index.js ──────────────────────────────────────

const SDK_SENTINEL = '/* [nexvera] react-dom render shim */';
const sdkPath = path.join(__dirname, '..', 'node_modules', 'white-web-sdk', 'index.js');

function patchSdk() {
  if (!fs.existsSync(sdkPath)) {
    console.warn('[patch] white-web-sdk/index.js not found — skipping.');
    return;
  }

  const src = fs.readFileSync(sdkPath, 'utf8');

  if (src.includes(SDK_SENTINEL)) {
    console.log('[patch] white-web-sdk already patched — nothing to do.');
    return;
  }

  const needle = 'fl=P(require("react-dom"))';
  if (!src.includes(needle)) {
    console.warn('[patch] Could not find needle in white-web-sdk/index.js:\n ', needle);
    return;
  }

  // Replacement: IIFE that wraps require("react-dom") and injects the
  // missing render / unmountComponentAtNode functions if absent.
  const replacement =
    `fl=P(${SDK_SENTINEL}(function(){` +
      `var _rd=require("react-dom");` +
      `if(typeof _rd.render!=="function"){` +
        `var _rr=new WeakMap(),_cr=require("react-dom/client").createRoot;` +
        `_rd.render=function(e,c){if(!c)return;var r=_rr.get(c);if(!r){r=_cr(c);_rr.set(c,r)}r.render(e)};` +
        `_rd.unmountComponentAtNode=function(c){if(!c)return false;var r=_rr.get(c);if(r){r.unmount();_rr.delete(c);return true}return false};` +
      `}` +
      `return _rd;` +
    `}()))`;

  const patched = src.replace(needle, replacement);
  fs.writeFileSync(sdkPath, patched, 'utf8');
  console.log('[patch] ✓ Patched white-web-sdk/index.js with react-dom render shim.');
}

// ─── Patch 2: react-dom/index.js (belt-and-suspenders) ───────────────────

const RD_SENTINEL = '// [nexvera-legacy-shim] render + unmountComponentAtNode';
const rdxPath = path.join(__dirname, '..', 'node_modules', 'react-dom', 'index.js');

function patchReactDom() {
  if (!fs.existsSync(rdxPath)) {
    console.warn('[patch] react-dom/index.js not found — skipping.');
    return;
  }

  const current = fs.readFileSync(rdxPath, 'utf8');

  if (current.includes(RD_SENTINEL)) {
    console.log('[patch] react-dom already patched — nothing to do.');
    return;
  }

  const rdPatch = `

${RD_SENTINEL}
// Injected by scripts/patch-react-dom.cjs (postinstall).
(function patchLegacyRender() {
  var exp = module.exports;
  if (typeof exp.render === 'function') return;
  var _createRoot = null;
  function getCreateRoot() {
    if (!_createRoot) _createRoot = require('react-dom/client').createRoot;
    return _createRoot;
  }
  var _roots = new WeakMap();
  exp.render = function render(element, container) {
    if (!container) return;
    var root = _roots.get(container);
    if (!root) { root = getCreateRoot()(container); _roots.set(container, root); }
    root.render(element);
  };
  exp.unmountComponentAtNode = function unmountComponentAtNode(container) {
    if (!container) return false;
    var root = _roots.get(container);
    if (root) { root.unmount(); _roots.delete(container); return true; }
    return false;
  };
}());
`;

  fs.writeFileSync(rdxPath, current + rdPatch, 'utf8');
  console.log('[patch] ✓ Patched react-dom/index.js with legacy render shim.');
}

// ─── Clear Turbopack cache ─────────────────────────────────────────────────
// Turbopack stores compiled chunks in .next/turbopack and .next/dev.
// When node_modules source files are patched, these caches MUST be cleared
// so Turbopack re-reads and recompiles from the patched source.

function clearNextCache() {
  const nextDir = path.join(__dirname, '..', '.next');
  if (!fs.existsSync(nextDir)) {
    console.log('[patch] No .next directory found — nothing to clear.');
    return;
  }
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('[patch] ✓ Cleared .next directory (Turbopack will recompile from patched sources).');
}

// ─── Run ──────────────────────────────────────────────────────────────────
patchSdk();
patchReactDom();
clearNextCache();
