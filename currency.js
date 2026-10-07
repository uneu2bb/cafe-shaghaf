/* Brand + hide + dual prices + hero + drag-drop reorder */
(function(){
  var BRAND_KEY = 'shaghaf_brand_v1';

  window.seedDefaultData = function(){
    if(typeof showToast==='function') showToast('\u062a\u0645 \u062a\u0639\u0637\u064a\u0644','error');
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
    var hasLocalHero = local && Object.prototype.hasOwnProperty.call(local, 'hero_subtitle');
    var hasLocalName = local && Object.prototype.hasOwnProperty.call(local, 'site_name');
    var hasLocalIcon = local && Object.prototype.hasOwnProperty.call(local, 'show_logo_icon');
    var hasLocalCover = local && Object.prototype.hasOwnProperty.call(local, 'hero_image_url');
    return {
      site_name: hasLocalName ? (local.site_name || '\u0634\u063a\u0641') : (s.site_name || '\u0634\u063a\u0641'),
      hero_subtitle: hasLocalHero ? local.hero_subtitle : (s.hero_subtitle != null ? s.hero_subtitle : ''),
      show_logo_icon: hasLocalIcon ? !!local.show_logo_icon : (s.show_logo_icon !== false && s.show_logo_icon !== 'false'),
      hero_image_url: hasLocalCover ? (local.hero_image_url || '') : (s.hero_image_url || '')
    };
  }

  function applySiteBranding(){
    var b = getBrand();
    if(typeof settings !== 'undefined'){
      settings.site_name = b.site_name;
      settings.hero_subtitle = b.hero_subtitle;
      settings.show_logo_icon = b.show_logo_icon;
      settings.hero_image_url = b.hero_image_url;
    }
    var name = b.site_name || '\u0634\u063a\u0641';
    var hero = b.hero_subtitle;
    var showIcon = !!b.show_logo_icon;
    var coverUrl = b.hero_image_url || '';
    var heroTitle = document.getElementById('heroTitle');
    if(heroTitle) heroTitle.style.display = 'none';
    var overlay = document.getElementById('heroOverlay');
    if(overlay && coverUrl){
      overlay.style.backgroundImage = 'url("'+coverUrl.replace(/"/g,'')+'")';
      overlay.style.backgroundSize = 'cover';
      overlay.style.backgroundPosition = 'center';
      overlay.style.opacity = '0.5';
    }
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
    if(heroSub){
      if(hero != null) heroSub.textContent = hero;
      heroSub.style.display = (hero && String(hero).trim()) ? '' : 'none';
    }
    try { document.title = name; } catch(e){}
    var logoIcon = document.getElementById('logoIcon');
    var footerIcon = document.getElementById('footerLogoIcon');
    var logoImg = document.getElementById('logoImg');
    var hasLogoImg = logoImg && logoImg.getAttribute('src') && logoImg.style.display !== 'none';
    if(logoIcon){
      if(!showIcon || hasLogoImg) logoIcon.style.setProperty('display', 'none', 'important');
      else logoIcon.style.removeProperty('display');
    }
    if(footerIcon){
      if(!showIcon) footerIcon.style.setProperty('display', 'none', 'important');
      else footerIcon.style.removeProperty('display');
    }
  }
  window.applySiteBranding = applySiteBranding;

  function fetchBrandFromServer(){
    if(typeof sb === 'undefined' || !sb) return;
    sb.from('settings').select('*').eq('id',1).maybeSingle().then(function(res){
      if(!res || !res.data) return;
      var local = {
        site_name: res.data.site_name || '\u0634\u063a\u0641',
        hero_subtitle: res.data.hero_subtitle != null ? res.data.hero_subtitle : '',
        show_logo_icon: res.data.show_logo_icon !== false && res.data.show_logo_icon !== 'false',
        hero_image_url: res.data.hero_image_url || ''
      };
      saveBrandLocal(local);
      if(typeof settings !== 'undefined'){
        settings.site_name = local.site_name;
        settings.hero_subtitle = local.hero_subtitle;
        settings.show_logo_icon = local.show_logo_icon;
        settings.hero_image_url = local.hero_image_url;
      }
      applySiteBranding();
    }).catch(function(){});
  }
  var _brandFetchTries = 0;
  var _brandFetchTimer = setInterval(function(){
    _brandFetchTries++;
    if(typeof sb !== 'undefined' && sb){
      clearInterval(_brandFetchTimer);
      fetchBrandFromServer();
    } else if(_brandFetchTries > 40) clearInterval(_brandFetchTimer);
  }, 250);

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
      '<div class="form-group"><label>\u0635\u0648\u0631\u0629 \u0627\u0644\u063a\u0644\u0627\u0641</label>'+
        (b.hero_image_url ? '<img class="upload-preview" id="heroCoverPreview" src="'+escapeHtmlSafe(b.hero_image_url)+'" style="width:100%;max-height:140px;object-fit:cover;border-radius:12px;margin:8px 0;">' : '<img class="upload-preview" id="heroCoverPreview" style="display:none;width:100%;max-height:140px;object-fit:cover;border-radius:12px;margin:8px 0;">')+
        '<input type="url" id="setHeroImageUrl" value="'+escapeHtmlSafe(b.hero_image_url||'')+'" placeholder="\u0631\u0627\u0628\u0637">'+
        '<button type="button" class="btn-upload" onclick="uploadHeroCover()">\u0631\u0641\u0639 \u0635\u0648\u0631\u0629 \u0627\u0644\u063a\u0644\u0627\u0641</button></div>'+
      '<div class="form-group"><label><input type="checkbox" id="setShowLogoIcon" '+(b.show_logo_icon?'checked':'')+'> \u0625\u0638\u0647\u0627\u0631 \u0623\u064a\u0642\u0648\u0646\u0629</label></div>'+
      '<button type="button" class="btn-submit" onclick="saveSiteBranding()">\u062d\u0641\u0638 \u0627\u0644\u0647\u0648\u064a\u0629</button>';
    el.appendChild(block);
  }

  window.saveSiteBranding = async function(){
    var site_name = ((document.getElementById('setSiteName')||{}).value||'').trim() || '\u0634\u063a\u0641';
    var hero_subtitle = ((document.getElementById('setHeroSubtitle')||{}).value||'').trim();
    var show_logo_icon = !!(document.getElementById('setShowLogoIcon')||{}).checked;
    var hero_image_url = ((document.getElementById('setHeroImageUrl')||{}).value||'').trim();
    var brand = { site_name: site_name, hero_subtitle: hero_subtitle, show_logo_icon: show_logo_icon, hero_image_url: hero_image_url };
    saveBrandLocal(brand);
    if(typeof settings !== 'undefined'){
      settings.site_name = site_name;
      settings.hero_subtitle = hero_subtitle;
      settings.show_logo_icon = show_logo_icon;
      settings.hero_image_url = hero_image_url;
    }
    applySiteBranding();
    try{
      if(typeof sb !== 'undefined'){
        var up = await sb.from('settings').upsert({
          id: 1, site_name: site_name, hero_subtitle: hero_subtitle,
          show_logo_icon: show_logo_icon, hero_image_url: hero_image_url,
          updated_at: new Date().toISOString()
        });
        if(up && up.error) throw up.error;
        if(typeof showToast==='function') showToast('\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0647\u0648\u064a\u0629 \u0623\u0648\u0646\u0644\u0627\u064a\u0646 \u2713','success');
      }
    }catch(err){
      if(typeof showToast==='function') showToast('\u0641\u0634\u0644: '+(err.message||''),'error');
    }
  };

  window.uploadHeroCover = function(){
    var input = document.getElementById('fileInput');
    if(!input) return;
    input.onchange = async function(e){
      var file = e.target.files && e.target.files[0];
      try { input.value = ''; } catch(x){}
      if(!file) return;
      try{
        var url = null;
        if(typeof uploadImageToSupabase === 'function') url = await uploadImageToSupabase(file);
        else if(typeof sb !== 'undefined'){
          var path = 'hero/'+Date.now()+'.jpg';
          var up = await sb.storage.from('site-images').upload(path, file, { contentType: file.type||'image/jpeg', upsert: true });
          if(up.error) throw up.error;
          url = sb.storage.from('site-images').getPublicUrl(path).data.publicUrl;
        }
        var field = document.getElementById('setHeroImageUrl');
        if(field) field.value = url;
        var prev = document.getElementById('heroCoverPreview');
        if(prev){ prev.src = url; prev.style.display = 'block'; }
        if(typeof showToast==='function') showToast('\u062a\u0645 \u0627\u0644\u0631\u0641\u0639 \u2014 \u0627\u062d\u0641\u0638','success');
      }catch(err){
        if(typeof showToast==='function') showToast('\u0641\u0634\u0644: '+(err.message||''),'error');
      }
    };
    input.click();
  };

  function isItemHidden(item){
    if(!item) return false;
    return item.is_hidden === true || item.is_hidden === 'true' || item.is_hidden === 1;
  }
  window.isItemHidden = isItemHidden;

  window.toggleHideItem = async function(itemId){
    var item = items.find(function(i){ return i.id === itemId; });
    if(!item) return;
    var next = !isItemHidden(item);
    try{
      var res = await sb.from('items').update({ is_hidden: next }).eq('id', itemId);
      if(res.error) throw res.error;
      item.is_hidden = next;
      var idx = items.findIndex(function(i){ return i.id === itemId; });
      if(idx !== -1) items[idx].is_hidden = next;
      if(typeof renderMenu === 'function') renderMenu();
      if(typeof showToast === 'function') showToast(next ? '\u062a\u0645 \u0625\u062e\u0641\u0627\u0621' : '\u0638\u0627\u0647\u0631 \u0627\u0644\u0622\u0646', 'success');
    }catch(err){
      if(typeof showToast === 'function') showToast('\u0641\u0634\u0644: '+(err.message||''),'error');
    }
  };

  /* ===== Drag & drop reorder items on main menu (admin) ===== */
  var _dragItemId = null;

  window.itemDragStart = function(e){
    if(typeof isAdmin === 'undefined' || !isAdmin){ e.preventDefault(); return; }
    var card = e.target.closest('.product-card');
    if(!card) return;
    _dragItemId = card.getAttribute('data-id');
    card.classList.add('dragging');
    try {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', _dragItemId);
    } catch(err){}
  };

  window.itemDragOver = function(e){
    if(!_dragItemId) return;
    e.preventDefault();
    try { e.dataTransfer.dropEffect = 'move'; } catch(err){}
    var card = e.target.closest('.product-card');
    document.querySelectorAll('.product-card.drag-over').forEach(function(el){ el.classList.remove('drag-over'); });
    if(card && card.getAttribute('data-id') !== _dragItemId) card.classList.add('drag-over');
  };

  window.itemDragEnd = function(e){
    document.querySelectorAll('.product-card.dragging, .product-card.drag-over').forEach(function(el){
      el.classList.remove('dragging', 'drag-over');
    });
    _dragItemId = null;
  };

  window.itemDrop = async function(e){
    e.preventDefault();
    e.stopPropagation();
    var target = e.target.closest('.product-card');
    if(!target || !_dragItemId) return;
    var targetId = target.getAttribute('data-id');
    if(!targetId || targetId === _dragItemId) return;

    var fromId = _dragItemId;
    var fromItem = items.find(function(i){ return i.id === fromId; });
    var toItem = items.find(function(i){ return i.id === targetId; });
    if(!fromItem || !toItem) return;

    var catId = toItem.category_id;
    fromItem.category_id = catId;

    var catItems = items.filter(function(i){ return i.category_id === catId; });
    catItems.sort(function(a,b){ return (a.sort_order||0) - (b.sort_order||0); });

    var fromIdx = catItems.findIndex(function(i){ return i.id === fromId; });
    var toIdx = catItems.findIndex(function(i){ return i.id === targetId; });
    if(fromIdx < 0 || toIdx < 0) return;

    var moved = catItems.splice(fromIdx, 1)[0];
    catItems.splice(toIdx, 0, moved);
    catItems.forEach(function(it, idx){ it.sort_order = idx + 1; });

    catItems.forEach(function(it){
      var gi = items.findIndex(function(x){ return x.id === it.id; });
      if(gi !== -1){
        items[gi].sort_order = it.sort_order;
        items[gi].category_id = it.category_id;
      }
    });

    if(typeof renderMenu === 'function') renderMenu();

    try{
      if(typeof sb !== 'undefined'){
        await Promise.all(catItems.map(function(it){
          return sb.from('items').update({ sort_order: it.sort_order, category_id: it.category_id }).eq('id', it.id);
        }));
        if(typeof showToast === 'function') showToast('\u062a\u0645 \u062d\u0641\u0638 \u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0623\u0635\u0646\u0627\u0641 \u2713','success');
      }
    }catch(err){
      if(typeof showToast === 'function') showToast('\u0641\u0634\u0644 \u062d\u0641\u0638 \u0627\u0644\u062a\u0631\u062a\u064a\u0628: '+(err.message||''),'error');
    }

    document.querySelectorAll('.product-card.dragging, .product-card.drag-over').forEach(function(el){
      el.classList.remove('dragging', 'drag-over');
    });
    _dragItemId = null;
  };

  var _dragCatId = null;
  window.catDragStart = function(e){
    var li = e.target.closest('.cat-manage-item');
    if(!li) return;
    _dragCatId = li.getAttribute('data-id');
    li.classList.add('dragging');
    try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', _dragCatId); } catch(err){}
  };
  window.catDragOver = function(e){
    if(!_dragCatId) return;
    e.preventDefault();
    var li = e.target.closest('.cat-manage-item');
    document.querySelectorAll('.cat-manage-item.drag-over').forEach(function(el){ el.classList.remove('drag-over'); });
    if(li && li.getAttribute('data-id') !== _dragCatId) li.classList.add('drag-over');
  };
  window.catDragEnd = function(e){
    document.querySelectorAll('.cat-manage-item.dragging, .cat-manage-item.drag-over').forEach(function(el){
      el.classList.remove('dragging', 'drag-over');
    });
    _dragCatId = null;
  };
  window.catDrop = async function(e){
    e.preventDefault();
    var target = e.target.closest('.cat-manage-item');
    if(!target || !_dragCatId) return;
    var targetId = target.getAttribute('data-id');
    if(!targetId || targetId === _dragCatId) return;
    var list = categories.slice().sort(function(a,b){ return (a.sort_order||0)-(b.sort_order||0); });
    var fromIdx = list.findIndex(function(c){ return c.id === _dragCatId; });
    var toIdx = list.findIndex(function(c){ return c.id === targetId; });
    if(fromIdx < 0 || toIdx < 0) return;
    var moved = list.splice(fromIdx, 1)[0];
    list.splice(toIdx, 0, moved);
    list.forEach(function(c, i){ c.sort_order = i + 1; });
    categories = list;
    try{
      if(typeof sb !== 'undefined'){
        await Promise.all(list.map(function(c){
          return sb.from('categories').update({ sort_order: c.sort_order }).eq('id', c.id);
        }));
      }
      if(typeof renderCategoryPills === 'function') renderCategoryPills();
      if(typeof renderAdminPanel === 'function') renderAdminPanel();
      if(typeof showToast === 'function') showToast('\u062a\u0645 \u062d\u0641\u0638 \u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0623\u0642\u0633\u0627\u0645 \u2713','success');
    }catch(err){
      if(typeof showToast === 'function') showToast('\u0641\u0634\u0644: '+(err.message||''),'error');
    }
    _dragCatId = null;
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
      var hidden = isItemHidden(item);
      var hideLabel = hidden ? '\u0625\u0638\u0647\u0627\u0631 \u0644\u0644\u0632\u0628\u0627\u0626\u0646' : '\u0625\u062e\u0641\u0627\u0621 \u0639\u0646 \u0627\u0644\u0632\u0628\u0627\u0626\u0646';
      var menuHtml =
        '<div class="admin-controls">' +
          '<button type="button" class="admin-menu-btn" onclick="event.stopPropagation();toggleAdminMenu(this)">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>' +
          '</button>' +
          '<div class="admin-dropdown">' +
            '<button type="button" onclick="event.stopPropagation();closeAllAdminMenus();openEditItem(\''+id+'\')">\u062a\u0639\u062f\u064a\u0644</button>' +
            '<button type="button" onclick="event.stopPropagation();closeAllAdminMenus();toggleHideItem(\''+id+'\')">'+hideLabel+'</button>' +
            '<button type="button" class="danger" onclick="event.stopPropagation();closeAllAdminMenus();deleteItem(\''+id+'\')">\u062d\u0630\u0641</button>' +
          '</div></div>';
      html = html.replace(/<div class="admin-controls">[\s\S]*?<\/div>/, menuHtml);
      if(hidden){
        html = html.replace('class="product-card"', 'class="product-card is-hidden"');
        if(html.indexOf('hidden-badge') === -1){
          html = html.replace('<div class="product-img-wrap">',
            '<div class="product-img-wrap"><span class="hidden-badge">\u0645\u062e\u0641\u064a</span>');
        }
      }
      return html;
    };
    window.renderCard._dualPatched = true;

    if(typeof renderMenu === 'function' && !renderMenu._hidePatched){
      var _rm = renderMenu;
      window.renderMenu = function(){
        var _all = items;
        var sorted = _all.slice().sort(function(a,b){
          var ca = String(a.category_id||'');
          var cb = String(b.category_id||'');
          if(ca !== cb) return ca < cb ? -1 : 1;
          return (Number(a.sort_order)||0) - (Number(b.sort_order)||0);
        });
        if(typeof isAdmin === 'undefined' || !isAdmin){
          items = sorted.filter(function(i){ return !isItemHidden(i); });
        } else {
          items = sorted;
        }
        try { _rm(); } finally { items = _all; }
      };
      window.renderMenu._hidePatched = true;
    }

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
            '<label>\u0627\u0644\u0633\u0639\u0631 (\u0644.\u0633)</label><input type="number" id="editPriceSyp" value="'+syp+'" min="0" step="1" required>'+
            '<label style="margin-top:10px;display:block">\u0627\u0644\u0633\u0639\u0631 (\u20ba)</label><input type="number" id="editPriceTry" value="'+tryV+'" min="0" step="0.5">';
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
            '<label>\u0627\u0644\u0633\u0639\u0631 (\u0644.\u0633)</label><input type="number" id="editPriceSyp" min="0" step="1" required>'+
            '<label style="margin-top:10px;display:block">\u0627\u0644\u0633\u0639\u0631 (\u20ba)</label><input type="number" id="editPriceTry" min="0" step="0.5">';
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
            var res = await sb.from('items').insert([{category_id:categoryId,name:name,description:description,price:price_syp,price_syp:price_syp,price_try:price_try,image_url:image_url,sort_order:sort_order,is_hidden:false}]).select().single();
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
            var local = {
              site_name: res.data.site_name || '\u0634\u063a\u0641',
              hero_subtitle: res.data.hero_subtitle != null ? res.data.hero_subtitle : '',
              show_logo_icon: res.data.show_logo_icon !== false && res.data.show_logo_icon !== 'false',
              hero_image_url: res.data.hero_image_url || ''
            };
            saveBrandLocal(local);
            if(typeof settings !== 'undefined'){
              settings.site_name = local.site_name;
              settings.hero_subtitle = local.hero_subtitle;
              settings.show_logo_icon = local.show_logo_icon;
              settings.hero_image_url = local.hero_image_url;
            }
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
