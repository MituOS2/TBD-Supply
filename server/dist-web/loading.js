(function () {
  var origFetch = window.fetch;
  var loaded = 0;
  var total = 0;
  var sawLength = false;
  var finished = false;
  var indeterminate = false;
  var startedFill = false;
  var reachedHundred = false;
  var appBar = null;
  var appPct = null;
  var shownApp = 0;
  var targetApp = 0;

  function shouldTrack(url) {
    return /\.(wasm|mjs)(\?|#|$)/.test(url);
  }

  function setIndeterminate(on) {
    if (indeterminate === on) return;
    indeterminate = on;
    var root = document.getElementById("loading");
    if (root) root.classList.toggle("indeterminate", on);
    if (on && appBar) appBar.style.width = "";
  }

  function tick() {
    if (finished) return;
    if (!appBar) appBar = document.getElementById("loading-bar-fill-app");
    if (!appPct) appPct = document.getElementById("loading-percent-app");

    if (sawLength && total > 0) {
      var fa = loaded / total;
      if (fa > 1) fa = 1;
      if (fa > targetApp) targetApp = fa;
    }
    shownApp += (targetApp - shownApp) * 0.12;
    if (!indeterminate) {
      if (targetApp >= 1 && shownApp >= 0.995) {
        shownApp = 1;
        if (appBar) appBar.style.width = "100%";
        if (appPct) appPct.textContent = "100%";
        if (!reachedHundred) {
          reachedHundred = true;
          setTimeout(function () {
            if (!finished) setIndeterminate(true);
          }, 200);
        }
      } else {
        if (appBar) appBar.style.width = (shownApp * 100).toFixed(1) + "%";
        if (appPct) appPct.textContent = Math.round(shownApp * 100) + "%";
      }
    }
    requestAnimationFrame(tick);
  }

  window.fetch = function (input, init) {
    var url;
    try {
      url = typeof input === "string" ? input : input.url;
    } catch (e) {
      url = "";
    }
    if (url && url.startsWith("https://fonts.gstatic.com/s/")) {
      return Promise.reject(new Error("External fonts disabled by CSP"));
    }
    if (!url || !shouldTrack(url)) return origFetch(input, init);
    return origFetch(input, init).then(function (resp) {
      try {
        if (!resp || !resp.body || !resp.ok) return resp;
        var len = resp.headers.get("content-length");
        if (len) {
          total += parseInt(len, 10) || 0;
          sawLength = true;
        }
        var reader = resp.body.getReader();
        var stream = new ReadableStream({
          start: function (controller) {
            function pump() {
              reader
                .read()
                .then(function (r) {
                  if (r.done) {
                    controller.close();
                    return;
                  }
                  loaded += r.value.byteLength;
                  controller.enqueue(r.value);
                  pump();
                })
                .catch(function (err) {
                  controller.error(err);
                });
            }
            pump();
          },
        });
        return new Response(stream, {
          status: resp.status,
          statusText: resp.statusText,
          headers: resp.headers,
        });
      } catch (e) {
        return resp;
      }
    });
  };

  setTimeout(function () {
    if (!finished && !sawLength) setIndeterminate(true);
  }, 1200);

  window.__miuixLoading = {
    finish: function () {
      finished = true;
      var root = document.getElementById("loading");
      var a = document.getElementById("loading-bar-fill-app");
      var ap = document.getElementById("loading-percent-app");
      if (!indeterminate) {
        if (a) a.style.width = "100%";
        if (ap) ap.textContent = "100%";
      }
      if (root) {
        root.classList.add("hidden");
        setTimeout(function () {
          if (root.parentNode) root.parentNode.removeChild(root);
        }, 300);
      }
    },
  };

  if (!startedFill) {
    startedFill = true;
    requestAnimationFrame(tick);
  }
})();
