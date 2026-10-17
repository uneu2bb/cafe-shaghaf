/* Remove All filter + search-all + Admin items browser */
(function(){
  function patchCategoryPills(){
    if(typeof renderCategoryPills !== 'function' || renderCategoryPills._noAll) return;
    window.renderCategoryPills = function(){
      var el = document.getElementById('catPills');
      if(!el) return;
      var hasSearch = (typeof searchQuery !== 'undefined' && searchQuery && String(searchQuery).trim());
      if(!hasSearch && typeof activeCategory !== 'undefined' && activeCategory === 'all' && categories && categories.length){
        var sorted = categories.slice().sort(function(a,b){ return (a.sort_order||0)-(b.sort_order||0); });
        activeCategory = sorted[0].id;
      }
      var html = '';
      (categories||[]).slice().sort(function(a,b){ return (a.sort_order||0)-(b.sort_order||0); }).forEach(function(c){
        var active = (!hasSearch && activeCategory===c.id) ? 'active' : '';
        html += '<button class="cat-btn '+active+'" onclick="filterCategory(\''+c.id+'\')">'+escapeHtml(c.name)+'</button>';
      });
      el.innerHTML = html;
    };
    window.renderCategoryPills._noAll = true;
    try { renderCategoryPills(); } catch(e){}
  }

  function fixActiveCat(){
    var hasSearch = (typeof searchQuery !== 'undefined' && searchQuery && String(searchQuery).trim());
    if(hasSearch) return;
    if(typeof activeCategory !== 'undefined' && activeCategory === 'all' && typeof categories !== 'undefined' && categories.length){
      var sorted = categories.slice().sort(function(a,b){ return (a.sort_order||0)-(b.sort_order||0); });
      activeCategory = sorted[0].id;
      if(typeof renderCategoryPills === 'function') renderCategoryPills();
      if(typeof renderMenu === 'function') renderMenu();
    }
  }

  function patchRenderMenuSearch(){
    if(typeof renderMenu !== 'function' || renderMenu._searchAllPatched) return;
    var _rm = renderMenu;
    window.renderMenu = function(){
      var hasSearch = (typeof searchQuery !== 'undefined' && searchQuery && String(searchQuery).trim());
      var savedCat = activeCategory;
      if(hasSearch) activeCategory = 'all';
      try {
        _rm();
        if(hasSearch){
          var titleEl = document.getElementById('currentCatTitle');
          if(titleEl) titleEl.textContent = '\u0646\u062a\u0627\u0626\u062c \u0627\u0644\u0628\u062d\u062b: ' + searchQuery;
          var grid = document.getElementById('menuGrid');
          var noRes = document.getElementById('noResults');
          if(grid && typeof items !== 'undefined'){
            var q = String(searchQuery).toLowerCase();
            var list = items.filter(function(i){
              if(typeof isItemHidden === 'function' && typeof isAdmin !== 'undefined' && !isAdmin && isItemHidden(i)) return false;
              var n = (i.name||'').toLowerCase();
              var d = (i.description||'').toLowerCase();
              return n.indexOf(q) !== -1 || d.indexOf(q) !== -1;
            });
            if(list.length === 0){
              grid.innerHTML = '';
              if(noRes) noRes.style.display = 'block';
            } else {
              if(noRes) noRes.style.display = 'none';
              if(typeof renderCard === 'function'){
                grid.innerHTML = list.map(function(item){ return renderCard(item); }).join('');
              }
            }
          }
        }
      } finally {
        if(hasSearch) activeCategory = 'all';
        else activeCategory = savedCat;
      }
    };
    window.renderMenu._searchAllPatched = true;
  }

  function patchSearchInput(){
    var input = document.getElementById('searchInput');
    if(!input || input._searchPatched) return;
    input._searchPatched = true;
    input.addEventListener('input', function(e){
      searchQuery = e.target.value.trim().toLowerCase();
      if(searchQuery){
        activeCategory = 'all';
      } else if(categories && categories.length){
        var sorted = categories.slice().sort(function(a,b){ return (a.sort_order||0)-(b.sort_order||0); });
        activeCategory = sorted[0].id;
      }
      if(typeof renderCategoryPills === 'function') renderCategoryPills();
      if(typeof renderMenu === 'function') renderMenu();
    });
  }

  window.adminItemsCatId = null;

  window.openAdminItemsForCat = function(catId){
    adminItemsCatId = catId;
    adminTab = 'items';
    if(typeof renderAdminPanel === 'function') renderAdminPanel();
    renderAdminItemsList();
  };

  function renderAdminItemsList(){
    var el = document.getElementById('adminTabContent');
    if(!el) return;
    var sortedCats = (categories||[]).slice().sort(function(a,b){ return (a.sort_order||0)-(b.sort_order||0); });

    if(!adminItemsCatId){
      var html = '<h3 style="margin-bottom:12px;color:var(--teal-900)">\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0623\u0635\u0646\u0627\u0641 \u062d\u0633\u0628 \u0627\u0644\u0642\u0633\u0645</h3>';
      html += '<p style="color:var(--gray-600);font-size:0.9rem;margin-bottom:14px;font-weight:600">\u0627\u062e\u062a\u0631 \u0642\u0633\u0645\u0627\u064b \u0644\u0639\u0631\u0636 \u0623\u0635\u0646\u0627\u0641\u0647 \u0648\u062a\u0639\u062f\u064a\u0644\u0647\u0627</p>';
      sortedCats.forEach(function(c){
        var count = (items||[]).filter(function(i){ return i.category_id === c.id; }).length;
        html += '<button type="button" class="btn-secondary" style="width:100%;margin-bottom:8px;text-align:right;display:flex;justify-content:space-between;align-items:center" onclick="openAdminItemsForCat(\''+c.id+'\')">'
          + '<span>'+escapeHtml(c.name)+'</span>'
          + '<span style="background:var(--teal-50);color:var(--teal-700);padding:4px 10px;border-radius:999px;font-size:0.8rem;font-weight:800">'+count+'</span>'
          + '</button>';
      });
      el.innerHTML = html;
      return;
    }

    var cat = sortedCats.find(function(c){ return c.id === adminItemsCatId; });
    var catItems = (items||[]).filter(function(i){ return i.category_id === adminItemsCatId; })
      .sort(function(a,b){ return (a.sort_order||0)-(b.sort_order||0); });

    var html = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">'
      + '<button type="button" class="btn-secondary" onclick="adminItemsCatId=null;renderAdminItemsList()" style="padding:8px 12px">\u2192 \u0631\u062c\u0648\u0639</button>'
      + '<h3 style="margin:0;color:var(--teal-900);flex:1">'+(cat?escapeHtml(cat.name):'')+'</h3>'
      + '</div>';
    html += '<button type="button" class="btn-submit" style="margin-bottom:14px" onclick="openAddItem(\''+adminItemsCatId+'\')">\u2795 \u0625\u0636\u0627\u0641\u0629 \u0635\u0646\u0641 \u0644\u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645</button>';

    if(!catItems.length){
      html += '<p style="color:var(--gray-600);text-align:center;padding:20px;font-weight:600">\u0644\u0627 \u062a\u0648\u062c\u062f \u0623\u0635\u0646\u0627\u0641 \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645</p>';
    } else {
      html += '<div style="display:flex;flex-direction:column;gap:8px">';
      catItems.forEach(function(item){
        var price = '';
        try {
          if(typeof formatPrices === 'function') price = formatPrices(item);
          else price = (item.price_try || item.price_syp || item.price || '') + '';
        } catch(e){}
        var hidden = item.is_hidden === true || item.is_hidden === 'true' || item.is_hidden === 1;
        html += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:#fff;border:1px solid var(--gray-200);border-radius:12px'+(hidden?';opacity:0.65':'')+'">'
          + (item.image_url ? '<img src="'+escapeHtml(item.image_url)+'" style="width:48px;height:48px;border-radius:10px;object-fit:cover;flex-shrink:0">' : '<div style="width:48px;height:48px;border-radius:10px;background:var(--teal-50);flex-shrink:0"></div>')
          + '<div style="flex:1;min-width:0">'
          + '<div style="font-weight:800;font-size:0.95rem;color:var(--gray-900);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escapeHtml(item.name)+'</div>'
          + '<div style="font-size:0.85rem;font-weight:700;color:var(--teal-700)">'+escapeHtml(price)+(hidden?' \u00b7 \u0645\u062e\u0641\u064a':'')+'</div>'
          + '</div>'
          + '<button type="button" class="btn-secondary" style="padding:8px 10px;font-size:0.85rem" onclick="openEditItem(\''+item.id+'\')">\u062a\u0639\u062f\u064a\u0644</button>'
          + '<button type="button" class="btn-secondary" style="padding:8px 10px;font-size:0.85rem;color:#C62828" onclick="deleteItem(\''+item.id+'\')">\u062d\u0630\u0641</button>'
          + '</div>';
      });
      html += '</div>';
    }
    el.innerHTML = html;
  }
  window.renderAdminItemsList = renderAdminItemsList;

  function patchAdminPanel(){
    if(typeof renderAdminPanel !== 'function' || renderAdminPanel._itemsTab) return;
    var _rap = renderAdminPanel;
    window.renderAdminPanel = function(){
      _rap();
      var tabs = document.querySelector('.admin-tabs');
      if(tabs && !tabs.querySelector('[data-tab="items"]')){
        var btn = document.createElement('button');
        btn.className = 'admin-tab' + (adminTab === 'items' ? ' active' : '');
        btn.setAttribute('data-tab', 'items');
        btn.textContent = '\u0627\u0644\u0623\u0635\u0646\u0627\u0641';
        btn.onclick = function(){ adminTab = 'items'; adminItemsCatId = null; renderAdminPanel(); };
        var catsBtn = null;
        tabs.querySelectorAll('.admin-tab').forEach(function(b){
          if((b.textContent||'').indexOf('\u0623\u0642\u0633\u0627\u0645') !== -1 || (b.getAttribute('onclick')||'').indexOf('cats') !== -1) catsBtn = b;
        });
        if(catsBtn && catsBtn.nextSibling) tabs.insertBefore(btn, catsBtn.nextSibling);
        else tabs.appendChild(btn);
      }
      tabs && tabs.querySelectorAll('.admin-tab').forEach(function(b){
        if(b.getAttribute('data-tab') === 'items'){
          b.classList.toggle('active', adminTab === 'items');
        } else if(adminTab === 'items'){
          b.classList.remove('active');
        }
      });
      if(adminTab === 'items'){
        renderAdminItemsList();
      }
    };
    window.renderAdminPanel._itemsTab = true;
  }

  var tries = 0;
  var t = setInterval(function(){
    tries++;
    patchCategoryPills();
    patchRenderMenuSearch();
    patchSearchInput();
    patchAdminPanel();
    fixActiveCat();
    if(tries > 50) clearInterval(t);
  }, 200);
})();
