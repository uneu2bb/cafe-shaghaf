
const SUPABASE_URL = 'https://opvjcjohxcgagyzxtemh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KaWJM5urxHkjbg6tI6xB6w_n6c8--gk';
const STORAGE_BUCKET = 'site-images';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let categories = [];
let items = [];
let settings = {
  whatsapp: '', facebook: '', instagram: '',
  admin_password: 'shaghaf2024',
  logo_url: '', favicon_url: '',
  footer_text: ''
};
let cart = JSON.parse(localStorage.getItem('shaghaf_cart') || '{}');
let isAdmin = false;
let activeCategory = 'all';
let searchQuery = '';
let logoClickCount = 0;
let logoClickTimer = null;
let uploadTarget = null;
let adminTab = 'main';

document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  checkAdminSession();
  await loadAll();
});

async function loadAll() {
  const loadingEl = document.getElementById('loadingState');
  const menuEl = document.getElementById('menuArea');
  try {
    const [catsRes, itemsRes, settingsRes] = await Promise.all([
      sb.from('categories').select('*').order('sort_order', { ascending: true }),
      sb.from('items').select('*').order('sort_order', { ascending: true }),
      sb.from('settings').select('*').eq('id', 1).maybeSingle()
    ]);
    if (catsRes.error) throw catsRes.error;
    if (itemsRes.error) throw itemsRes.error;
    categories = catsRes.data || [];
    items = itemsRes.data || [];
    if (settingsRes.data) {
      settings = {
        whatsapp: settingsRes.data.whatsapp || '',
        facebook: settingsRes.data.facebook || '',
        instagram: settingsRes.data.instagram || '',
        admin_password: settingsRes.data.admin_password || 'shaghaf2024',
        logo_url: settingsRes.data.logo_url || '',
        favicon_url: settingsRes.data.favicon_url || '',
        footer_text: settingsRes.data.footer_text || ''
      };
    }
    applyBranding();
    renderCategoryPills();
    renderMenu();
    renderFooter();
    updateCartBar();
    loadingEl.style.display = 'none';
    menuEl.style.display = 'block';
  } catch (err) {
    console.error(err);
    loadingEl.innerHTML = '<p style="color:#C62828;font-weight:700;">حدث خطأ</p><p>'+(err.message||'')+'</p><button class="btn-submit" onclick="location.reload()">إعادة</button>';
  }
}

function applyBranding() {
  const logoImg = document.getElementById('logoImg');
  const logoIcon = document.getElementById('logoIcon');
  if (settings.logo_url) {
    logoImg.src = settings.logo_url;
    logoImg.style.display = 'block';
    logoIcon.style.display = 'none';
  } else {
    logoImg.style.display = 'none';
    logoIcon.style.display = 'inline';
  }
  if (settings.favicon_url) document.getElementById('faviconLink').href = settings.favicon_url;
}

function setupEventListeners() {
  window.addEventListener('scroll', () => {
    document.getElementById('header').classList.toggle('scrolled', window.scrollY > 40);
  });
  document.getElementById('logoBtn').addEventListener('click', (e) => {
    e.preventDefault();
    logoClickCount++;
    if (logoClickTimer) clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 2500);
    if (logoClickCount >= 5) { logoClickCount = 0; openAdminModal(); }
    else if (logoClickCount === 1) filterCategory('all');
  });
  document.getElementById('secretArea').addEventListener('click', () => {
    logoClickCount++;
    if (logoClickTimer) clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 2500);
    if (logoClickCount >= 5) { logoClickCount = 0; openAdminModal(); }
  });
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('adminModal').addEventListener('click', e => { if (e.target.id === 'adminModal') closeModal(); });
  document.getElementById('openCartBtn').addEventListener('click', openCart);
  document.getElementById('closeCartModal').addEventListener('click', closeCart);
  document.getElementById('cartModal').addEventListener('click', e => { if (e.target.id === 'cartModal') closeCart(); });
  document.getElementById('searchInput').addEventListener('input', e => {
    searchQuery = e.target.value.trim().toLowerCase();
    activeCategory = 'all';
    renderCategoryPills();
    renderMenu();
  });
  document.getElementById('fileInput').addEventListener('change', handleFileSelect);
}

function renderCategoryPills() {
  const el = document.getElementById('catPills');
  let html = '<button class="cat-btn '+(activeCategory==='all'?'active':'')+'" onclick="filterCategory(\'all\')">الكل</button>';
  categories.forEach(c => {
    html += '<button class="cat-btn '+(activeCategory===c.id?'active':'')+'" onclick="filterCategory(\''+c.id+'\')">'+escapeHtml(c.name)+'</button>';
  });
  el.innerHTML = html;
}

