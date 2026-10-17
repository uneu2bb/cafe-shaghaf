/* Premium confirm dialog for Shaghaf */
(function(){
  function ensureModal(){
    if(document.getElementById('confirmModal')) return;
    var el = document.createElement('div');
    el.className = 'confirm-overlay';
    el.id = 'confirmModal';
    el.setAttribute('aria-hidden','true');
    el.innerHTML =
      '<div class="confirm-card" role="dialog" aria-modal="true">'+
        '<div class="confirm-icon" id="confirmIcon">'+
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+
            '<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>'+
          '</svg>'+
        '</div>'+
        '<h3 class="confirm-title" id="confirmTitle">\u062a\u0623\u0643\u064a\u062f</h3>'+
        '<p class="confirm-msg" id="confirmMsg"></p>'+
        '<div class="confirm-actions">'+
          '<button type="button" class="confirm-btn cancel" id="confirmCancel">\u0625\u0644\u063a\u0627\u0621</button>'+
          '<button type="button" class="confirm-btn danger" id="confirmOk">\u062d\u0630\u0641</button>'+
        '</div>'+
      '</div>';
    document.body.appendChild(el);
  }

  window.showConfirm = function(opts){
    opts = opts || {};
    ensureModal();
    return new Promise(function(resolve){
      var modal = document.getElementById('confirmModal');
      var titleEl = document.getElementById('confirmTitle');
      var msgEl = document.getElementById('confirmMsg');
      var okBtn = document.getElementById('confirmOk');
      var cancelBtn = document.getElementById('confirmCancel');
      var iconEl = document.getElementById('confirmIcon');
      if(titleEl) titleEl.textContent = opts.title || '\u062a\u0623\u0643\u064a\u062f';
      if(msgEl) msgEl.textContent = opts.message || '';
      if(okBtn){
        okBtn.textContent = opts.okText || '\u062d\u0630\u0641';
        okBtn.className = 'confirm-btn ' + (opts.okClass || 'danger');
      }
      if(cancelBtn) cancelBtn.textContent = opts.cancelText || '\u0625\u0644\u063a\u0627\u0621';
      if(iconEl){
        if(opts.warn) iconEl.classList.add('warn');
        else iconEl.classList.remove('warn');
      }
      function cleanup(result){
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden','true');
        okBtn.onclick = null;
        cancelBtn.onclick = null;
        modal.onclick = null;
        resolve(result);
      }
      okBtn.onclick = function(){ cleanup(true); };
      cancelBtn.onclick = function(){ cleanup(false); };
      modal.onclick = function(e){ if(e.target === modal) cleanup(false); };
      modal.classList.add('active');
      modal.setAttribute('aria-hidden','false');
    });
  };

  function patchDeletes(){
    if(typeof deleteItem === 'function' && !deleteItem._premiumConfirm){
      window.deleteItem = async function(itemId){
        var ok = await showConfirm({
          title: '\u062d\u0630\u0641 \u0627\u0644\u0635\u0646\u0641',
          message: '\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0635\u0646\u0641\u061f \u0644\u0627 \u064a\u0645\u0643\u0646 \u0627\u0644\u062a\u0631\u0627\u062c\u0639 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0625\u062c\u0631\u0627\u0621.',
          okText: '\u0646\u0639\u0645\u060c \u0627\u062d\u0630\u0641',
          cancelText: '\u0625\u0644\u063a\u0627\u0621',
          okClass: 'danger'
        });
        if(!ok) return;
        try{
          var res = await sb.from('items').delete().eq('id', itemId);
          if(res.error) throw res.error;
          items = items.filter(function(i){ return i.id !== itemId; });
          try { if(typeof cart !== 'undefined' && cart[itemId]) delete cart[itemId]; } catch(e){}
          if(typeof renderMenu === 'function') renderMenu();
          if(typeof showToast === 'function') showToast('\u062a\u0645 \u0627\u0644\u062d\u0630\u0641','success');
        }catch(err){
          if(typeof showToast === 'function') showToast('\u0641\u0634\u0644: '+(err.message||''),'error');
        }
      };
      window.deleteItem._premiumConfirm = true;
    }

    if(typeof deleteCategory === 'function' && !deleteCategory._premiumConfirm){
      window.deleteCategory = async function(catId){
        var catItems = items.filter(function(i){ return i.category_id === catId; });
        var msg = catItems.length
          ? ('\u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645 \u064a\u062d\u062a\u0648\u064a \u0639\u0644\u0649 '+catItems.length+' \u0635\u0646\u0641. \u0633\u064a\u062a\u0645 \u062d\u0630\u0641\u0647\u0627 \u062c\u0645\u064a\u0639\u0627\u064b. \u0647\u0644 \u062a\u0631\u064a\u062f \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629\u061f')
          : '\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645\u061f';
        var ok = await showConfirm({
          title: '\u062d\u0630\u0641 \u0627\u0644\u0642\u0633\u0645',
          message: msg,
          okText: '\u0646\u0639\u0645\u060c \u0627\u062d\u0630\u0641',
          cancelText: '\u0625\u0644\u063a\u0627\u0621',
          okClass: 'danger'
        });
        if(!ok) return;
        try{
          if(catItems.length){
            await sb.from('items').delete().eq('category_id', catId);
            items = items.filter(function(i){ return i.category_id !== catId; });
          }
          var res = await sb.from('categories').delete().eq('id', catId);
          if(res.error) throw res.error;
          categories = categories.filter(function(c){ return c.id !== catId; });
          if(typeof renderCategoryPills === 'function') renderCategoryPills();
          if(typeof renderMenu === 'function') renderMenu();
          if(typeof showToast === 'function') showToast('\u062a\u0645 \u0627\u0644\u062d\u0630\u0641','success');
        }catch(err){
          if(typeof showToast === 'function') showToast('\u0641\u0634\u0644: '+(err.message||''),'error');
        }
      };
      window.deleteCategory._premiumConfirm = true;
    }
  }

  var tries = 0;
  var t = setInterval(function(){
    tries++;
    patchDeletes();
    if((typeof deleteItem === 'function' && deleteItem._premiumConfirm) || tries > 40){
      clearInterval(t);
    }
  }, 250);
})();
