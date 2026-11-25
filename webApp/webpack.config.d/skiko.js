// Prevent Webpack production optimization from tree-shaking Skiko WASM/JS binding exports
if (config.optimization) {
    config.optimization.sideEffects = false;
    config.optimization.usedExports = false;
}