function filterCategory(catId) {
  activeCategory = catId;
  searchQuery = '';
  document.getElementById('searchInput').value = '';
  renderCategoryPills();
  renderMenu();
  document.getElementById('menuArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderMenu() {
  const grid = document.getElementById('menuGrid');
  const titleEl = document.getElementById('currentCatTitle');
  const noRes = document.getElementById('noResults');
  let filtered = [...items].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  if (activeCategory !== 'all') {
    filtered = filtered.filter(i => i.category_id === activeCategory);
    const cat = categories.find(c => c.id === activeCategory);
    titleEl.textContent = cat ? cat.name : 'الأصناف';
  } else {
    titleEl.textContent = searchQuery ? 'نتائج: '+searchQuery : 'كل الأصناف';
  }
  if (searchQuery) {
    filtered = filtered.filter(i => (i.name||'').toLowerCase().includes(searchQuery) || (i.description||'').toLowerCase().includes(searchQuery));
  }
  if (filtered.length === 0) { grid.innerHTML = ''; noRes.style.display = 'block'; return; }
  noRes.style.display = 'none';
  grid.innerHTML = filtered.map(item => renderCard(item)).join('');
}

function renderCard(item) {
  const qty = cart[item.id] || 0;
  const drag=isAdmin?' draggable="true" ondragstart="itemDragStart(event)" ondragover="itemDragOver(event)" ondrop="itemDrop(event)" ondragend="itemDragEnd(event)"':'';
  return '<div class="product-card" data-id="'+item.id+'"'+drag+'>'
    +'<div class="drag-handle-item"><span class="drag-handle">☰</span></div>'
    +'<div class="admin-controls">'
    +'<button class="admin-btn" onclick="openEditItem(\''+item.id+'\')">✏️</button>'
    +'<button class="admin-btn delete" onclick="deleteItem(\''+item.id+'\')">🗑️</button></div>'
    +'<div class="product-img-wrap"><img class="product-img" src="'+escapeHtml(item.image_url||'')+'" alt="'+escapeHtml(item.name)+'" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=400&fit=crop\'">'
    +'<span class="product-price-badge">'+item.price+' ر.س</span></div>'
    +'<div class="product-body"><h3 class="product-name">'+escapeHtml(item.name)+'</h3>'
    +'<p class="product-desc">'+escapeHtml(item.description||'')+'</p><div class="product-actions">'
    +(qty===0 ? '<button class="btn-add" onclick="changeQty(\''+item.id+'\',1)">+ إضافة</button>'
      : '<div class="qty-controls"><button class="qty-btn" onclick="changeQty(\''+item.id+'\',-1)">−</button><span class="qty-num">'+qty+'</span><button class="qty-btn" onclick="changeQty(\''+item.id+'\',1)">+</button></div>')
    +'</div></div></div>';
}

function saveCart() { localStorage.setItem('shaghaf_cart', JSON.stringify(cart)); updateCartBar(); renderMenu(); }
function changeQty(itemId, delta) {
  const next = (cart[itemId]||0)+delta;
  if (next<=0) delete cart[itemId]; else cart[itemId]=next;
  saveCart();
}
function updateCartBar() {
  const bar = document.getElementById('cartBar');
  const count = Object.values(cart).reduce((a,b)=>a+b,0);
  const total = Object.entries(cart).reduce((sum,[id,qty])=>{
    const item = items.find(i=>i.id===id);
    return sum+(item?item.price*qty:0);
  },0);
  if (count>0) {
    bar.style.display='block';
    document.getElementById('cartCountBadge').textContent=count;
    document.getElementById('cartTotalText').textContent=total.toFixed(0)+' ر.س';
  } else bar.style.display='none';
}

function openCart() {
  const body = document.getElementById('cartBody');
  const entries = Object.entries(cart);
  if (!entries.length) { body.innerHTML='<div class="cart-empty"><p>السلة فارغة</p></div>'; }
  else {
    let html='', total=0;
    entries.forEach(([id,qty])=>{
      const item=items.find(i=>i.id===id); if(!item)return;
      const line=item.price*qty; total+=line;
      html+='<div class="cart-item"><img class="cart-item-img" src="'+escapeHtml(item.image_url||'')+'">'
        +'<div class="cart-item-info"><div class="cart-item-name">'+escapeHtml(item.name)+'</div>'
        +'<div class="cart-item-price">'+item.price+' × '+qty+' = '+line+' ر.س</div></div>'
        +'<div class="cart-item-qty"><button class="qty-btn" onclick="changeQty(\''+id+'\',-1);openCart();">−</button>'
        +'<span class="qty-num">'+qty+'</span><button class="qty-btn" onclick="changeQty(\''+id+'\',1);openCart();">+</button></div></div>';
    });
    const hasWA = settings.whatsapp && settings.whatsapp.trim();
    html+='<div class="cart-summary"><div class="cart-summary-row"><span>المجموع</span><span>'+total.toFixed(0)+' ر.س</span></div>'
      +'<button class="btn-whatsapp" onclick="sendWhatsAppOrder()" '+(hasWA?'':'disabled')+'>'+(hasWA?'📱 إرسال عبر واتساب':'⚠️ أضف رقم واتساب')+'</button>'
      +'<button class="btn-clear-cart" onclick="clearCart()">تفريغ السلة</button></div>';
    body.innerHTML=html;
  }
  document.getElementById('cartModal').classList.add('active');
}
function closeCart(){ document.getElementById('cartModal').classList.remove('active'); }
function clearCart(){ cart={}; saveCart(); closeCart(); showToast('تم تفريغ السلة','success'); }
function sendWhatsAppOrder(){
  if(!settings.whatsapp){ showToast('رقم غير مضاف','error'); return; }
  const entries=Object.entries(cart); if(!entries.length)return;
  let msg='مرحباً، طلب من كافيه شغف:\n\n', total=0;
  entries.forEach(([id,qty])=>{ const item=items.find(i=>i.id===id); if(!item)return; const line=item.price*qty; total+=line; msg+='• '+item.name+' × '+qty+' = '+line+' ر.س\n'; });
  msg+='\nالمجموع: '+total.toFixed(0)+' ر.س';
  let phone=settings.whatsapp.replace(/[^0-9]/g,'');
  if(phone.startsWith('0')) phone='966'+phone.slice(1);
  window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(msg),'_blank');
}

