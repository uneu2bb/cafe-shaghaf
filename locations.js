/* Branches / Locations feature for Shaghaf */
(function () {
  window.locations = window.locations || [];

  async function loadLocations() {
    try {
      if (typeof sb === 'undefined') return;
      var res = await sb.from('locations').select('*').order('sort_order', { ascending: true });
      if (res.error) {
        console.warn('locations load:', res.error.message);
        return;
      }
      window.locations = res.data || [];
      renderLocationsButton();
      renderLocationsModalList();
    } catch (e) {
      console.warn('locations load error', e);
    }
  }

  function ensureLocationsUI() {
    if (document.getElementById('locationsBtn')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'locationsBtn';
    btn.className = 'locations-fab';
    btn.setAttribute('aria-label', '\u0641\u0631\u0648\u0639\u0646\u0627');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>' +
      '<circle cx="12" cy="10" r="3"/>' +
      '</svg>' +
      '<span>\u0641\u0631\u0648\u0639\u0646\u0627</span>';
    btn.onclick = openLocationsModal;
    document.body.appendChild(btn);

    if (!document.getElementById('locationsModal')) {
      var modal = document.createElement('div');
      modal.className = 'modal locations-modal';
      modal.id = 'locationsModal';
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML =
        '<div class="modal-content locations-modal-content">' +
        '  <div class="modal-header">' +
        '    <h2>\u0641\u0631\u0648\u0639\u0646\u0627</h2>' +
        '    <button type="button" class="modal-close" id="closeLocationsModal">&times;</button>' +
        '  </div>' +
        '  <div class="modal-body" id="locationsList">' +
        '    <p class="locations-empty">\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u062d\u0645\u064a\u0644...</p>' +
        '  </div>' +
        '</div>';
      document.body.appendChild(modal);

      document.getElementById('closeLocationsModal').onclick = closeLocationsModal;
      modal.addEventListener('click', function (e) {
        if (e.target.id === 'locationsModal') closeLocationsModal();
      });
    }
  }

  function renderLocationsButton() {
    ensureLocationsUI();
    var btn = document.getElementById('locationsBtn');
    if (!btn) return;
    var count = (window.locations || []).length;
    btn.style.display = count ? 'flex' : 'none';
  }

  function renderLocationsModalList() {
    var el = document.getElementById('locationsList');
    if (!el) return;
    var list = window.locations || [];
    if (!list.length) {
      el.innerHTML = '<p class="locations-empty">\u0644\u0627 \u062a\u0648\u062c\u062f \u0641\u0631\u0648\u0639 \u0645\u0636\u0627\u0641\u0629 \u062d\u0627\u0644\u064a\u0627\u064b</p>';
      return;
    }
    var html = '<div class="locations-grid">';
    list.forEach(function (loc) {
      var name = escapeHtml(loc.name || '');
      var url = escapeHtml(loc.map_url || '#');
      var note = loc.note ? '<span class="loc-note">' + escapeHtml(loc.note) + '</span>' : '';
      html +=
        '<a class="location-card" href="' +
        url +
        '" target="_blank" rel="noopener">' +
        '  <div class="loc-icon">' +
        '    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>' +
        '    </svg>' +
        '  </div>' +
        '  <div class="loc-info">' +
        '    <span class="loc-name">' +
        name +
        '</span>' +
        note +
        '  </div>' +
        '  <span class="loc-arrow">\u2190</span>' +
        '</a>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  window.openLocationsModal = function () {
    ensureLocationsUI();
    renderLocationsModalList();
    var m = document.getElementById('locationsModal');
    if (m) {
      m.classList.add('active');
      m.setAttribute('aria-hidden', 'false');
    }
  };

  window.closeLocationsModal = function () {
    var m = document.getElementById('locationsModal');
    if (m) {
      m.classList.remove('active');
      m.setAttribute('aria-hidden', 'true');
    }
  };

  window.renderLocationsAdmin = function () {
    var el = document.getElementById('adminTabContent');
    if (!el) return;
    var list = window.locations || [];
    var html =
      '<h3 style="margin-bottom:12px;color:var(--teal-900)">\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0641\u0631\u0648\u0639</h3>' +
      '<p style="color:var(--gray-600);font-size:0.9rem;margin-bottom:14px;font-weight:600">\u0623\u0636\u0641 \u0627\u0633\u0645 \u0627\u0644\u0641\u0631\u0639 \u0648\u0631\u0627\u0628\u0637 \u0627\u0644\u062e\u0631\u064a\u0637\u0629 (Google Maps)</p>' +
      '<button type="button" class="btn-submit" style="margin-bottom:16px" onclick="openAddLocationForm()">\u2795 \u0625\u0636\u0627\u0641\u0629 \u0641\u0631\u0639</button>';

    if (!list.length) {
      html += '<p style="color:var(--gray-600);text-align:center;padding:16px;font-weight:600">\u0644\u0627 \u062a\u0648\u062c\u062f \u0641\u0631\u0648\u0639 \u0628\u0639\u062f</p>';
    } else {
      html += '<div style="display:flex;flex-direction:column;gap:8px">';
      list.forEach(function (loc) {
        html +=
          '<div style="display:flex;align-items:center;gap:10px;padding:12px;background:#fff;border:1px solid var(--gray-200);border-radius:12px">' +
          '  <div style="flex:1;min-width:0">' +
          '    <div style="font-weight:800;font-size:0.95rem;color:var(--gray-900)">' +
          escapeHtml(loc.name || '') +
          '</div>' +
          (loc.note
            ? '<div style="font-size:0.8rem;color:var(--gray-600);margin-top:2px">' + escapeHtml(loc.note) + '</div>'
            : '') +
          '    <a href="' +
          escapeHtml(loc.map_url || '#') +
          '" target="_blank" rel="noopener" style="font-size:0.8rem;color:var(--teal-700);word-break:break-all">' +
          escapeHtml(loc.map_url || '') +
          '</a>' +
          '  </div>' +
          '  <button type="button" class="btn-secondary" style="padding:8px 10px;font-size:0.85rem" onclick="openEditLocationForm(\'' +
          loc.id +
          '\')">\u062a\u0639\u062f\u064a\u0644</button>' +
          '  <button type="button" class="btn-secondary" style="padding:8px 10px;font-size:0.85rem;color:#C62828" onclick="deleteLocation(\'' +
          loc.id +
          '\')">\u062d\u0630\u0641</button>' +
          '</div>';
      });
      html += '</div>';
    }
    el.innerHTML = html;
  };

  window.openAddLocationForm = function () {
    var el = document.getElementById('adminTabContent');
    if (!el) return;
    el.innerHTML =
      '<h3 style="margin-bottom:12px;color:var(--teal-900)">\u0625\u0636\u0627\u0641\u0629 \u0641\u0631\u0639</h3>' +
      '<form onsubmit="saveNewLocation(event)">' +
      '  <div class="form-group"><label>\u0627\u0633\u0645 \u0627\u0644\u0641\u0631\u0639 / \u0627\u0644\u0646\u0642\u0637\u0629</label><input type="text" id="locName" required placeholder="\u0645\u062b\u0627\u0644: \u0641\u0631\u0639 \u062f\u0645\u0634\u0642 \u2013 \u0627\u0644\u0645\u0632\u0629"></div>' +
      '  <div class="form-group"><label>\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0648\u0642\u0639 (Google Maps)</label><input type="url" id="locMapUrl" required placeholder="https://maps.google.com/..."></div>' +
      '  <div class="form-group"><label>\u0645\u0644\u0627\u062d\u0638\u0629 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)</label><input type="text" id="locNote" placeholder="\u0645\u062b\u0627\u0644: \u0628\u062c\u0627\u0646\u0628 \u0627\u0644\u062c\u0627\u0645\u0639"></div>' +
      '  <div style="display:flex;gap:10px">' +
      '    <button type="submit" class="btn-submit" style="flex:1">\u062d\u0641\u0638</button>' +
      '    <button type="button" class="btn-secondary" onclick="renderLocationsAdmin()">\u0625\u0644\u063a\u0627\u0621</button>' +
      '  </div>' +
      '</form>';
  };

  window.openEditLocationForm = function (id) {
    var loc = (window.locations || []).find(function (l) {
      return String(l.id) === String(id);
    });
    if (!loc) return;
    var el = document.getElementById('adminTabContent');
    if (!el) return;
    el.innerHTML =
      '<h3 style="margin-bottom:12px;color:var(--teal-900)">\u062a\u0639\u062f\u064a\u0644 \u0641\u0631\u0639</h3>' +
      '<form onsubmit="saveEditLocation(event,\'' +
      id +
      '\')">' +
      '  <div class="form-group"><label>\u0627\u0633\u0645 \u0627\u0644\u0641\u0631\u0639 / \u0627\u0644\u0646\u0642\u0637\u0629</label><input type="text" id="locName" required value="' +
      escapeHtml(loc.name || '') +
      '"></div>' +
      '  <div class="form-group"><label>\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0648\u0642\u0639 (Google Maps)</label><input type="url" id="locMapUrl" required value="' +
      escapeHtml(loc.map_url || '') +
      '"></div>' +
      '  <div class="form-group"><label>\u0645\u0644\u0627\u062d\u0638\u0629 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)</label><input type="text" id="locNote" value="' +
      escapeHtml(loc.note || '') +
      '"></div>' +
      '  <div style="display:flex;gap:10px">' +
      '    <button type="submit" class="btn-submit" style="flex:1">\u062d\u0641\u0638</button>' +
      '    <button type="button" class="btn-secondary" onclick="renderLocationsAdmin()">\u0625\u0644\u063a\u0627\u0621</button>' +
      '  </div>' +
      '</form>';
  };

  window.saveNewLocation = async function (e) {
    e.preventDefault();
    var name = document.getElementById('locName').value.trim();
    var map_url = document.getElementById('locMapUrl').value.trim();
    var note = (document.getElementById('locNote').value || '').trim();
    if (!name || !map_url) {
      if (typeof showToast === 'function') showToast('\u0627\u0644\u0627\u0633\u0645 \u0648\u0627\u0644\u0631\u0627\u0628\u0637 \u0645\u0637\u0644\u0648\u0628\u0627\u0646', 'error');
      return;
    }
    try {
      var sort_order = (window.locations || []).length + 1;
      var res = await sb
        .from('locations')
        .insert([{ name: name, map_url: map_url, note: note || null, sort_order: sort_order }])
        .select()
        .single();
      if (res.error) throw res.error;
      window.locations = window.locations || [];
      window.locations.push(res.data);
      window.locations.sort(function (a, b) {
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
      renderLocationsButton();
      if (typeof showToast === 'function') showToast('\u062a\u0645\u062a \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0641\u0631\u0639 \u2713', 'success');
      renderLocationsAdmin();
    } catch (err) {
      if (typeof showToast === 'function') showToast('\u0641\u0634\u0644: ' + (err.message || ''), 'error');
    }
  };

  window.saveEditLocation = async function (e, id) {
    e.preventDefault();
    var name = document.getElementById('locName').value.trim();
    var map_url = document.getElementById('locMapUrl').value.trim();
    var note = (document.getElementById('locNote').value || '').trim();
    if (!name || !map_url) {
      if (typeof showToast === 'function') showToast('\u0627\u0644\u0627\u0633\u0645 \u0648\u0627\u0644\u0631\u0627\u0628\u0637 \u0645\u0637\u0644\u0648\u0628\u0627\u0646', 'error');
      return;
    }
    try {
      var res = await sb
        .from('locations')
        .update({ name: name, map_url: map_url, note: note || null })
        .eq('id', id)
        .select()
        .single();
      if (res.error) throw res.error;
      var idx = (window.locations || []).findIndex(function (l) {
        return String(l.id) === String(id);
      });
      if (idx !== -1) window.locations[idx] = res.data;
      renderLocationsButton();
      if (typeof showToast === 'function') showToast('\u062a\u0645 \u0627\u0644\u062d\u0641\u0638 \u2713', 'success');
      renderLocationsAdmin();
    } catch (err) {
      if (typeof showToast === 'function') showToast('\u0641\u0634\u0644: ' + (err.message || ''), 'error');
    }
  };

  window.deleteLocation = async function (id) {
    var ok = true;
    if (typeof showConfirm === 'function') {
      ok = await showConfirm({
        title: '\u062d\u0630\u0641 \u0627\u0644\u0641\u0631\u0639',
        message: '\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0641\u0631\u0639\u061f',
        okText: '\u0646\u0639\u0645\u060c \u0627\u062d\u0630\u0641',
        cancelText: '\u0625\u0644\u063a\u0627\u0621',
        okClass: 'danger',
      });
    } else {
      ok = confirm('\u062d\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0641\u0631\u0639\u061f');
    }
    if (!ok) return;
    try {
      var res = await sb.from('locations').delete().eq('id', id);
      if (res.error) throw res.error;
      window.locations = (window.locations || []).filter(function (l) {
        return String(l.id) !== String(id);
      });
      renderLocationsButton();
      if (typeof showToast === 'function') showToast('\u062a\u0645 \u0627\u0644\u062d\u0630\u0641', 'success');
      renderLocationsAdmin();
    } catch (err) {
      if (typeof showToast === 'function') showToast('\u0641\u0634\u0644: ' + (err.message || ''), 'error');
    }
  };

  function patchAdminPanelForLocations() {
    if (typeof renderAdminPanel !== 'function' || renderAdminPanel._locationsTab) return;
    var _rap = renderAdminPanel;
    window.renderAdminPanel = function () {
      _rap();
      var tabs = document.querySelector('.admin-tabs');
      if (tabs && !tabs.querySelector('[data-tab="locations"]')) {
        var btn = document.createElement('button');
        btn.className = 'admin-tab' + (adminTab === 'locations' ? ' active' : '');
        btn.setAttribute('data-tab', 'locations');
        btn.textContent = '\u0627\u0644\u0641\u0631\u0648\u0639';
        btn.onclick = function () {
          adminTab = 'locations';
          renderAdminPanel();
        };
        tabs.appendChild(btn);
      }
      if (tabs) {
        tabs.querySelectorAll('.admin-tab').forEach(function (b) {
          if (b.getAttribute('data-tab') === 'locations') {
            b.classList.toggle('active', adminTab === 'locations');
          } else if (adminTab === 'locations') {
            b.classList.remove('active');
          }
        });
      }
      if (adminTab === 'locations') {
        renderLocationsAdmin();
      }
    };
    window.renderAdminPanel._locationsTab = true;
  }

  function patchLoadAllForLocations() {
    if (typeof loadAll !== 'function' || loadAll._locationsPatched) return;
    var _la = loadAll;
    window.loadAll = async function () {
      await _la.apply(this, arguments);
      await loadLocations();
    };
    window.loadAll._locationsPatched = true;
  }

  var tries = 0;
  var t = setInterval(function () {
    tries++;
    patchAdminPanelForLocations();
    patchLoadAllForLocations();
    ensureLocationsUI();
    if (typeof sb !== 'undefined' && !(window.locations && window.locations.length)) {
      loadLocations();
    }
    if (tries > 40) clearInterval(t);
  }, 250);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(function () {
        ensureLocationsUI();
        loadLocations();
      }, 600);
    });
  } else {
    setTimeout(function () {
      ensureLocationsUI();
      loadLocations();
    }, 600);
  }
})();
