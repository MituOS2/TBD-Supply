(function () {
  var finished = false;
  var root = null;
  var appBar = null;
  var appPct = null;

  function doFinish() {
    if (finished) return;
    finished = true;
    root = root || document.getElementById("loading");
    appBar = appBar || document.getElementById("loading-bar-fill-app");
    appPct = appPct || document.getElementById("loading-percent-app");
    if (appBar) appBar.style.width = "100%";
    if (appPct) appPct.textContent = "100%";
    if (root) {
      root.classList.add("hidden");
      setTimeout(function () {
        if (root && root.parentNode) {
          root.parentNode.removeChild(root);
        }
      }, 300);
    }
  }

  var origFetch = window.fetch;
  window.fetch = function (input, init) {
    var url;
    try {
      url = typeof input === "string" ? input : (input && input.url ? input.url : "");
    } catch (e) {
      url = "";
    }
    if (url && url.indexOf("fonts.gstatic.com") !== -1) {
      return Promise.reject(new Error("External fonts disabled"));
    }
    return origFetch.apply(this, arguments);
  };

  window.__miuixLoading = {
    finish: doFinish
  };

  // Fail-safe: Ensure loading overlay is dismissed within 3.5s max
  setTimeout(doFinish, 3500);
})();