function renderFooter(){
  const descEl=document.getElementById('footerDesc');
  if(descEl) descEl.textContent=settings.footer_text||'';
  const socialEl=document.getElementById('footerSocial');
  const iconFB='<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.62 23.1 24 18.1 24 12.07z"/></svg>';
  const iconIG='<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.35 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.3.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.41-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/></svg>';
  const iconWA='<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.8h-.01a9.77 9.77 0 01-4.97-1.36l-.36-.21-3.69.97 1-3.6-.24-.37a9.76 9.76 0 01-1.5-5.2c0-5.4 4.4-9.8 9.81-9.8 2.62 0 5.08 1.02 6.93 2.87a9.74 9.74 0 012.87 6.93c-.01 5.4-4.4 9.77-9.84 9.77zm8.35-18.12A11.75 11.75 0 0012.04 0C5.45 0 .1 5.35.1 11.94c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.65a11.9 11.9 0 005.73 1.46h.01c6.59 0 11.94-5.35 11.95-11.94a11.86 11.86 0 00-3.5-8.47z"/></svg>';
  let html='';
  if(settings.facebook) html+='<a class="social-btn fb" href="'+escapeHtml(settings.facebook)+'" target="_blank" rel="noopener" aria-label="فيسبوك">'+iconFB+'</a>';
  if(settings.instagram) html+='<a class="social-btn ig" href="'+escapeHtml(settings.instagram)+'" target="_blank" rel="noopener" aria-label="إنستغرام">'+iconIG+'</a>';
  if(settings.whatsapp){
    let phone=settings.whatsapp.replace(/[^0-9]/g,'');
    if(phone.startsWith('0')) phone='966'+phone.slice(1);
    html+='<a class="social-btn wa" href="https://wa.me/'+phone+'" target="_blank" rel="noopener" aria-label="واتساب">'+iconWA+'</a>';
  }
  socialEl.innerHTML=html;
}

function checkAdminSession(){ if(sessionStorage.getItem('shaghaf_admin')==='true'){ isAdmin=true; document.body.classList.add('admin-mode'); } }

function openAdminModal(){
  document.getElementById('adminModal').classList.add('active');
  adminTab='main';
  if(isAdmin) renderAdminPanel();
  else document.getElementById('adminBody').innerHTML='<form onsubmit="loginAdmin(event)"><p style="color:var(--gray-600);margin-bottom:8px">أدخل كلمة المرور</p><div class="form-group"><label>كلمة المرور</label><input type="password" id="adminPass" required></div><button type="submit" class="btn-submit">دخول</button></form>';
}

function renderAdminPanel(){
  const body=document.getElementById('adminBody');
  body.innerHTML='<div class="admin-panel"><div class="admin-status"><span>🟢</span><span>مسؤول</span></div>'
    +'<div class="admin-tabs">'
    +'<button class="admin-tab '+(adminTab==='main'?'active':'')+'" onclick="switchAdminTab(\'main\')">الرئيسية</button>'
    +'<button class="admin-tab '+(adminTab==='cats'?'active':'')+'" onclick="switchAdminTab(\'cats\')">الأقسام</button>'
    +'<button class="admin-tab '+(adminTab==='brand'?'active':'')+'" onclick="switchAdminTab(\'brand\')">الشعار</button>'
    +'<button class="admin-tab '+(adminTab==='contact'?'active':'')+'" onclick="switchAdminTab(\'contact\')">التواصل</button>'
    +'<button class="admin-tab '+(adminTab==='security'?'active':'')+'" onclick="switchAdminTab(\'security\')">الأمان</button></div>'
    +'<div id="adminTabContent"></div>'
    +'<div class="admin-actions" style="margin-top:20px">'
    +'<button class="btn-secondary" onclick="openAddItemPicker()">➕ إضافة صنف</button>'
    +'<button class="btn-secondary" onclick="seedDefaultData()">تعبئة بيانات</button>'
    +'<button class="btn-secondary" onclick="logoutAdmin()" style="background:#FFEBEE;color:#C62828">خروج</button></div></div>';
  renderAdminTabContent();
}
function switchAdminTab(tab){ adminTab=tab; renderAdminPanel(); }

