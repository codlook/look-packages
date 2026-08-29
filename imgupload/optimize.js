// optimize.js — client-side image optimizer for LOOK apps.
// Converts a user-selected image to WebP (falling back to JPEG where WebP encoding isn't
// supported, e.g. Safari), optionally downscaling to a max size, then hands you a Blob to
// upload. The heavy work (decode + encode) runs in the browser's native codecs — fast, and
// the server just stores the small result. Transparency is preserved (WebP lossy+alpha).
//
//   const blob = await optimizeImage(file, { maxWidth: 1600, quality: 0.8 });
//   // then upload `blob` (see uploadOptimized) — it's a WebP (or JPEG fallback).

(function (global) {
  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function (e) { URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    });
  }
  function fit(w, h, maxW, maxH) {
    var s = Math.min(1, maxW / w, maxH / h);
    return { w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)) };
  }
  function toBlob(canvas, type, q) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (b) { resolve(b); }, type, q);
    });
  }

  // optimizeImage(file, opts) -> Promise<Blob>
  //   opts: maxWidth (1600), maxHeight (1600), quality (0.8), format ("image/webp")
  async function optimizeImage(file, opts) {
    opts = opts || {};
    var maxW = opts.maxWidth || 1600;
    var maxH = opts.maxHeight || 1600;
    var quality = opts.quality == null ? 0.8 : opts.quality;
    var format = opts.format || "image/webp";

    var img = await loadImage(file);
    var d = fit(img.naturalWidth, img.naturalHeight, maxW, maxH);
    var canvas = document.createElement("canvas");
    canvas.width = d.w;
    canvas.height = d.h;
    canvas.getContext("2d").drawImage(img, 0, 0, d.w, d.h);

    var blob = await toBlob(canvas, format, quality);
    // WebP encoding unsupported (Safari) -> fall back to JPEG
    if (!blob || (format === "image/webp" && blob.type !== "image/webp")) {
      blob = await toBlob(canvas, "image/jpeg", quality);
    }
    return blob;
  }

  // uploadOptimized(file, url, opts) -> Promise<Response>
  //   optimizes then POSTs the blob as multipart field "image" to `url`.
  async function uploadOptimized(file, url, opts) {
    var blob = await optimizeImage(file, opts);
    var ext = blob.type === "image/webp" ? "webp" : "jpg";
    var fd = new FormData();
    fd.append("image", blob, "upload." + ext);
    return fetch(url, { method: "POST", body: fd });
  }

  global.optimizeImage = optimizeImage;
  global.uploadOptimized = uploadOptimized;
})(window);
