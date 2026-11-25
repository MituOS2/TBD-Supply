// Prevent Webpack from wrapping modules in eval() and prevent tree-shaking of Skiko WASM exports
config.devtool = false;

if (config.optimization) {
    config.optimization.sideEffects = false;
    config.optimization.usedExports = false;
    config.optimization.minimize = false;
}