function renderAdminTabContent(){
  const el=document.getElementById('adminTabContent'); if(!el)return;
  if(adminTab==='main'){
    el.innerHTML='<p style="color:var(--gray-600);font-size:0.9rem">اضغط ✏️ على أي صنف للتعديل. استخدم التبويبات لإدارة الأقسام والشعار وكلمة المرور.<br>💡 الدخول: اضغط اللوجو 5 مرات</p>';
  } else if(adminTab==='cats'){
    let list=categories.map((c,i)=>'<li class="cat-manage-item" draggable="true" data-id="'+c.id+'" data-index="'+i+'" ondragstart="catDragStart(event)" ondragover="catDragOver(event)" ondrop="catDrop(event)" ondragend="catDragEnd(event)"><span class="drag-handle">☰</span><span class="cat-name">'+escapeHtml(c.name)+'</span><div class="cat-actions">'
      +'<button onclick="openEditCategory(\''+c.id+'\')">✏️</button><button class="danger" onclick="deleteCategory(\''+c.id+'\')">🗑️</button></div></li>').join('');
    el.innerHTML='<h3 style="margin-bottom:12px;color:var(--blue-900)">إدارة الأقسام</h3><p style="font-size:0.85rem;color:var(--gray-600);margin-bottom:8px">اسحب ☰ للترتيب</p><ul class="cat-manage-list">'+(list||'<p>لا أقسام</p>')+'</ul><button class="btn-submit" style="margin-top:12px" onclick="openAddCategory()">➕ قسم جديد</button>';
  } else if(adminTab==='brand'){
    el.innerHTML='<h3 style="margin-bottom:12px;color:var(--blue-900)">الشعار</h3>'
      +'<div class="form-group"><label>لوجو</label>'+(settings.logo_url?'<img class="upload-preview" src="'+escapeHtml(settings.logo_url)+'">':'')
      +'<button type="button" class="btn-upload" onclick="triggerUpload(\'logo\')">📷 رفع لوجو</button>'
      +'<input type="url" id="setLogoUrl" value="'+escapeHtml(settings.logo_url||'')+'" placeholder="أو رابط" style="margin-top:8px"></div>'
      +'<div class="form-group"><label>أيقونة (Favicon)</label>'+(settings.favicon_url?'<img class="upload-preview" src="'+escapeHtml(settings.favicon_url)+'">':'')
      +'<button type="button" class="btn-upload" onclick="triggerUpload(\'favicon\')">📷 رفع أيقونة</button>'
      +'<input type="url" id="setFaviconUrl" value="'+escapeHtml(settings.favicon_url||'')+'" placeholder="أو رابط" style="margin-top:8px"></div>'
      +'<button class="btn-submit" onclick="saveBranding()">حفظ الشعار</button>';
  } else if(adminTab==='contact'){
    el.innerHTML='<h3 style="margin-bottom:12px;color:var(--blue-900)">التواصل والتذييل</h3>'
      +'<div class="form-group"><label>وصف أسفل الموقع</label><textarea id="setFooterText" rows="2">'+escapeHtml(settings.footer_text||'')+'</textarea></div>'
      +'<div class="form-group"><label>واتساب</label><input type="text" id="setWhatsapp" value="'+escapeHtml(settings.whatsapp||'')+'" placeholder="9665xxxxxxxx"></div>'
      +'<div class="form-group"><label>فيسبوك</label><input type="url" id="setFacebook" value="'+escapeHtml(settings.facebook||'')+'"></div>'
      +'<div class="form-group"><label>إنستغرام</label><input type="url" id="setInstagram" value="'+escapeHtml(settings.instagram||'')+'"></div>'
      +'<button class="btn-submit" onclick="saveSettings()">حفظ</button>';
  } else if(adminTab==='security'){
    el.innerHTML='<h3 style="margin-bottom:12px;color:var(--blue-900)">تغيير كلمة المرور</h3>'
      +'<div class="form-group"><label>الحالية</label><input type="password" id="oldPass"></div>'
      +'<div class="form-group"><label>الجديدة</label><input type="password" id="newPass" minlength="4"></div>'
      +'<div class="form-group"><label>تأكيد</label><input type="password" id="newPass2" minlength="4"></div>'
      +'<button class="btn-submit" onclick="changePassword()">تغيير</button>'
      +'<p style="font-size:0.8rem;color:var(--gray-600);margin-top:12px">💡 الدخول: اضغط اللوجو 5 مرات بسرعة<br>كلمة المرور تُحفظ في السحابة وتتطبق فوراً على الجميع</p>';
  }
}

function closeModal(){ document.getElementById('adminModal').classList.remove('active'); }
async function loginAdmin(e){
  e.preventDefault();
  const pass=document.getElementById('adminPass').value;
  try{ const {data}=await sb.from('settings').select('admin_password').eq('id',1).maybeSingle();
    if(data&&data.admin_password) settings.admin_password=data.admin_password;
  }catch(_){}
  if(pass===settings.admin_password){
    isAdmin=true; sessionStorage.setItem('shaghaf_admin','true'); document.body.classList.add('admin-mode');
    showToast('تم الدخول','success'); openAdminModal();
  } else showToast('كلمة مرور خاطئة','error');
}
function logoutAdmin(){ isAdmin=false; sessionStorage.removeItem('shaghaf_admin'); document.body.classList.remove('admin-mode'); closeModal(); showToast('تم الخروج','success'); }

