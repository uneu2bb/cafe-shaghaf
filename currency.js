/* Dual currency + safety: remove seed button */
(function(){
  // Safety: disable seed immediately
  window.seedDefaultData = function(){
    if(typeof showToast==='function') showToast('\u062a\u0645 \u062a\u0639\u0637\u064a\u0644 \u062a\u0639\u0628\u0626\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0629','error');
  };

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

  function installPatches(){
    if(typeof renderCard !== 'function') return false;
    if(renderCard._dualPatched) return true;

    var _renderCard = renderCard;
    window.renderCard = function(item){
      var html = _renderCard(item);
      html = html.replace(/(<span class="product-price-badge">)[^<]+(<\/span>)/, '$1'+formatPrices(item)+'$2');
      return html;
    };
    window.renderCard._dualPatched = true;

    if(typeof updateCartBar === 'function' && !updateCartBar._dualPatched){
      window.updateCartBar = function(){
        var bar = document.getElementById('cartBar');
        if(!bar || typeof cart==='undefined' || typeof items==='undefined') return;
        var count = Object.values(cart).reduce(function(a,b){return a+b;},0);
        var totalSyp=0, totalTry=0;
        Object.keys(cart).forEach(function(id){
          var item = items.find(function(i){return i.id===id;});
          if(!item) return;
          var p = getItemPrices(item);
          totalSyp += p.syp * cart[id];
          totalTry += p.try * cart[id];
        });
        if(count>0){
          bar.style.display='block';
          var badge = document.getElementById('cartCountBadge');
          if(badge) badge.textContent = count;
          var txt = [];
          if(totalSyp>0) txt.push(fmt(totalSyp,'syp'));
          if(totalTry>0) txt.push(fmt(totalTry,'try'));
          var totalEl = document.getElementById('cartTotalText');
          if(totalEl) totalEl.textContent = txt.join(' \u00b7 ') || '0';
        } else {
          bar.style.display='none';
        }
      };
      window.updateCartBar._dualPatched = true;
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
            var res = await sb.from('items').update({
              name:name, description:description,
              price: price_syp, price_syp: price_syp, price_try: price_try,
              image_url: image_url
            }).eq('id', itemId);
            if(res.error) throw res.error;
            var idx = items.findIndex(function(i){return i.id===itemId;});
            if(idx!==-1){
              items[idx] = Object.assign({}, items[idx], {
                name:name, description:description,
                price:price_syp, price_syp:price_syp, price_try:price_try, image_url:image_url
              });
            }
            if(typeof renderMenu==='function') renderMenu();
            if(typeof closeModal==='function') closeModal();
            if(typeof showToast==='function') showToast('\u062a\u0645 \u2713','success');
          }catch(err){
            if(typeof showToast==='function') showToast('\u0641\u0634\u0644: '+(err.message||''),'error');
          }
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
            var res = await sb.from('items').insert([{
              category_id: categoryId, name:name, description:description,
              price:price_syp, price_syp:price_syp, price_try:price_try,
              image_url:image_url, sort_order:sort_order
            }]).select().single();
            if(res.error) throw res.error;
            items.push(res.data);
            if(typeof renderMenu==='function') renderMenu();
            if(typeof closeModal==='function') closeModal();
            if(typeof showToast==='function') showToast('\u062a\u0645\u062a \u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u2713','success');
          }catch(err){
            if(typeof showToast==='function') showToast('\u0641\u0634\u0644: '+(err.message||''),'error');
          }
          return;
        }
        return _sni(e, categoryId);
      };
      window.saveNewItem._dualPatched = true;
    }

    // Remove seed button from admin panel
    window.seedDefaultData = function(){
      if(typeof showToast==='function') showToast('\u062a\u0645 \u062a\u0639\u0637\u064a\u0644 \u062a\u0639\u0628\u0626\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0629','error');
    };
    if(typeof renderAdminPanel === 'function' && !renderAdminPanel._seedRemoved){
      var _rap = renderAdminPanel;
      window.renderAdminPanel = function(){
        _rap();
        var body = document.getElementById('adminBody');
        if(!body) return;
        body.querySelectorAll('button').forEach(function(btn){
          var t = (btn.textContent||'').trim();
          if(t.indexOf('\u062a\u0639\u0628\u0626\u0629') !== -1 || (btn.getAttribute('onclick')||'').indexOf('seedDefaultData') !== -1){
            btn.remove();
          }
        });
      };
      window.renderAdminPanel._seedRemoved = true;
    }

    if(typeof renderMenu === 'function'){ try { renderMenu(); } catch(e){} }
    if(typeof updateCartBar === 'function'){ try { updateCartBar(); } catch(e){} }
    return true;
  }

  var tries = 0;
  var t = setInterval(function(){
    tries++;
    if(installPatches() || tries > 40) clearInterval(t);
  }, 250);
})();
