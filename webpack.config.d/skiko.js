// Disable Terser minification and tree shaking for Skiko WASM exports in Webpack
if (config.optimization) {
    config.optimization.minimize = false;
    config.optimization.sideEffects = false;
    config.optimization.usedExports = false;
}
config.devtool = false;
