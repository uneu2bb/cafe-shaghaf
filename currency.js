/* Teal brand: dual prices, price under name, persistent branding (localStorage) */
(function(){
  var BRAND_KEY = 'shaghaf_brand_v1';

  window.seedDefaultData = function(){
    if(typeof showToast==='function') showToast('\u062a\u0645 \u062a\u0639\u0637\u064a\u0644 \u062a\u0639\u0628\u0626\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a','error');
  };
  window.changeQty = function(){};
  window.openCart = function(){};
  window.updateCartBar = function(){
    var bar = document.getElementById('cartBar');
    if(bar) bar.style.display = 'none';
  };
  window.sendWhatsAppOrder = function(){};
  window.clearCart = function(){};

  function getItemPrices(item){
    if(!item) return {syp:0, try:0};
    var syp = Number(item.price_syp != null ? item.price_syp : item.price) || 0;
    var tryL = Number(item.price_try != null ? item.price_try : 0) || 0;
    return {syp:syp, try:tryL};
  }
  function fmt(n, cur){
    n = Number(n)||0;
    return n.toLocaleString('ar') + (cur==='syp' ? ' \u0644.\u0633' : ' \u20ba');
  }
  function formatPrices(item){
    var p = getItemPrices(item);
    var parts = [];
    if(p.syp>0) parts.push(fmt(p.syp,'syp'));
    if(p.try>0) parts.push(fmt(p.try,'try'));
    return parts.length ? parts.join(' \u00b7 ') : '\u2014';
  }
  window.getItemPrices = getItemPrices;
  window.formatPrices = formatPrices;

  window.toggleAdminMenu = function(btn){
    var dd = btn.nextElementSibling;
    var wasOpen = dd && dd.classList.contains('open');
    closeAllAdminMenus();
    if(dd && !wasOpen) dd.classList.add('open');
  };
  window.closeAllAdminMenus = function(){
    document.querySelectorAll('.admin-dropdown.open').forEach(function(el){ el.classList.remove('open'); });
  };
  if(!window._adminMenuClickBound){
    document.addEventListener('click', function(){ closeAllAdminMenus(); });
    window._adminMenuClickBound = true;
  }

  function loadBrandLocal(){
    try { return JSON.parse(localStorage.getItem(BRAND_KEY) || '{}'); } catch(e){ return {}; }
  }
  function saveBrandLocal(obj){
    try { localStorage.setItem(BRAND_KEY, JSON.stringify(obj)); } catch(e){}
  }

  function getBrand(){
    var local = loadBrandLocal();
    var s = (typeof settings !== 'undefined' && settings) ? settings : {};
    return {
      site_name: local.site_name || s.site_name || '\u0634\u063a\u0641',
      hero_subtitle: (local.hero_subtitle != null ? local.hero_subtitle : (s.hero_subtitle || '')),
      show_logo_icon: local.show_logo_icon != null ? local.show_logo_icon : (s.show_logo_icon !== false && s.show_logo_icon !== 'false')
    };
  }

  function applySiteBranding(){
    var b = getBrand();
    if(typeof settings !== 'undefined'){
      settings.site_name = b.site_name;
      settings.hero_subtitle = b.hero_subtitle;
      settings.show_logo_icon = b.show_logo_icon;
    }
    var name = b.site_name || '\u0634\u063a\u0641';
    var hero = b.hero_subtitle;
    var showIcon = !!b.show_logo_icon;

    var siteNameEl = document.getElementById('siteNameText');
    if(siteNameEl) siteNameEl.textContent = name;
    document.querySelectorAll('.logo-text').forEach(function(el){
      if(el.id === 'footerNameText' || el.id === 'siteNameText' || !el.id) el.textContent = name;
    });
    var footerName = document.getElementById('footerNameText');
    if(footerName) footerName.textContent = name;
    var heroSpan = document.getElementById('heroNameSpan');
    if(heroSpan) heroSpan.textContent = name;
    var heroSub = document.getElementById('heroSubtitle');
    if(heroSub && hero != null && hero !== '') heroSub.textContent = hero;
    try { document.title = '\u0643\u0627\u0641\u064a\u0647 ' + name; } catch(e){}

    var logoIcon = document.getElementById('logoIcon');
    var footerIcon = document.getElementById('footerLogoIcon');
    var logoImg = document.getElementById('logoImg');
    var hasLogoImg = logoImg && logoImg.getAttribute('src') && logoImg.style.display !== 'none';

    if(logoIcon){
      if(!showIcon || hasLogoImg){
        logoIcon.style.setProperty('display', 'none', 'important');
      } else {
        logoIcon.style.removeProperty('display');
      }
    }
    if(footerIcon){
      if(!showIcon){
        footerIcon.style.setProperty('display', 'none', 'important');
      } else {
        footerIcon.style.removeProperty('display');
      }
    }
  }
  window.applySiteBranding = applySiteBranding;

  setInterval(function(){ try { applySiteBranding(); } catch(e){} }, 800);

  function escapeHtmlSafe(str){
    return String(str||'').replace(/&/g,'&').replace(/"/g,'"').replace(/'/g,'&#39;').replace(/</g,'<').replace(/>/g,'>');
  }

  function injectBrandingForm(el){
    if(!el || el.querySelector('#setSiteName')) return;
    var b = getBrand();
    var block = document.createElement('div');
    block.style.marginBottom = '16px';
    block.innerHTML =
      '<h3 style="margin:16px 0 12px;color:#134E4A">\u0627\u0633\u0645 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u0648\u0627\u062c\u0647\u0629</h3>'+
      '<div class="form-group"><label>\u0627\u0633\u0645 \u0627\u0644\u0645\u0648\u0642\u0639</label><input type="text" id="setSiteName" value="'+escapeHtmlSafe(b.site_name)+'" placeholder="\u0634\u063a\u0641"></div>'+
      '<div class="form-group"><label>\u0648\u0635\u0641 \u0623\u0639\u0644\u0649 \u0627\u0644\u0645\u0648\u0642\u0639</label><textarea id="setHeroSubtitle" rows="2">'+escapeHtmlSafe(b.hero_subtitle||'')+'</textarea></div>'+
      '<div class="form-group"><label><input type="checkbox" id="setShowLogoIcon" '+(b.show_logo_icon?'checked':'')+'> \u0625\u0638\u0647\u0627\u0631 \u0623\u064a\u0642\u0648\u0646\u0629/\u0633\u062a\u064a\u0643\u0631</label></div>'+
      '<p style="font-size:0.8rem;color:#64748B;margin:4px 0 10px">\u064a\u064f\u062d\u0641\u0638 \u0645\u062d\u0644\u064a\u0627\u064b \u0648\u0641\u064a \u0642\u0627\u0639\u062f\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a</p>'+
      '<button type="button" class="btn-submit" onclick="saveSiteBranding()">\u062d\u0641\u0638 \u0627\u0644\u0647\u0648\u064a\u0629</button>';
    el.appendChild(block);
  }

  window.saveSiteBranding = async function(){
    var site_name = ((document.getElementById('setSiteName')||{}).value||'').trim() || '\u0634\u063a\u0641';
    var hero_subtitle = ((document.getElementById('setHeroSubtitle')||{}).value||'').trim();
    var show_logo_icon = !!(document.getElementById('setShowLogoIcon')||{}).checked;
    var brand = { site_name: site_name, hero_subtitle: hero_subtitle, show_logo_icon: show_logo_icon };
    saveBrandLocal(brand);
    if(typeof settings !== 'undefined'){
      settings.site_name = site_name;
      settings.hero_subtitle = hero_subtitle;
      settings.show_logo_icon = show_logo_icon;
    }
    applySiteBranding();
    try{
      if(typeof sb !== 'undefined'){
        await sb.from('settings').upsert({
          id: 1, site_name: site_name, hero_subtitle: hero_subtitle,
          show_logo_icon: show_logo_icon, updated_at: new Date().toISOString()
        });
      }
      if(typeof showToast==='function') showToast('\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0647\u0648\u064a\u0629 \u2713','success');
    }catch(err){
      if(typeof showToast==='function') showToast('\u062d\u064f\u0641\u0638 \u0645\u062d\u0644\u064a\u0627\u064b','success');
    }
  };

  function installPatches(){
    if(typeof renderCard !== 'function') return false;
    if(renderCard._dualPatched) return true;

    var _renderCard = renderCard;
    window.renderCard = function(item){
      var html = _renderCard(item);
      html = html.replace(/<span class="product-price-badge">[\s\S]*?<\/span>/g, '');
      var priceHtml = '<div class="product-price">'+formatPrices(item)+'</div>';
      html = html.replace(/(<h3 class="product-name">[\s\S]*?<\/h3>)/, '$1'+priceHtml);
      html = html.replace(/<div class="product-actions">[\s\S]*?<\/div>/g, '');
      var id = item.id;
      var menuHtml =
        '<div class="admin-controls">' +
          '<button type="button" class="admin-menu-btn" onclick="event.stopPropagation();toggleAdminMenu(this)">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>' +
          '</button>' +
          '<div class="admin-dropdown">' +
            '<button type="button" onclick="event.stopPropagation();closeAllAdminMenus();openEditItem(\''+id+'\')">\u062a\u0639\u062f\u064a\u0644</button>' +
            '<button type="button" class="danger" onclick="event.stopPropagation();closeAllAdminMenus();deleteItem(\''+id+'\')">\u062d\u0630\u0641</button>' +
          '</div></div>';
      html = html.replace(/<div class="admin-controls">[\s\S]*?<\/div>/, menuHtml);
      return html;
    };
    window.renderCard._dualPatched = true;

    if(typeof openEditItem === 'function' && !openEditItem._dualPatched){
      var _oei = openEditItem;
      window.openEditItem = function(itemId){
        _oei(itemId);
        setTimeout(function(){
          var item = items.find(function(i){return i.id===itemId;});
          if(!item) return;
          var priceInput = document.getElementById('editPrice');
          if(!priceInput) return;
          var group = priceInput.closest('.form-group');
          if(!group || group.dataset.dual) return;
          group.dataset.dual = '1';
          var syp = item.price_syp != null ? item.price_syp : (item.price||'');
          var tryV = item.price_try != null ? item.price_try : '';
          group.innerHTML =
            '<label>\u0627\u0644\u0633\u0639\u0631 (\u0644\u064a\u0631\u0629 \u0633\u0648\u0631\u064a\u0629)</label><input type="number" id="editPriceSyp" value="'+syp+'" min="0" step="1" required>'+
            '<label style="margin-top:10px;display:block">\u0627\u0644\u0633\u0639\u0631 (\u0644\u064a\u0631\u0629 \u062a\u0631\u0643\u064a\u0629 \u20ba)</label><input type="number" id="editPriceTry" value="'+tryV+'" min="0" step="0.5">';
        }, 50);
      };
      window.openEditItem._dualPatched = true;
    }

    if(typeof saveEditItem === 'function' && !saveEditItem._dualPatched){
      var _sei = saveEditItem;
      window.saveEditItem = async function(e, itemId){
        e.preventDefault();
        var sypEl = document.getElementById('editPriceSyp');
        var tryEl = document.getElementById('editPriceTry');
        if(sypEl && tryEl && typeof sb !== 'undefined'){
          var name = document.getElementById('editName').value.trim();
          var description = document.getElementById('editDesc').value.trim();
          var price_syp = Number(sypEl.value)||0;
          var price_try = Number(tryEl.value)||0;
          var image_url = document.getElementById('editImage').value.trim();
          try{
            var res = await sb.from('items').update({name:name,description:description,price:price_syp,price_syp:price_syp,price_try:price_try,image_url:image_url}).eq('id', itemId);
            if(res.error) throw res.error;
            var idx = items.findIndex(function(i){return i.id===itemId;});
            if(idx!==-1) items[idx] = Object.assign({}, items[idx], {name:name,description:description,price:price_syp,price_syp:price_syp,price_try:price_try,image_url:image_url});
            if(typeof renderMenu==='function') renderMenu();
            if(typeof closeModal==='function') closeModal();
            if(typeof showToast==='function') showToast('\u062a\u0645 \u2713','success');
          }catch(err){ if(typeof showToast==='function') showToast('\u0641\u0634\u0644: '+(err.message||''),'error'); }
          return;
        }
        return _sei(e, itemId);
      };
      window.saveEditItem._dualPatched = true;
    }

    if(typeof openAddItem === 'function' && !openAddItem._dualPatched){
      var _oai = openAddItem;
      window.openAddItem = function(categoryId){
        _oai(categoryId);
        setTimeout(function(){
          var priceInput = document.getElementById('editPrice');
          if(!priceInput) return;
          var group = priceInput.closest('.form-group');
          if(!group || group.dataset.dual) return;
          group.dataset.dual = '1';
          group.innerHTML =
            '<label>\u0627\u0644\u0633\u0639\u0631 (\u0644\u064a\u0631\u0629 \u0633\u0648\u0631\u064a\u0629)</label><input type="number" id="editPriceSyp" min="0" step="1" required>'+
            '<label style="margin-top:10px;display:block">\u0627\u0644\u0633\u0639\u0631 (\u0644\u064a\u0631\u0629 \u062a\u0631\u0643\u064a\u0629 \u20ba)</label><input type="number" id="editPriceTry" min="0" step="0.5">';
        }, 50);
      };
      window.openAddItem._dualPatched = true;
    }

    if(typeof saveNewItem === 'function' && !saveNewItem._dualPatched){
      var _sni = saveNewItem;
      window.saveNewItem = async function(e, categoryId){
        e.preventDefault();
        var sypEl = document.getElementById('editPriceSyp');
        var tryEl = document.getElementById('editPriceTry');
        if(sypEl && typeof sb !== 'undefined'){
          var name = document.getElementById('editName').value.trim();
          var description = document.getElementById('editDesc').value.trim();
          var price_syp = Number(sypEl.value)||0;
          var price_try = tryEl ? (Number(tryEl.value)||0) : 0;
          var image_url = document.getElementById('editImage').value.trim();
          var catItems = items.filter(function(i){return i.category_id===categoryId;});
          var sort_order = catItems.length ? Math.max.apply(null, catItems.map(function(i){return i.sort_order||0;}))+1 : 1;
          try{
            var res = await sb.from('items').insert([{category_id:categoryId,name:name,description:description,price:price_syp,price_syp:price_syp,price_try:price_try,image_url:image_url,sort_order:sort_order}]).select().single();
            if(res.error) throw res.error;
            items.push(res.data);
            if(typeof renderMenu==='function') renderMenu();
            if(typeof closeModal==='function') closeModal();
            if(typeof showToast==='function') showToast('\u062a\u0645\u062a \u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u2713','success');
          }catch(err){ if(typeof showToast==='function') showToast('\u0641\u0634\u0644: '+(err.message||''),'error'); }
          return;
        }
        return _sni(e, categoryId);
      };
      window.saveNewItem._dualPatched = true;
    }

    if(typeof loadAll === 'function' && !loadAll._brandPatched){
      var _loadAll = loadAll;
      window.loadAll = async function(){
        await _loadAll();
        try{
          var res = await sb.from('settings').select('*').eq('id',1).maybeSingle();
          if(res.data){
            var local = loadBrandLocal();
            if(res.data.site_name && !local.site_name) local.site_name = res.data.site_name;
            if(res.data.hero_subtitle != null && local.hero_subtitle == null) local.hero_subtitle = res.data.hero_subtitle;
            if(res.data.show_logo_icon != null && local.show_logo_icon == null) local.show_logo_icon = res.data.show_logo_icon;
            saveBrandLocal(local);
          }
        }catch(e){}
        applySiteBranding();
      };
      window.loadAll._brandPatched = true;
    }

    if(typeof renderAdminPanel === 'function' && !renderAdminPanel._seedRemoved){
      var _rap = renderAdminPanel;
      window.renderAdminPanel = function(){
        _rap();
        var body = document.getElementById('adminBody');
        if(!body) return;
        body.querySelectorAll('button').forEach(function(btn){
          var t = (btn.textContent||'').trim();
          if(t.indexOf('\u062a\u0639\u0628\u0626\u0629') !== -1 || (btn.getAttribute('onclick')||'').indexOf('seedDefaultData') !== -1) btn.remove();
        });
        var tabContent = document.getElementById('adminTabContent');
        if(tabContent) injectBrandingForm(tabContent);
        else injectBrandingForm(body);
      };
      window.renderAdminPanel._seedRemoved = true;
    }

    if(typeof renderAdminTabContent === 'function' && !renderAdminTabContent._brandPatched){
      var _ratc = renderAdminTabContent;
      window.renderAdminTabContent = function(){
        _ratc();
        var el = document.getElementById('adminTabContent');
        if(el) injectBrandingForm(el);
      };
      window.renderAdminTabContent._brandPatched = true;
    }

    if(typeof renderMenu === 'function'){ try { renderMenu(); } catch(e){} }
    applySiteBranding();
    return true;
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applySiteBranding);
  } else {
    applySiteBranding();
  }

  var tries = 0;
  var t = setInterval(function(){
    tries++;
    if(installPatches() || tries > 50){
      clearInterval(t);
      applySiteBranding();
    }
  }, 200);
})();