async function changePassword(){
  const oldP=document.getElementById('oldPass').value, newP=document.getElementById('newPass').value, newP2=document.getElementById('newPass2').value;
  if(oldP!==settings.admin_password){ showToast('الحالية خاطئة','error'); return; }
  if(newP.length<4){ showToast('قصيرة جداً','error'); return; }
  if(newP!==newP2){ showToast('غير متطابقتين','error'); return; }
  try{
    const {error}=await sb.from('settings').upsert({id:1,admin_password:newP,updated_at:new Date().toISOString()});
    if(error)throw error;
    settings.admin_password=newP; showToast('تم التغيير ✓ — تطبق فوراً على الجميع','success');
  }catch(err){ showToast('فشل: '+(err.message||''),'error'); }
}

async function saveSettings(){
  const whatsapp=document.getElementById('setWhatsapp').value.trim();
  const facebook=document.getElementById('setFacebook').value.trim();
  const instagram=document.getElementById('setInstagram').value.trim();
  const footerEl=document.getElementById('setFooterText');
  const footer_text=footerEl?footerEl.value.trim():(settings.footer_text||'');
  try{
    const {error}=await sb.from('settings').upsert({id:1,whatsapp,facebook,instagram,footer_text,updated_at:new Date().toISOString()});
    if(error)throw error;
    settings.whatsapp=whatsapp; settings.facebook=facebook; settings.instagram=instagram; settings.footer_text=footer_text;
    renderFooter(); showToast('تم الحفظ ✓','success');
  }catch(err){ showToast('فشل: '+(err.message||''),'error'); }
}

async function saveBranding(){
  const logo_url=document.getElementById('setLogoUrl').value.trim();
  const favicon_url=document.getElementById('setFaviconUrl').value.trim();
  try{
    const {error}=await sb.from('settings').upsert({id:1,logo_url,favicon_url,updated_at:new Date().toISOString()});
    if(error)throw error;
    settings.logo_url=logo_url; settings.favicon_url=favicon_url; applyBranding(); showToast('تم حفظ الشعار ✓','success');
  }catch(err){ showToast('فشل: '+(err.message||''),'error'); }
}

function triggerUpload(target,itemId){ uploadTarget={type:target,itemId:itemId||null}; document.getElementById('fileInput').click(); }

