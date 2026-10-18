/* Image crop / zoom editor before upload — Shaghaf */
(function () {
  var cropper = null;
  var pendingFile = null;
  var cropperLoaded = false;

  function loadCropperLib() {
    return new Promise(function (resolve, reject) {
      if (window.Cropper) {
        cropperLoaded = true;
        return resolve();
      }
      if (!document.querySelector('link[data-cropper]')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css';
        link.setAttribute('data-cropper', '1');
        document.head.appendChild(link);
      }
      if (!document.querySelector('script[data-cropper]')) {
        var s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js';
        s.setAttribute('data-cropper', '1');
        s.onload = function () {
          cropperLoaded = true;
          resolve();
        };
        s.onerror = function () {
          reject(new Error('\u0641\u0634\u0644 \u062a\u062d\u0645\u064a\u0644 \u0645\u062d\u0631\u0631 \u0627\u0644\u0635\u0648\u0631'));
        };
        document.head.appendChild(s);
      } else {
        var tries = 0;
        var t = setInterval(function () {
          tries++;
          if (window.Cropper) {
            clearInterval(t);
            cropperLoaded = true;
            resolve();
          } else if (tries > 40) {
            clearInterval(t);
            reject(new Error('\u0641\u0634\u0644 \u062a\u062d\u0645\u064a\u0644 \u0645\u062d\u0631\u0631 \u0627\u0644\u0635\u0648\u0631'));
          }
        }, 100);
      }
    });
  }

  function ensureEditorModal() {
    if (document.getElementById('imageEditorModal')) return;
    var el = document.createElement('div');
    el.id = 'imageEditorModal';
    el.className = 'img-editor-overlay';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="img-editor-card" role="dialog" aria-modal="true">' +
      '  <div class="img-editor-header">' +
      '    <h3>\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0635\u0648\u0631\u0629</h3>' +
      '    <button type="button" class="img-editor-close" id="imgEditorClose">&times;</button>' +
      '  </div>' +
      '  <div class="img-editor-stage">' +
      '    <img id="imgEditorImage" alt="\u0645\u0639\u0627\u064a\u0646\u0629">' +
      '  </div>' +
      '  <div class="img-editor-tools">' +
      '    <button type="button" class="img-tool" id="imgZoomIn" title="\u062a\u0643\u0628\u064a\u0631">\uff0b</button>' +
      '    <button type="button" class="img-tool" id="imgZoomOut" title="\u062a\u0635\u063a\u064a\u0631">\uff0d</button>' +
      '    <button type="button" class="img-tool" id="imgRotateL" title="\u062a\u062f\u0648\u064a\u0631 \u064a\u0633\u0627\u0631">\u21ba</button>' +
      '    <button type="button" class="img-tool" id="imgRotateR" title="\u062a\u062f\u0648\u064a\u0631 \u064a\u0645\u064a\u0646">\u21bb</button>' +
      '    <button type="button" class="img-tool" id="imgReset" title="\u0625\u0639\u0627\u062f\u0629">\u27f2</button>' +
      '  </div>' +
      '  <p class="img-editor-hint">\u0627\u0633\u062d\u0628 \u0644\u0644\u062a\u062d\u0631\u064a\u0643 \u00b7 \u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0632\u0648\u0627\u064a\u0627 \u0644\u0644\u0642\u0635 \u00b7 \u0643\u0628\u0651\u0650\u0631 \u0648\u0635\u063a\u0651\u0650\u0631 \u0643\u0645\u0627 \u062a\u0631\u064a\u062f</p>' +
      '  <div class="img-editor-actions">' +
      '    <button type="button" class="img-btn cancel" id="imgEditorCancel">\u0625\u0644\u063a\u0627\u0621</button>' +
      '    <button type="button" class="img-btn primary" id="imgEditorApply">\u062a\u0637\u0628\u064a\u0642 \u0648\u0627\u0644\u0631\u0641\u0639</button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(el);

    document.getElementById('imgEditorClose').onclick = closeEditor;
    document.getElementById('imgEditorCancel').onclick = closeEditor;
    document.getElementById('imgEditorApply').onclick = applyAndUpload;
    document.getElementById('imgZoomIn').onclick = function () {
      if (cropper) cropper.zoom(0.1);
    };
    document.getElementById('imgZoomOut').onclick = function () {
      if (cropper) cropper.zoom(-0.1);
    };
    document.getElementById('imgRotateL').onclick = function () {
      if (cropper) cropper.rotate(-90);
    };
    document.getElementById('imgRotateR').onclick = function () {
      if (cropper) cropper.rotate(90);
    };
    document.getElementById('imgReset').onclick = function () {
      if (cropper) cropper.reset();
    };
    el.addEventListener('click', function (e) {
      if (e.target === el) closeEditor();
    });
  }

  function closeEditor() {
    var modal = document.getElementById('imageEditorModal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
    if (cropper) {
      try {
        cropper.destroy();
      } catch (e) {}
      cropper = null;
    }
    var img = document.getElementById('imgEditorImage');
    if (img) {
      if (img.src && img.src.indexOf('blob:') === 0) URL.revokeObjectURL(img.src);
      img.removeAttribute('src');
    }
    pendingFile = null;
  }

  function openEditor(file) {
    pendingFile = file;
    ensureEditorModal();
    var modal = document.getElementById('imageEditorModal');
    var img = document.getElementById('imgEditorImage');
    if (cropper) {
      try {
        cropper.destroy();
      } catch (e) {}
      cropper = null;
    }
    var url = URL.createObjectURL(file);
    img.onload = function () {
      cropper = new Cropper(img, {
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 1,
        responsive: true,
        background: false,
        movable: true,
        zoomable: true,
        rotatable: true,
        scalable: true,
        aspectRatio: NaN,
        guides: true,
        center: true,
        highlight: true,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: true,
      });
    };
    img.src = url;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function getMaxWidth() {
    var v =
      typeof settings !== 'undefined' && settings.image_max_width != null
        ? Number(settings.image_max_width)
        : Number(localStorage.getItem('shaghaf_img_max_w') || 1000);
    if (!v || v < 200) v = 1000;
    if (v > 2000) v = 2000;
    if (typeof uploadTarget !== 'undefined' && uploadTarget) {
      if (uploadTarget.type === 'logo') v = Math.min(v, 400);
      if (uploadTarget.type === 'favicon') v = Math.min(v, 128);
    }
    return v;
  }

  function getQuality() {
    var v =
      typeof settings !== 'undefined' && settings.image_quality != null
        ? Number(settings.image_quality)
        : Number(localStorage.getItem('shaghaf_img_quality') || 82);
    if (!v || v < 40) v = 82;
    if (v > 100) v = 100;
    return v / 100;
  }

  async function applyAndUpload() {
    if (!cropper) return;
    var applyBtn = document.getElementById('imgEditorApply');
    if (applyBtn) {
      applyBtn.disabled = true;
      applyBtn.textContent = '\u062c\u0627\u0631\u064a \u0627\u0644\u0645\u0639\u0627\u0644\u062c\u0629...';
    }
    try {
      var maxW = getMaxWidth();
      var quality = getQuality();
      var canvas = cropper.getCroppedCanvas({
        maxWidth: maxW,
        maxHeight: maxW,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      if (!canvas) throw new Error('\u0641\u0634\u0644 \u0627\u0644\u0642\u0635');

      var blob = await new Promise(function (resolve, reject) {
        if (canvas.toBlob) {
          canvas.toBlob(
            function (b) {
              if (b && b.size > 0) return resolve(b);
              canvas.toBlob(
                function (b2) {
                  if (b2) resolve(b2);
                  else reject(new Error('\u0641\u0634\u0644 \u0627\u0644\u062a\u0635\u062f\u064a\u0631'));
                },
                'image/jpeg',
                quality
              );
            },
            'image/webp',
            quality
          );
        } else {
          reject(new Error('\u0627\u0644\u0645\u062a\u0635\u0641\u062d \u0644\u0627 \u064a\u062f\u0639\u0645 \u0627\u0644\u062a\u0635\u062f\u064a\u0631'));
        }
      });

      var ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
      var file = new File([blob], 'edited.' + ext, { type: blob.type });

      closeEditor();
      if (typeof showToast === 'function') {
        showToast('\u062c\u0627\u0631\u064a \u0627\u0644\u0631\u0641\u0639 (' + Math.round(file.size / 1024) + ' KB)...', '');
      }
      await uploadProcessedFile(file);
    } catch (err) {
      console.error(err);
      if (typeof showToast === 'function') showToast('\u0641\u0634\u0644: ' + (err.message || ''), 'error');
    } finally {
      if (applyBtn) {
        applyBtn.disabled = false;
        applyBtn.textContent = '\u062a\u0637\u0628\u064a\u0642 \u0648\u0627\u0644\u0631\u0641\u0639';
      }
    }
  }

  async function uploadProcessedFile(file) {
    var ext = file.type === 'image/webp' ? 'webp' : 'jpg';
    var path =
      (typeof uploadTarget !== 'undefined' && uploadTarget && uploadTarget.type
        ? uploadTarget.type
        : 'item') +
      '/' +
      Date.now() +
      '_' +
      Math.random().toString(36).slice(2) +
      '.' +
      ext;
    var bucket = 'site-images';
    var upRes = await sb.storage.from(bucket).upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (upRes.error) throw upRes.error;
    var pub = sb.storage.from(bucket).getPublicUrl(path);
    var publicUrl = pub && pub.data ? pub.data.publicUrl : '';
    if (!publicUrl) throw new Error('\u0644\u0627 \u064a\u0648\u062c\u062f \u0631\u0627\u0628\u0637 \u0639\u0627\u0645');

    if (typeof uploadTarget !== 'undefined' && uploadTarget) {
      if (uploadTarget.type === 'logo') {
        var logoInp = document.getElementById('setLogoUrl');
        if (logoInp) logoInp.value = publicUrl;
        if (typeof showToast === 'function') showToast('\u062a\u0645 \u0631\u0641\u0639 \u0627\u0644\u0644\u0648\u062c\u0648 \u2713 \u0627\u0636\u063a\u0637 \u062d\u0641\u0638', 'success');
      } else if (uploadTarget.type === 'favicon') {
        var favInp = document.getElementById('setFaviconUrl');
        if (favInp) favInp.value = publicUrl;
        if (typeof showToast === 'function') showToast('\u062a\u0645 \u0631\u0641\u0639 \u0627\u0644\u0623\u064a\u0642\u0648\u0646\u0629 \u2713 \u0627\u0636\u063a\u0637 \u062d\u0641\u0638', 'success');
      } else if (uploadTarget.type === 'item') {
        var inp = document.getElementById('editImage');
        if (inp) inp.value = publicUrl;
        var prev = document.querySelector('#adminBody .upload-preview');
        if (prev) {
          prev.src = publicUrl;
          prev.style.display = '';
        }
        if (typeof showToast === 'function') {
          showToast('\u062a\u0645 \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629 \u2713 (' + Math.round(file.size / 1024) + ' KB)', 'success');
        }
      } else if (uploadTarget.type === 'hero') {
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
          showToast('\u062a\u0645 \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629 \u2713 (' + Math.round(file.size / 1024) + ' KB)', 'success');
        }
      }
    }
    uploadTarget = null;
  }

  function patchFileInput() {
    var input = document.getElementById('fileInput');
    if (!input || input._editorPatched) return;
    input._editorPatched = true;

    var clone = input.cloneNode(true);
    input.parentNode.replaceChild(clone, input);
    clone._editorPatched = true;

    clone.addEventListener('change', async function (e) {
      var file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      if (!file.type || !file.type.startsWith('image/')) {
        if (typeof showToast === 'function') showToast('\u0627\u062e\u062a\u0631 \u0635\u0648\u0631\u0629', 'error');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        if (typeof showToast === 'function') showToast('\u0627\u0644\u0645\u0644\u0641 \u0643\u0628\u064a\u0631 \u062c\u062f\u0627\u064b (\u062d\u062f 20MB)', 'error');
        return;
      }
      try {
        if (typeof showToast === 'function') showToast('\u062c\u0627\u0631\u064a \u0641\u062a\u062d \u0627\u0644\u0645\u062d\u0631\u0631...', '');
        await loadCropperLib();
        openEditor(file);
      } catch (err) {
        console.error(err);
        if (typeof showToast === 'function') showToast(err.message || '\u0641\u0634\u0644 \u0641\u062a\u062d \u0627\u0644\u0645\u062d\u0631\u0631', 'error');
      }
    });
  }

  function injectStyles() {
    if (document.getElementById('imgEditorStyles')) return;
    var style = document.createElement('style');
    style.id = 'imgEditorStyles';
    style.textContent =
      '.img-editor-overlay{display:none;position:fixed;inset:0;z-index:600;background:rgba(15,23,42,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);align-items:center;justify-content:center;padding:12px}' +
      '.img-editor-overlay.active{display:flex}' +
      '.img-editor-card{background:#fff;border-radius:20px;width:100%;max-width:440px;max-height:94vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(13,148,136,.2);border:1px solid rgba(13,148,136,.12);overflow:hidden}' +
      '.img-editor-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--gray-200,#e2e8ea)}' +
      '.img-editor-header h3{margin:0;font-size:1.1rem;font-weight:800;color:var(--teal-900,#134e4a)}' +
      '.img-editor-close{background:none;border:none;font-size:1.6rem;line-height:1;cursor:pointer;color:var(--gray-600,#64748b)}' +
      '.img-editor-stage{position:relative;height:min(52vh,360px);background:#0f172a;overflow:hidden}' +
      '.img-editor-stage img{display:block;max-width:100%;max-height:100%}' +
      '.img-editor-tools{display:flex;justify-content:center;gap:8px;padding:12px 12px 4px;flex-wrap:wrap}' +
      '.img-tool{width:42px;height:42px;border:none;border-radius:12px;background:var(--teal-50,#f0fdfa);color:var(--teal-800,#115e59);font-size:1.15rem;font-weight:800;cursor:pointer;transition:background .15s,transform .15s}' +
      '.img-tool:hover{background:var(--teal-100,#ccfbf1)}' +
      '.img-tool:active{transform:scale(.95)}' +
      '.img-editor-hint{text-align:center;font-size:.8rem;font-weight:600;color:var(--gray-600,#64748b);padding:4px 16px 10px;margin:0}' +
      '.img-editor-actions{display:flex;gap:10px;padding:0 16px 16px}' +
      '.img-btn{flex:1;padding:13px 14px;border:none;border-radius:14px;font-family:inherit;font-size:.95rem;font-weight:800;cursor:pointer}' +
      '.img-btn.cancel{background:var(--gray-100,#f1f5f6);color:var(--gray-800,#1e293b)}' +
      '.img-btn.primary{background:linear-gradient(135deg,var(--teal-600,#0d9488),var(--teal-500,#14b8a6));color:#fff;box-shadow:0 4px 14px rgba(13,148,136,.3)}' +
      '.img-btn.primary:disabled{opacity:.7;cursor:wait}';
    document.head.appendChild(style);
  }

  var tries = 0;
  var t = setInterval(function () {
    tries++;
    injectStyles();
    patchFileInput();
    if (tries > 40) clearInterval(t);
  }, 200);

  setTimeout(function () {
    loadCropperLib().catch(function () {});
  }, 2000);
})();
