/* Image size/quality controls — admin + all uploads */
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

  function getQualityPercent() {
    return Math.round(getQuality() * 100);
  }

  function mergeImageSettingsFromRow(row) {
    if (!row || typeof settings === 'undefined') return;
    if (row.image_max_width != null) settings.image_max_width = Number(row.image_max_width);
    if (row.image_quality != null) settings.image_quality = Number(row.image_quality);
    if (settings.image_max_width) localStorage.setItem('shaghaf_img_max_w', String(settings.image_max_width));
    if (settings.image_quality) localStorage.setItem('shaghaf_img_quality', String(settings.image_quality));
  }

  function patchLoadAll() {
    if (typeof loadAll !== 'function' || loadAll._imgSettingsPatched) return;
    var _la = loadAll;
    window.loadAll = async function () {
      await _la.apply(this, arguments);
      try {
        if (typeof sb !== 'undefined') {
          var res = await sb.from('settings').select('image_max_width,image_quality').eq('id', 1).maybeSingle();
          if (res.data) mergeImageSettingsFromRow(res.data);
        }
      } catch (e) {}
      if (typeof settings !== 'undefined') {
        if (settings.image_max_width == null) {
          settings.image_max_width = Number(localStorage.getItem('shaghaf_img_max_w') || DEFAULT_MAX_W);
        }
        if (settings.image_quality == null) {
          settings.image_quality = Number(localStorage.getItem('shaghaf_img_quality') || DEFAULT_QUALITY);
        }
      }
    };
    window.loadAll._imgSettingsPatched = true;
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

  function patchHandleFile() {
    if (typeof handleFileSelect !== 'function' || handleFileSelect._settingsPatched) return;
    window.handleFileSelect = async function (e) {
      var file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        if (typeof showToast === 'function') showToast('\u0627\u062e\u062a\u0631 \u0635\u0648\u0631\u0629', 'error');
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        if (typeof showToast === 'function') showToast('\u0627\u0644\u0645\u0644\u0641 \u0643\u0628\u064a\u0631 \u062c\u062f\u0627\u064b (\u062d\u062f 15MB)', 'error');
        return;
      }
      if (typeof showToast === 'function') showToast('\u062c\u0627\u0631\u064a \u0636\u063a\u0637 \u0627\u0644\u0635\u0648\u0631\u0629...', '');
      try {
        var originalSize = file.size;
        var maxW = getMaxWidth();
        if (typeof uploadTarget !== 'undefined' && uploadTarget) {
          if (uploadTarget.type === 'logo') maxW = Math.min(maxW, 400);
          if (uploadTarget.type === 'favicon') maxW = Math.min(maxW, 128);
        }
        var quality = getQuality();
        var compressed = await compressImage(file, maxW, quality);
        var savedPct = originalSize > 0 ? Math.round((1 - compressed.size / originalSize) * 100) : 0;
        if (typeof showToast === 'function') {
          showToast(
            '\u062a\u0645 \u0627\u0644\u0636\u063a\u0637 (' + Math.round(compressed.size / 1024) + ' KB\u060c \u0648\u0641\u0631 ' + savedPct + '%) \u2014 \u062c\u0627\u0631\u064a \u0627\u0644\u0631\u0641\u0639...',
            ''
          );
        }
        var ext = compressed.type === 'image/webp' ? 'webp' : 'jpg';
        var path =
          (uploadTarget && uploadTarget.type ? uploadTarget.type : 'item') +
          '/' +
          Date.now() +
          '_' +
          Math.random().toString(36).slice(2) +
          '.' +
          ext;
        var bucket = 'site-images';
        var upRes = await sb.storage.from(bucket).upload(path, compressed, {
          upsert: true,
          contentType: compressed.type,
        });
        if (upRes.error) throw upRes.error;
        var pub = sb.storage.from(bucket).getPublicUrl(path);
        var publicUrl = pub && pub.data ? pub.data.publicUrl : '';

        if (uploadTarget && uploadTarget.type === 'logo') {
          var logoInp = document.getElementById('setLogoUrl');
          if (logoInp) logoInp.value = publicUrl;
          if (typeof showToast === 'function') showToast('\u062a\u0645 \u0631\u0641\u0639 \u0627\u0644\u0644\u0648\u062c\u0648 \u2713 \u0627\u0636\u063a\u0637 \u062d\u0641\u0638', 'success');
        } else if (uploadTarget && uploadTarget.type === 'favicon') {
          var favInp = document.getElementById('setFaviconUrl');
          if (favInp) favInp.value = publicUrl;
          if (typeof showToast === 'function') showToast('\u062a\u0645 \u0631\u0641\u0639 \u0627\u0644\u0623\u064a\u0642\u0648\u0646\u0629 \u2713 \u0627\u0636\u063a\u0637 \u062d\u0641\u0638', 'success');
        } else if (uploadTarget && uploadTarget.type === 'item') {
          var inp = document.getElementById('editImage');
          if (inp) inp.value = publicUrl;
          var prev = document.querySelector('#adminBody .upload-preview');
          if (prev) prev.src = publicUrl;
          if (typeof showToast === 'function') {
            showToast('\u062a\u0645 \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629 \u2713 (' + Math.round(compressed.size / 1024) + ' KB)', 'success');
          }
        } else if (uploadTarget && uploadTarget.type === 'hero') {
          if (typeof settings !== 'undefined') settings.hero_image_url = publicUrl;
          var heroPrev = document.getElementById('heroCoverPreview');
          if (heroPrev) {
            heroPrev.src = publicUrl;
            heroPrev.style.display = 'block';
          }
          if (typeof showToast === 'function') showToast('\u062a\u0645 \u0631\u0641\u0639 \u0627\u0644\u063a\u0644\u0627\u0641 \u2713 \u0627\u062d\u0641\u0638 \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a', 'success');
        } else {
          var anyInp = document.getElementById('editImage');
          if (anyInp) anyInp.value = publicUrl;
          if (typeof showToast === 'function') {
            showToast('\u062a\u0645 \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629 \u2713 (' + Math.round(compressed.size / 1024) + ' KB)', 'success');
          }
        }
      } catch (err) {
        console.error(err);
        if (typeof showToast === 'function') {
          showToast('\u0641\u0634\u0644 \u0627\u0644\u0631\u0641\u0639: ' + (err.message || 'Storage'), 'error');
        }
      }
      e.target.value = '';
      uploadTarget = null;
    };
    window.handleFileSelect._settingsPatched = true;
  }

  function patchHeroUpload() {
    if (typeof uploadHeroCover !== 'function' || uploadHeroCover._compressed) return;
    window.uploadHeroCover = function () {
      var input = document.getElementById('fileInput');
      if (!input) return;
      uploadTarget = { type: 'hero' };
      input.click();
    };
    window.uploadHeroCover._compressed = true;
  }

  window.renderImageSettingsAdmin = function () {
    var el = document.getElementById('adminTabContent');
    if (!el) return;
    var maxW = getMaxWidth();
    var qPct = getQualityPercent();
    el.innerHTML =
      '<h3 style="margin-bottom:12px;color:var(--teal-900)">\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0636\u063a\u0637 \u0627\u0644\u0635\u0648\u0631</h3>' +
      '<p style="color:var(--gray-600);font-size:0.9rem;margin-bottom:14px;font-weight:600;line-height:1.6">' +
      '\u062a\u064f\u0637\u0628\u0651\u064e\u0642 \u0647\u0630\u0647 \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b \u0639\u0646\u062f \u0631\u0641\u0639 \u0635\u0648\u0631 \u0627\u0644\u0623\u0635\u0646\u0627\u0641 \u0648\u0627\u0644\u0623\u0642\u0633\u0627\u0645 \u0648\u0627\u0644\u0644\u0648\u062c\u0648 \u0648\u0627\u0644\u063a\u0644\u0627\u0641. ' +
      '\u0627\u0644\u0635\u0648\u0631\u0629 \u062a\u064f\u0635\u063a\u0651\u064e\u0631 \u0648\u062a\u064f\u0636\u063a\u0637 \u0639\u0644\u0649 \u0627\u0644\u062c\u0647\u0627\u0632 \u0642\u0628\u0644 \u0627\u0644\u0631\u0641\u0639.' +
      '</p>' +
      '<div class="form-group">' +
      '<label>\u0623\u0642\u0635\u0649 \u0639\u0631\u0636 \u0644\u0644\u0635\u0648\u0631\u0629 (\u0628\u0643\u0633\u0644)</label>' +
      '<input type="number" id="imgMaxWidth" min="200" max="2000" step="50" value="' +
      maxW +
      '">' +
      '<p style="font-size:0.8rem;color:var(--gray-600);margin-top:6px;font-weight:600">\u0645\u0648\u0635\u0649 \u0628\u0647: 800\u20131000 \u0644\u0644\u0645\u0648\u0628\u0627\u064a\u0644. \u0627\u0644\u0644\u0648\u062c\u0648 \u0648\u0627\u0644\u0623\u064a\u0642\u0648\u0646\u0629 \u0623\u0635\u063a\u0631 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b.</p>' +
      '</div>' +
      '<div class="form-group">' +
      '<label>\u062c\u0648\u062f\u0629 \u0627\u0644\u0636\u063a\u0637: <span id="imgQualityLabel">' +
      qPct +
      '</span>%</label>' +
      '<input type="range" id="imgQuality" min="40" max="100" step="1" value="' +
      qPct +
      '" style="width:100%">' +
      '<p style="font-size:0.8rem;color:var(--gray-600);margin-top:6px;font-weight:600">\u0645\u0648\u0635\u0649 \u0628\u0647: 80\u201385% \u2014 \u062a\u0648\u0627\u0632\u0646 \u0628\u064a\u0646 \u0627\u0644\u0648\u0636\u0648\u062d \u0648\u062d\u062c\u0645 \u0627\u0644\u0645\u0644\u0641</p>' +
      '</div>' +
      '<button type="button" class="btn-submit" onclick="saveImageSettings()">\u062d\u0641\u0638 \u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0635\u0648\u0631</button>' +
      '<p style="font-size:0.85rem;color:var(--teal-700);margin-top:14px;font-weight:700">\u0627\u0644\u0642\u064a\u0645 \u0627\u0644\u062d\u0627\u0644\u064a\u0629: \u0639\u0631\u0636 ' +
      maxW +
      'px \u00b7 \u062c\u0648\u062f\u0629 ' +
      qPct +
      '%</p>';

    var range = document.getElementById('imgQuality');
    if (range) {
      range.oninput = function () {
        var lab = document.getElementById('imgQualityLabel');
        if (lab) lab.textContent = range.value;
      };
    }
  };

  window.saveImageSettings = async function () {
    var maxW = Number((document.getElementById('imgMaxWidth') || {}).value || DEFAULT_MAX_W);
    var qPct = Number((document.getElementById('imgQuality') || {}).value || DEFAULT_QUALITY);
    if (maxW < 200) maxW = 200;
    if (maxW > 2000) maxW = 2000;
    if (qPct < 40) qPct = 40;
    if (qPct > 100) qPct = 100;

    if (typeof settings === 'undefined') window.settings = {};
    settings.image_max_width = maxW;
    settings.image_quality = qPct;
    localStorage.setItem('shaghaf_img_max_w', String(maxW));
    localStorage.setItem('shaghaf_img_quality', String(qPct));

    try {
      if (typeof sb !== 'undefined') {
        var res = await sb
          .from('settings')
          .update({ image_max_width: maxW, image_quality: qPct })
          .eq('id', 1);
        if (res.error) {
          console.warn('image settings save:', res.error.message);
          if (typeof showToast === 'function') {
            showToast('\u062d\u064f\u062d\u0641\u0638 \u0645\u062d\u0644\u064a\u0627\u064b. \u0623\u0636\u0641 \u0623\u0639\u0645\u062f\u0629 \u0627\u0644\u0642\u0627\u0639\u062f\u0629 \u0644\u064a\u0632\u0627\u0645\u0646', 'success');
          }
          return;
        }
      }
      if (typeof showToast === 'function') showToast('\u062a\u0645 \u062d\u0641\u0638 \u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0635\u0648\u0631 \u2713', 'success');
    } catch (err) {
      if (typeof showToast === 'function') showToast('\u062d\u064f\u062d\u0641\u0638 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u062c\u0647\u0627\u0632', 'success');
    }
  };

  function patchAdminPanel() {
    if (typeof renderAdminPanel !== 'function' || renderAdminPanel._imgSettingsTab) return;
    var _rap = renderAdminPanel;
    window.renderAdminPanel = function () {
      _rap();
      var tabs = document.querySelector('.admin-tabs');
      if (tabs && !tabs.querySelector('[data-tab="images"]')) {
        var btn = document.createElement('button');
        btn.className = 'admin-tab' + (adminTab === 'images' ? ' active' : '');
        btn.setAttribute('data-tab', 'images');
        btn.textContent = '\u0627\u0644\u0635\u0648\u0631';
        btn.onclick = function () {
          adminTab = 'images';
          renderAdminPanel();
        };
        tabs.appendChild(btn);
      }
      if (tabs) {
        tabs.querySelectorAll('.admin-tab').forEach(function (b) {
          if (b.getAttribute('data-tab') === 'images') {
            b.classList.toggle('active', adminTab === 'images');
          } else if (adminTab === 'images') {
            b.classList.remove('active');
          }
        });
      }
      if (adminTab === 'images') {
        renderImageSettingsAdmin();
      }
    };
    window.renderAdminPanel._imgSettingsTab = true;
  }

  var tries = 0;
  var t = setInterval(function () {
    tries++;
    patchLoadAll();
    patchCompress();
    patchHandleFile();
    patchHeroUpload();
    patchAdminPanel();
    if (tries > 50) clearInterval(t);
  }, 200);
})();
