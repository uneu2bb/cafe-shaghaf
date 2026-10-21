/* Designer credits — secret panel + public bar */
(function () {
  var STORAGE_KEY = 'shaghaf_designer_credits';
  var DEFAULT_PASS = 'm8n2024';
  var unlocked = false;

  var credits = {
    enabled: false,
    name: 'M8N.LMR',
    label: '\u062a\u0645 \u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0645\u0648\u0642\u0639 \u0628\u0648\u0627\u0633\u0637\u0629',
    position: 'bottom',
    whatsapp: '',
    instagram: '',
    facebook: '',
    telegram: '',
    password: DEFAULT_PASS,
  };

  function loadLocal() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var o = JSON.parse(raw);
        Object.keys(credits).forEach(function (k) {
          if (o[k] !== undefined && o[k] !== null) credits[k] = o[k];
        });
      }
    } catch (e) {}
  }

  function saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(credits));
    } catch (e) {}
  }

  async function loadRemote() {
    try {
      if (typeof sb === 'undefined') return;
      var res = await sb
        .from('settings')
        .select(
          'designer_enabled,designer_name,designer_label,designer_position,designer_whatsapp,designer_instagram,designer_facebook,designer_telegram,designer_password'
        )
        .eq('id', 1)
        .maybeSingle();
      if (res.error || !res.data) return;
      var d = res.data;
      if (d.designer_enabled != null) credits.enabled = !!d.designer_enabled;
      if (d.designer_name) credits.name = d.designer_name;
      if (d.designer_label) credits.label = d.designer_label;
      if (d.designer_position) credits.position = d.designer_position;
      if (d.designer_whatsapp != null) credits.whatsapp = d.designer_whatsapp || '';
      if (d.designer_instagram != null) credits.instagram = d.designer_instagram || '';
      if (d.designer_facebook != null) credits.facebook = d.designer_facebook || '';
      if (d.designer_telegram != null) credits.telegram = d.designer_telegram || '';
      if (d.designer_password) credits.password = d.designer_password;
      saveLocal();
    } catch (e) {}
  }

  async function saveRemote() {
    try {
      if (typeof sb === 'undefined') return false;
      var res = await sb
        .from('settings')
        .update({
          designer_enabled: credits.enabled,
          designer_name: credits.name,
          designer_label: credits.label,
          designer_position: credits.position,
          designer_whatsapp: credits.whatsapp || null,
          designer_instagram: credits.instagram || null,
          designer_facebook: credits.facebook || null,
          designer_telegram: credits.telegram || null,
          designer_password: credits.password,
        })
        .eq('id', 1);
      return !res.error;
    } catch (e) {
      return false;
    }
  }

  function esc(s) {
    if (typeof escapeHtml === 'function') return escapeHtml(String(s || ''));
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function waLink(num) {
    var n = String(num || '').replace(/[^0-9]/g, '');
    return n ? 'https://wa.me/' + n : '';
  }

  function ensureBar() {
    var bar = document.getElementById('designerCreditBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'designerCreditBar';
      bar.className = 'designer-credit-bar';
      bar.setAttribute('aria-label', 'credits');
      document.body.appendChild(bar);
    }
    return bar;
  }

  function renderBar() {
    var bar = ensureBar();
    if (!credits.enabled || !credits.name) {
      bar.style.display = 'none';
      bar.innerHTML = '';
      document.body.classList.remove('has-designer-top', 'has-designer-bottom');
      return;
    }

    document.body.classList.remove('has-designer-top', 'has-designer-bottom');
    document.body.classList.add(
      credits.position === 'top' ? 'has-designer-top' : 'has-designer-bottom'
    );
    bar.className =
      'designer-credit-bar ' +
      (credits.position === 'top' ? 'pos-top' : 'pos-bottom');
    bar.style.display = 'block';

    var icons = '';
    if (credits.telegram) {
      icons +=
        '<a class="dc-icon tg" href="' +
        esc(credits.telegram) +
        '" target="_blank" rel="noopener" aria-label="Telegram">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.2 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06-.01.13-.02.2z"/></svg></a>';
    }
    if (credits.facebook) {
      icons +=
        '<a class="dc-icon fb" href="' +
        esc(credits.facebook) +
        '" target="_blank" rel="noopener" aria-label="Facebook">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg></a>';
    }
    if (credits.instagram) {
      icons +=
        '<a class="dc-icon ig" href="' +
        esc(credits.instagram) +
        '" target="_blank" rel="noopener" aria-label="Instagram">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 3.5A4.5 4.5 0 1112 16.5 4.5 4.5 0 0112 7.5zm0 2A2.5 2.5 0 1014.5 12 2.5 2.5 0 0012 9.5zM17.5 6.75a1 1 0 11-1 1 1 1 0 011-1z"/></svg></a>';
    }
    if (credits.whatsapp) {
      var w = waLink(credits.whatsapp);
      if (w) {
        icons +=
          '<a class="dc-icon wa" href="' +
          esc(w) +
          '" target="_blank" rel="noopener" aria-label="WhatsApp">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.47 14.38c-.29-.15-1.7-.84-1.96-.93-.26-.1-.45-.15-.64.15-.19.29-.74.93-.9 1.12-.17.19-.33.21-.62.07-.29-.15-1.22-.45-2.33-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.33.43-.5.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.15-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.48h-.55c-.19 0-.5.07-.76.36-.26.29-1 1-1 2.43s1.02 2.82 1.17 3.01c.15.19 2.01 3.07 4.87 4.3.68.29 1.21.47 1.62.6.68.21 1.3.18 1.79.11.55-.08 1.7-.7 1.94-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.33z"/><path d="M12 2a10 10 0 00-8.48 15.2L2 22l4.93-1.29A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.18-1.15l-.3-.18-2.93.77.78-2.86-.2-.3A8.2 8.2 0 1112 20.2z"/></svg></a>';
      }
    }

    bar.innerHTML =
      '<div class="dc-inner">' +
      '  <div class="dc-label">' +
      esc(credits.label || '') +
      ' <span class="dc-chev">\u2303</span></div>' +
      '  <div class="dc-name">' +
      esc(credits.name) +
      '</div>' +
      (icons ? '<div class="dc-icons">' + icons + '</div>' : '') +
      '</div>';
  }

  function injectStyles() {
    if (document.getElementById('designerCreditStyles')) return;
    var s = document.createElement('style');
    s.id = 'designerCreditStyles';
    s.textContent =
      '.designer-credit-bar{display:none;width:100%;z-index:80;background:linear-gradient(180deg,#0a1f1e 0%,#0f2927 100%);color:#d4e8e5;border-top:1px solid rgba(255,255,255,.06);font-family:inherit}' +
      '.designer-credit-bar.pos-bottom{position:relative;margin-top:0}' +
      '.designer-credit-bar.pos-top{position:sticky;top:0;border-top:none;border-bottom:1px solid rgba(255,255,255,.06);box-shadow:0 4px 20px rgba(0,0,0,.2)}' +
      '.dc-inner{max-width:480px;margin:0 auto;padding:18px 16px 20px;text-align:center}' +
      '.dc-label{font-size:.78rem;font-weight:600;opacity:.75;letter-spacing:.02em;margin-bottom:4px}' +
      '.dc-chev{display:inline-block;opacity:.5;font-size:.7rem;margin-right:2px}' +
      '.dc-name{font-size:1.05rem;font-weight:800;color:#e8f5f3;letter-spacing:.04em;margin-bottom:12px}' +
      '.dc-icons{display:flex;justify-content:center;align-items:center;gap:14px}' +
      '.dc-icon{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;transition:transform .2s,box-shadow .2s;box-shadow:0 3px 12px rgba(0,0,0,.25)}' +
      '.dc-icon:hover{transform:translateY(-3px) scale(1.06)}' +
      '.dc-icon.fb{background:linear-gradient(145deg,#3b8dff,#1877F2)}' +
      '.dc-icon.ig{background:linear-gradient(135deg,#f9ce34,#ee2a7b 50%,#6228d7)}' +
      '.dc-icon.wa{background:linear-gradient(145deg,#4de07a,#25D366)}' +
      '.dc-icon.tg{background:linear-gradient(145deg,#6ec9f5,#229ED9)}' +
      '.admin-tab.dc-secret-tab{width:36px;min-width:36px;padding:8px 0;font-size:1rem;opacity:.55}' +
      '.admin-tab.dc-secret-tab:hover,.admin-tab.dc-secret-tab.active{opacity:1}' +
      '.dc-panel h3{margin:0 0 8px;color:var(--teal-900,#134e4a);font-weight:800}' +
      '.dc-panel .dc-hint{font-size:.85rem;color:var(--gray-600,#64748b);font-weight:600;margin-bottom:14px;line-height:1.55}' +
      '.dc-lock{text-align:center;padding:20px 8px}' +
      '.dc-lock .dc-lock-icon{font-size:2rem;margin-bottom:10px;opacity:.7}' +
      '.dc-pos-row{display:flex;gap:8px;margin-bottom:14px}' +
      '.dc-pos-row button{flex:1;padding:10px;border-radius:12px;border:1.5px solid var(--teal-200,#99f6e4);background:#fff;font-family:inherit;font-weight:700;cursor:pointer;color:var(--teal-800,#115e59)}' +
      '.dc-pos-row button.active{background:linear-gradient(135deg,var(--teal-600,#0d9488),var(--teal-500,#14b8a6));color:#fff;border-color:transparent}';
    document.head.appendChild(s);
  }

  function renderLockedPanel() {
    var el = document.getElementById('adminTabContent');
    if (!el) return;
    el.innerHTML =
      '<div class="dc-panel dc-lock">' +
      '  <div class="dc-lock-icon">\u2726</div>' +
      '  <p class="dc-hint">\u0645\u0646\u0637\u0642\u0629 \u062e\u0627\u0635\u0629 \u2014 \u0623\u062f\u062e\u0644 \u0627\u0644\u0631\u0645\u0632 \u0644\u0644\u0645\u062a\u0627\u0628\u0639\u0629</p>' +
      '  <div class="form-group"><input type="password" id="dcPassInput" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" autocomplete="off"></div>' +
      '  <button type="button" class="btn-submit" id="dcUnlockBtn">\u062f\u062e\u0648\u0644</button>' +
      '</div>';
    var btn = document.getElementById('dcUnlockBtn');
    var inp = document.getElementById('dcPassInput');
    function tryUnlock() {
      var v = (inp && inp.value) || '';
      if (v === credits.password || v === DEFAULT_PASS) {
        unlocked = true;
        sessionStorage.setItem('shaghaf_dc_ok', '1');
        renderCreditsAdmin();
      } else {
        if (typeof showToast === 'function') showToast('\u0631\u0645\u0632 \u062e\u0627\u0637\u0626', 'error');
      }
    }
    if (btn) btn.onclick = tryUnlock;
    if (inp)
      inp.onkeydown = function (e) {
        if (e.key === 'Enter') tryUnlock();
      };
  }

  function renderCreditsAdmin() {
    var el = document.getElementById('adminTabContent');
    if (!el) return;
    if (!unlocked && sessionStorage.getItem('shaghaf_dc_ok') !== '1') {
      renderLockedPanel();
      return;
    }
    unlocked = true;

    el.innerHTML =
      '<div class="dc-panel">' +
      '  <h3>\u2726</h3>' +
      '  <p class="dc-hint">\u062a\u062d\u0643\u0645 \u0628\u0627\u0644\u0638\u0647\u0648\u0631 \u0648\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u062a\u0648\u0627\u0635\u0644. \u0647\u0630\u0647 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0645\u062d\u0645\u064a\u0629 \u0628\u0631\u0645\u0632 \u0645\u0633\u062a\u0642\u0644 \u0639\u0646 \u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645.</p>' +
      '  <div class="form-group"><label>\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0638\u0647\u0648\u0631</label>' +
      '    <select id="dcEnabled"><option value="1"' +
      (credits.enabled ? ' selected' : '') +
      '>\u0645\u0641\u0639\u0651\u064e\u0644</option><option value="0"' +
      (!credits.enabled ? ' selected' : '') +
      '>\u0645\u062e\u0641\u064a</option></select></div>' +
      '  <div class="form-group"><label>\u0627\u0644\u0646\u0635 \u0627\u0644\u0639\u0644\u0648\u064a</label><input type="text" id="dcLabel" value="' +
      esc(credits.label) +
      '" placeholder="\u062a\u0645 \u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0645\u0648\u0642\u0639 \u0628\u0648\u0627\u0633\u0637\u0629"></div>' +
      '  <div class="form-group"><label>\u0627\u0644\u0627\u0633\u0645 / \u0627\u0644\u0631\u0645\u0632</label><input type="text" id="dcName" value="' +
      esc(credits.name) +
      '" placeholder="M8N.LMR"></div>' +
      '  <label style="display:block;font-weight:700;margin-bottom:8px;color:var(--gray-800)">\u0645\u0643\u0627\u0646 \u0627\u0644\u0638\u0647\u0648\u0631</label>' +
      '  <div class="dc-pos-row">' +
      '    <button type="button" id="dcPosTop" class="' +
      (credits.position === 'top' ? 'active' : '') +
      '">\u0623\u0639\u0644\u0649 \u0627\u0644\u0645\u0648\u0642\u0639</button>' +
      '    <button type="button" id="dcPosBottom" class="' +
      (credits.position === 'bottom' ? 'active' : '') +
      '">\u0623\u0633\u0641\u0644 \u0627\u0644\u0645\u0648\u0642\u0639</button>' +
      '  </div>' +
      '  <div class="form-group"><label>\u0648\u0627\u062a\u0633\u0627\u0628</label><input type="text" id="dcWA" value="' +
      esc(credits.whatsapp) +
      '" placeholder="905xxxxxxxxx"></div>' +
      '  <div class="form-group"><label>\u0625\u0646\u0633\u062a\u063a\u0631\u0627\u0645</label><input type="url" id="dcIG" value="' +
      esc(credits.instagram) +
      '" placeholder="https://instagram.com/..."></div>' +
      '  <div class="form-group"><label>\u0641\u064a\u0633\u0628\u0648\u0643</label><input type="url" id="dcFB" value="' +
      esc(credits.facebook) +
      '" placeholder="https://facebook.com/..."></div>' +
      '  <div class="form-group"><label>\u062a\u064a\u0644\u064a\u063a\u0631\u0627\u0645</label><input type="url" id="dcTG" value="' +
      esc(credits.telegram) +
      '" placeholder="https://t.me/..."></div>' +
      '  <div class="form-group"><label>\u062a\u063a\u064a\u064a\u0631 \u0631\u0645\u0632 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0647\u0630\u0647 \u0627\u0644\u0645\u0646\u0637\u0642\u0629</label><input type="password" id="dcNewPass" placeholder="\u0627\u062a\u0631\u0643\u0647 \u0641\u0627\u0631\u063a\u0627\u064b \u0625\u0646 \u0644\u0645 \u062a\u0631\u062f \u0627\u0644\u062a\u063a\u064a\u064a\u0631" autocomplete="new-password"></div>' +
      '  <button type="button" class="btn-submit" id="dcSaveBtn">\u062d\u0641\u0638</button>' +
      '</div>';

    document.getElementById('dcPosTop').onclick = function () {
      credits.position = 'top';
      document.getElementById('dcPosTop').classList.add('active');
      document.getElementById('dcPosBottom').classList.remove('active');
    };
    document.getElementById('dcPosBottom').onclick = function () {
      credits.position = 'bottom';
      document.getElementById('dcPosBottom').classList.add('active');
      document.getElementById('dcPosTop').classList.remove('active');
    };
    document.getElementById('dcSaveBtn').onclick = saveFromForm;
  }

  async function saveFromForm() {
    credits.enabled = document.getElementById('dcEnabled').value === '1';
    credits.label = (document.getElementById('dcLabel').value || '').trim() || credits.label;
    credits.name = (document.getElementById('dcName').value || '').trim() || credits.name;
    credits.whatsapp = (document.getElementById('dcWA').value || '').trim();
    credits.instagram = (document.getElementById('dcIG').value || '').trim();
    credits.facebook = (document.getElementById('dcFB').value || '').trim();
    credits.telegram = (document.getElementById('dcTG').value || '').trim();
    var np = (document.getElementById('dcNewPass').value || '').trim();
    if (np) credits.password = np;

    saveLocal();
    var ok = await saveRemote();
    renderBar();
    placeBarInDom();
    if (typeof showToast === 'function') {
      showToast(ok ? '\u062a\u0645 \u0627\u0644\u062d\u0641\u0638 \u0623\u0648\u0646\u0644\u0627\u064a\u0646 \u2713' : '\u062a\u0645 \u0627\u0644\u062d\u0641\u0638 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u062c\u0647\u0627\u0632 \u2713', 'success');
    }
  }

  function placeBarInDom() {
    var bar = ensureBar();
    if (!credits.enabled) return;
    if (credits.position === 'top') {
      var header = document.getElementById('header') || document.querySelector('header');
      if (header && header.parentNode) {
        header.parentNode.insertBefore(bar, header);
      }
    } else {
      var footer = document.querySelector('footer.footer') || document.querySelector('footer');
      if (footer && footer.parentNode) {
        if (footer.nextSibling) footer.parentNode.insertBefore(bar, footer.nextSibling);
        else footer.parentNode.appendChild(bar);
      } else {
        document.body.appendChild(bar);
      }
    }
  }

  function patchAdminPanel() {
    if (typeof renderAdminPanel !== 'function' || renderAdminPanel._dcTab) return;
    var _rap = renderAdminPanel;
    window.renderAdminPanel = function () {
      _rap();
      var tabs = document.querySelector('.admin-tabs');
      if (tabs && !tabs.querySelector('[data-tab="dc"]')) {
        var btn = document.createElement('button');
        btn.className = 'admin-tab dc-secret-tab' + (adminTab === 'dc' ? ' active' : '');
        btn.setAttribute('data-tab', 'dc');
        btn.setAttribute('title', '\u2726');
        btn.textContent = '\u2726';
        btn.onclick = function () {
          adminTab = 'dc';
          renderAdminPanel();
        };
        tabs.appendChild(btn);
      }
      if (tabs) {
        tabs.querySelectorAll('.admin-tab').forEach(function (b) {
          if (b.getAttribute('data-tab') === 'dc') {
            b.classList.toggle('active', adminTab === 'dc');
          } else if (adminTab === 'dc') {
            b.classList.remove('active');
          }
        });
      }
      if (adminTab === 'dc') {
        if (sessionStorage.getItem('shaghaf_dc_ok') === '1') unlocked = true;
        renderCreditsAdmin();
      }
    };
    window.renderAdminPanel._dcTab = true;
  }

  function patchLoadAll() {
    if (typeof loadAll !== 'function' || loadAll._dcPatched) return;
    var _la = loadAll;
    window.loadAll = async function () {
      await _la.apply(this, arguments);
      await loadRemote();
      renderBar();
      placeBarInDom();
    };
    window.loadAll._dcPatched = true;
  }

  loadLocal();
  injectStyles();

  var tries = 0;
  var t = setInterval(function () {
    tries++;
    injectStyles();
    patchAdminPanel();
    patchLoadAll();
    if (tries > 50) clearInterval(t);
  }, 200);

  setTimeout(async function () {
    await loadRemote();
    renderBar();
    placeBarInDom();
  }, 800);
})();