/** ضغط الصورة على الجهاز قبل الرفع — Canvas */
function compressImage(file, maxWidth, quality) {
  maxWidth = maxWidth || 1000;
  quality = quality || 0.82;
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onerror = function() { reject(new Error('فشل قراءة الملف')); };
    reader.onload = function() {
      var img = new Image();
      img.onerror = function() { reject(new Error('فشل تحميل الصورة')); };
      img.onload = function() {
        var w = img.width;
        var h = img.height;
        if (w > maxWidth) {
          h = Math.round(h * (maxWidth / w));
          w = maxWidth;
        }
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        var tryTypes = ['image/webp', 'image/jpeg'];
        function tryExport(i) {
          if (i >= tryTypes.length) {
            canvas.toBlob(function(blob) {
              if (!blob) return reject(new Error('فشل الضغط'));
              resolve(new File([blob], 'img.jpg', { type: 'image/jpeg' }));
            }, 'image/jpeg', quality);
            return;
          }
          var type = tryTypes[i];
          canvas.toBlob(function(blob) {
            if (!blob || blob.size === 0) return tryExport(i + 1);
            var ext = type === 'image/webp' ? 'webp' : 'jpg';
            resolve(new File([blob], 'img.' + ext, { type: type }));
          }, type, quality);
        }
        tryExport(0);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleFileSelect(e){
  const file=e.target.files[0]; if(!file)return;
  if(!file.type.startsWith('image/')){ showToast('اختر صورة','error'); return; }
  if(file.size>15*1024*1024){ showToast('الملف كبير جداً (حد 15MB)','error'); return; }
  showToast('جاري ضغط الصورة...','');
  try{
    const originalSize = file.size;
    let maxW = 1000;
    if (uploadTarget && uploadTarget.type === 'logo') maxW = 400;
    if (uploadTarget && uploadTarget.type === 'favicon') maxW = 128;
    const compressed = await compressImage(file, maxW, 0.82);
    const savedPct = originalSize > 0 ? Math.round((1 - compressed.size / originalSize) * 100) : 0;
    showToast('تم الضغط (' + Math.round(compressed.size/1024) + ' KB) — جاري الرفع...','');
    const ext = compressed.type === 'image/webp' ? 'webp' : 'jpg';
    const path = uploadTarget.type + '/' + Date.now() + '_' + Math.random().toString(36).slice(2) + '.' + ext;
    const {error:upErr} = await sb.storage.from(STORAGE_BUCKET).upload(path, compressed, {
      cacheControl: '3600',
      upsert: false,
      contentType: compressed.type
    });
    if(upErr) throw upErr;
    const {data:urlData} = sb.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    const publicUrl = urlData.publicUrl;
    if(uploadTarget.type==='logo'){
      document.getElementById('setLogoUrl').value=publicUrl;
      showToast('تم رفع اللوجو ✓ (وفّرت ~'+savedPct+'%) اضغط حفظ','success');
    } else if(uploadTarget.type==='favicon'){
      document.getElementById('setFaviconUrl').value=publicUrl;
      showToast('تم رفع الأيقونة ✓ اضغط حفظ','success');
    } else if(uploadTarget.type==='item'){
      const inp=document.getElementById('editImage');
      if(inp) inp.value=publicUrl;
      const prev = document.querySelector('#adminBody .upload-preview');
      if(prev) prev.src = publicUrl;
      showToast('تم رفع الصورة ✓ ('+Math.round(compressed.size/1024)+' KB)','success');
    }
  }catch(err){
    console.error(err);
    showToast('فشل الرفع: '+(err.message||'تحقق من Storage'),'error');
  }
  e.target.value='';
  uploadTarget=null;
}

function openAddCategory(){
  document.getElementById('adminBody').innerHTML='<form onsubmit="saveNewCategory(event)"><h3 style="color:var(--blue-900);margin-bottom:12px">قسم جديد</h3>'
    +'<div class="form-group"><label>الاسم</label><input type="text" id="catName" required></div>'
    +'<div class="form-group"><label>الوصف</label><input type="text" id="catDesc"></div>'
    +'<div style="display:flex;gap:10px"><button type="submit" class="btn-submit" style="flex:1">إضافة</button><button type="button" class="btn-secondary" onclick="switchAdminTab(\'cats\')">إلغاء</button></div></form>';
}
async function saveNewCategory(e){
  e.preventDefault();
  const name=document.getElementById('catName').value.trim();
  const description=document.getElementById('catDesc').value.trim();
  const slug=name.replace(/\s+/g,'-').toLowerCase()+'-'+Date.now();
  const sort_order=categories.length?Math.max(...categories.map(c=>c.sort_order||0))+1:1;
  try{
    const {data,error}=await sb.from('categories').insert([{name,description,slug,badge:name,sort_order}]).select().single();
    if(error)throw error;
    categories.push(data); categories.sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
    renderCategoryPills(); showToast('تمت الإضافة ✓','success'); switchAdminTab('cats');
  }catch(err){ showToast('فشل: '+(err.message||''),'error'); }
}
function openEditCategory(catId){
  const cat=categories.find(c=>c.id===catId); if(!cat)return;
  document.getElementById('adminBody').innerHTML='<form onsubmit="saveEditCategory(event,\''+catId+'\')"><h3 style="color:var(--blue-900);margin-bottom:12px">تعديل القسم</h3>'
    +'<div class="form-group"><label>الاسم</label><input type="text" id="catName" value="'+escapeHtml(cat.name)+'" required></div>'
    +'<div class="form-group"><label>الوصف</label><input type="text" id="catDesc" value="'+escapeHtml(cat.description||'')+'"></div>'
    +'<div style="display:flex;gap:10px"><button type="submit" class="btn-submit" style="flex:1">حفظ</button><button type="button" class="btn-secondary" onclick="switchAdminTab(\'cats\')">إلغاء</button></div></form>';
}
async function saveEditCategory(e,catId){
  e.preventDefault();
  const name=document.getElementById('catName').value.trim();
  const description=document.getElementById('catDesc').value.trim();
  try{
    const {error}=await sb.from('categories').update({name,description,badge:name}).eq('id',catId);
    if(error)throw error;
    const idx=categories.findIndex(c=>c.id===catId);
    if(idx!==-1){ categories[idx].name=name; categories[idx].description=description; categories[idx].badge=name; }
    renderCategoryPills(); renderMenu(); showToast('تم ✓','success'); switchAdminTab('cats');
  }catch(err){ showToast('فشل: '+(err.message||''),'error'); }
}
async function deleteCategory(catId){
  const catItems=items.filter(i=>i.category_id===catId);
  if(catItems.length&&!confirm('القسم فيه '+catItems.length+' صنف. حذف الكل؟'))return;
  if(!catItems.length&&!confirm('حذف القسم؟'))return;
  try{
    if(catItems.length){ await sb.from('items').delete().eq('category_id',catId); items=items.filter(i=>i.category_id!==catId); }
    const {error}=await sb.from('categories').delete().eq('id',catId); if(error)throw error;
    categories=categories.filter(c=>c.id!==catId); renderCategoryPills(); renderMenu(); showToast('تم الحذف','success'); switchAdminTab('cats');
  }catch(err){ showToast('فشل: '+(err.message||''),'error'); }
}

let catDragIdx=null;
function catDragStart(e){ catDragIdx=Number(e.currentTarget.dataset.index); e.currentTarget.classList.add('dragging'); e.dataTransfer.effectAllowed='move'; }
function catDragOver(e){ e.preventDefault(); e.dataTransfer.dropEffect='move'; document.querySelectorAll('.cat-manage-item').forEach(el=>el.classList.remove('drag-over')); e.currentTarget.classList.add('drag-over'); }
function catDragEnd(e){ e.currentTarget.classList.remove('dragging'); document.querySelectorAll('.cat-manage-item').forEach(el=>el.classList.remove('drag-over')); }
async function catDrop(e){
  e.preventDefault();
  const toIdx=Number(e.currentTarget.dataset.index);
  document.querySelectorAll('.cat-manage-item').forEach(el=>el.classList.remove('drag-over','dragging'));
  if(catDragIdx===null||catDragIdx===toIdx) return;
  const item=categories.splice(catDragIdx,1)[0];
  categories.splice(toIdx,0,item);
  categories.forEach((c,i)=>{ c.sort_order=i+1; });
  try{
    await Promise.all(categories.map(c=>sb.from('categories').update({sort_order:c.sort_order}).eq('id',c.id)));
    renderCategoryPills(); switchAdminTab('cats'); showToast('تم الترتيب ✓','success');
  }catch(err){ showToast('فشل الترتيب','error'); }
  catDragIdx=null;
}
let itemDragId=null;
function itemDragStart(e){ if(!isAdmin)return; itemDragId=e.currentTarget.dataset.id; e.currentTarget.classList.add('dragging'); e.dataTransfer.effectAllowed='move'; }
function itemDragOver(e){ if(!isAdmin||!itemDragId)return; e.preventDefault(); e.dataTransfer.dropEffect='move'; document.querySelectorAll('.product-card').forEach(el=>el.classList.remove('drag-over')); e.currentTarget.classList.add('drag-over'); }
function itemDragEnd(e){ e.currentTarget.classList.remove('dragging'); document.querySelectorAll('.product-card').forEach(el=>el.classList.remove('drag-over')); }
async function itemDrop(e){
  if(!isAdmin||!itemDragId)return;
  e.preventDefault();
  const toId=e.currentTarget.dataset.id;
  document.querySelectorAll('.product-card').forEach(el=>el.classList.remove('drag-over','dragging'));
  if(itemDragId===toId){ itemDragId=null; return; }
  const fromItem=items.find(i=>i.id===itemDragId), toItem=items.find(i=>i.id===toId);
  if(!fromItem||!toItem||fromItem.category_id!==toItem.category_id){ itemDragId=null; showToast('ترتيب داخل نفس القسم فقط','error'); return; }
  let catItems=items.filter(i=>i.category_id===fromItem.category_id).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  const fromIdx=catItems.findIndex(i=>i.id===itemDragId), toIdx=catItems.findIndex(i=>i.id===toId);
  if(fromIdx<0||toIdx<0){ itemDragId=null; return; }
  const [moved]=catItems.splice(fromIdx,1); catItems.splice(toIdx,0,moved);
  catItems.forEach((it,i)=>{ it.sort_order=i+1; });
  catItems.forEach(ci=>{ const idx=items.findIndex(i=>i.id===ci.id); if(idx!==-1) items[idx].sort_order=ci.sort_order; });
  try{
    await Promise.all(catItems.map(it=>sb.from('items').update({sort_order:it.sort_order}).eq('id',it.id)));
    renderMenu(); showToast('تم ترتيب الأصناف ✓','success');
  }catch(err){ showToast('فشل الترتيب','error'); }
  itemDragId=null;
}

function openEditItem(itemId){
  const item=items.find(i=>i.id===itemId); if(!item)return;
  document.getElementById('adminModal').classList.add('active');
  document.getElementById('adminBody').innerHTML='<form onsubmit="saveEditItem(event,\''+itemId+'\')"><h3 style="color:var(--blue-900);margin-bottom:12px">تعديل الصنف</h3>'
    +'<div class="form-group"><label>الاسم</label><input type="text" id="editName" value="'+escapeHtml(item.name)+'" required></div>'
    +'<div class="form-group"><label>الوصف</label><textarea id="editDesc" rows="2" required>'+escapeHtml(item.description||'')+'</textarea></div>'
    +'<div class="form-group"><label>السعر</label><input type="number" id="editPrice" value="'+item.price+'" min="1" step="0.5" required></div>'
    +'<div class="form-group"><label>الصورة</label>'+(item.image_url?'<img class="upload-preview" src="'+escapeHtml(item.image_url)+'">':'')
    +'<button type="button" class="btn-upload" onclick="triggerUpload(\'item\',\''+itemId+'\')">📷 رفع من الجهاز</button>'
    +'<input type="url" id="editImage" value="'+escapeHtml(item.image_url||'')+'" style="margin-top:8px" required></div>'
    +'<div style="display:flex;gap:10px"><button type="submit" class="btn-submit" style="flex:1">حفظ</button><button type="button" class="btn-secondary" onclick="closeModal()">إلغاء</button></div></form>';
}
async function saveEditItem(e,itemId){
  e.preventDefault();
  const name=document.getElementById('editName').value.trim();
  const description=document.getElementById('editDesc').value.trim();
  const price=Number(document.getElementById('editPrice').value);
  const image_url=document.getElementById('editImage').value.trim();
  try{
    const {error}=await sb.from('items').update({name,description,price,image_url}).eq('id',itemId);
    if(error)throw error;
    const idx=items.findIndex(i=>i.id===itemId);
    if(idx!==-1) items[idx]={...items[idx],name,description,price,image_url};
    renderMenu(); closeModal(); showToast('تم ✓','success');
  }catch(err){ showToast('فشل: '+(err.message||''),'error'); }
}
function openAddItemPicker(){
  if(!categories.length){ showToast('أضف قسماً أولاً','error'); return; }
  document.getElementById('adminModal').classList.add('active');
  let options=categories.map(c=>'<button class="btn-secondary" style="width:100%;margin-bottom:8px;text-align:right" onclick="openAddItem(\''+c.id+'\')">'+escapeHtml(c.name)+'</button>').join('');
  document.getElementById('adminBody').innerHTML='<h3 style="color:var(--blue-900);margin-bottom:12px">اختر القسم</h3>'+options+'<button class="btn-secondary" style="width:100%;margin-top:8px" onclick="openAdminModal()">رجوع</button>';
}
function openAddItem(categoryId){
  document.getElementById('adminModal').classList.add('active');
  document.getElementById('adminBody').innerHTML='<form onsubmit="saveNewItem(event,\''+categoryId+'\')"><h3 style="color:var(--blue-900);margin-bottom:12px">صنف جديد</h3>'
    +'<div class="form-group"><label>الاسم</label><input type="text" id="editName" required></div>'
    +'<div class="form-group"><label>الوصف</label><textarea id="editDesc" rows="2" required></textarea></div>'
    +'<div class="form-group"><label>السعر</label><input type="number" id="editPrice" min="1" step="0.5" required></div>'
    +'<div class="form-group"><label>الصورة</label><button type="button" class="btn-upload" onclick="triggerUpload(\'item\')">📷 رفع من الجهاز</button>'
    +'<input type="url" id="editImage" style="margin-top:8px" required></div>'
    +'<div style="display:flex;gap:10px"><button type="submit" class="btn-submit" style="flex:1">إضافة</button><button type="button" class="btn-secondary" onclick="closeModal()">إلغاء</button></div></form>';
}
async function saveNewItem(e,categoryId){
  e.preventDefault();
  const name=document.getElementById('editName').value.trim();
  const description=document.getElementById('editDesc').value.trim();
  const price=Number(document.getElementById('editPrice').value);
  const image_url=document.getElementById('editImage').value.trim();
  const catItems=items.filter(i=>i.category_id===categoryId);
  const sort_order=catItems.length?Math.max(...catItems.map(i=>i.sort_order||0))+1:1;
  try{
    const {data,error}=await sb.from('items').insert([{category_id:categoryId,name,description,price,image_url,sort_order}]).select().single();
    if(error)throw error;
    items.push(data); renderMenu(); closeModal(); showToast('تمت الإضافة ✓','success');
  }catch(err){ showToast('فشل: '+(err.message||''),'error'); }
}
async function deleteItem(itemId){
  if(!confirm('حذف الصنف؟'))return;
  try{
    const {error}=await sb.from('items').delete().eq('id',itemId); if(error)throw error;
    items=items.filter(i=>i.id!==itemId); delete cart[itemId]; saveCart(); renderMenu(); showToast('تم الحذف','success');
  }catch(err){ showToast('فشل: '+(err.message||''),'error'); }
}

async function seedDefaultData(){
  if(!confirm('إضافة أقسام وأصناف افتراضية؟'))return;
  showToast('جاري...','');
  try{
    const cats=[{name:'حلويات كيك',badge:'كيك',description:'كيكات',slug:'cakes',sort_order:1},{name:'بوظة',badge:'آيس كريم',description:'بوظة',slug:'icecream',sort_order:2},{name:'حلو غربي',badge:'غربي',description:'غربي',slug:'western',sort_order:3},{name:'حلو شرقي',badge:'شرقي',description:'شرقي',slug:'eastern',sort_order:4},{name:'قهوات باردة',badge:'بارد',description:'بارد',slug:'cold-coffee',sort_order:5},{name:'قهوات ساخنة',badge:'ساخن',description:'ساخن',slug:'hot-coffee',sort_order:6},{name:'عصائر',badge:'عصير',description:'عصائر',slug:'juices',sort_order:7}];
    const {data:inserted,error}=await sb.from('categories').upsert(cats,{onConflict:'slug'}).select();
    if(error)throw error;
    const sample={description:'يمكنك تعديله',price:20,image_url:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=400&fit=crop',sort_order:1};
    for(const cat of inserted){ await sb.from('items').insert([{...sample,name:cat.name+' - صنف 1',category_id:cat.id}]); }
    await loadAll(); closeModal(); showToast('تم ✓','success');
  }catch(err){ showToast('فشل: '+(err.message||''),'error'); }
}

function showToast(msg,type=''){
  const toast=document.getElementById('toast');
  toast.textContent=msg; toast.className='toast show '+type;
  setTimeout(()=>toast.classList.remove('show'),3000);
}
function escapeHtml(str){
  return String(str||'').replace(/&/g,'&').replace(/"/g,'"').replace(/'/g,'&#39;').replace(/</g,'<').replace(/>/g,'>');
}
