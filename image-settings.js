/* Image compression defaults (no admin tab) */
(function () {
  var DEFAULT_MAX_W = 1000;
  var DEFAULT_QUALITY = 82;

  function getMaxWidth() {
    var v = (typeof settings !== 'undefined' && settings.image_max_width != null)
      ? Number(settings.image_max_width)
      : Number(localStorage.getItem('shaghaf_img_max_w') || DEFAULT_MAX_W);
    if (!v || v < 200) v = DEFAULT_MAX_W;
    if (v > 2000) v = 2000;
    return v;
  }

  function getQuality() {
    var v = (typeof settings !== 'undefined' && settings.image_quality != null)
      ? Number(settings.image_quality)
      : Number(localStorage.getItem('shaghaf_img_quality') || DEFAULT_QUALITY);
    if (!v || v < 40) v = DEFAULT_QUALITY;
    if (v > 100) v = 100;
    return v / 100;
  }

  function patchCompress() {
    if (typeof compressImage !== 'function' || compressImage._settingsPatched) return;
    var _orig = compressImage;
    window.compressImage = function (file, maxWidth, quality) {
      var mw = maxWidth != null ? maxWidth : getMaxWidth();
      var q = quality != null ? quality : getQuality();
      return _orig(file, mw, q);
    };
    window.compressImage._settingsPatched = true;
  }

  function patchAdminPanel() {
    // Remove legacy images settings tab if present
    if (typeof renderAdminPanel !== 'function' || renderAdminPanel._imgSettingsTab) return;
    var _rap = renderAdminPanel;
    window.renderAdminPanel = function () {
      _rap();
      var tabs = document.querySelector('.admin-tabs');
      if (tabs) {
        var old = tabs.querySelector('[data-tab="images"]');
        if (old) old.remove();
      }
      if (typeof adminTab !== 'undefined' && adminTab === 'images') {
        adminTab = 'main';
        try { _rap(); } catch (e) {}
      }
    };
    window.renderAdminPanel._imgSettingsTab = true;
  }

  var tries = 0;
  var t = setInterval(function () {
    tries++;
    patchCompress();
    patchAdminPanel();
    if (tries > 40) clearInterval(t);
  }, 200);
})();
