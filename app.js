
const SUPABASE_URL = 'https://opvjcjohxcgagyzxtemh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KaWJM5urxHkjbg6tI6xB6w_n6c8--gk';
const STORAGE_BUCKET = 'site-images';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== State =====
let categories = [];
let items = [];
let settings = {
  whatsapp: '', facebook: '', instagram: '',
  admin_password: 'shaghaf2024',
  logo_url: '', favicon_url: ''
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
        favicon_url: settingsRes.data.favicon_url || ''
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
  let filtered = items;
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
  return '<div class="product-card" data-id="'+item.id+'">'
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
  const socialEl=document.getElementById('footerSocial');
  let html='';
  if(settings.facebook) html+='<a href="'+escapeHtml(settings.facebook)+'" target="_blank">📘 فيسبوك</a>';
  if(settings.instagram) html+='<a href="'+escapeHtml(settings.instagram)+'" target="_blank">📷 إنستغرام</a>';
  socialEl.innerHTML=html||'<span style="opacity:0.6">—</span>';
  const waEl=document.getElementById('footerWhatsapp');
  if(settings.whatsapp){ let p=settings.whatsapp.replace(/[^0-9]/g,''); waEl.innerHTML='📞 <a href="https://wa.me/'+p+'" target="_blank" style="color:inherit">'+escapeHtml(settings.whatsapp)+'</a>'; }
  else waEl.textContent='📞 —';
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
    let list=categories.map(c=>'<li class="cat-manage-item"><span class="cat-name">'+escapeHtml(c.name)+'</span><div class="cat-actions">'
      +'<button onclick="moveCategory(\''+c.id+'\',-1)">⬆️</button><button onclick="moveCategory(\''+c.id+'\',1)">⬇️</button>'
      +'<button onclick="openEditCategory(\''+c.id+'\')">✏️</button><button class="danger" onclick="deleteCategory(\''+c.id+'\')">🗑️</button></div></li>').join('');
    el.innerHTML='<h3 style="margin-bottom:12px;color:var(--blue-900)">إدارة الأقسام</h3><ul class="cat-manage-list">'+(list||'<p>لا أقسام</p>')+'</ul><button class="btn-submit" style="margin-top:12px" onclick="openAddCategory()">➕ قسم جديد</button>';
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
    el.innerHTML='<h3 style="margin-bottom:12px;color:var(--blue-900)">التواصل</h3>'
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
      +'<p style="font-size:0.8rem;color:var(--gray-600);margin-top:12px">💡 الدخول: اضغط اللوجو 5 مرات بسرعة</p>';
  }
}

function closeModal(){ document.getElementById('adminModal').classList.remove('active'); }
function loginAdmin(e){
  e.preventDefault();
  if(document.getElementById('adminPass').value===settings.admin_password){
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
    settings.admin_password=newP; showToast('تم التغيير ✓','success');
  }catch(err){ showToast('فشل: '+(err.message||''),'error'); }
}

async function saveSettings(){
  const whatsapp=document.getElementById('setWhatsapp').value.trim();
  const facebook=document.getElementById('setFacebook').value.trim();
  const instagram=document.getElementById('setInstagram').value.trim();
  try{
    const {error}=await sb.from('settings').upsert({id:1,whatsapp,facebook,instagram,updated_at:new Date().toISOString()});
    if(error)throw error;
    settings.whatsapp=whatsapp; settings.facebook=facebook; settings.instagram=instagram;
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
async function handleFileSelect(e){
  const file=e.target.files[0]; if(!file)return;
  if(!file.type.startsWith('image/')){ showToast('اختر صورة','error'); return; }
  if(file.size>5*1024*1024){ showToast('الحد 5MB','error'); return; }
  showToast('جاري الرفع...','');
  try{
    const ext=file.name.split('.').pop()||'jpg';
    const path=uploadTarget.type+'/'+Date.now()+'_'+Math.random().toString(36).slice(2)+'.'+ext;
    const {error:upErr}=await sb.storage.from(STORAGE_BUCKET).upload(path,file,{cacheControl:'3600',upsert:false});
    if(upErr)throw upErr;
    const {data:urlData}=sb.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    const publicUrl=urlData.publicUrl;
    if(uploadTarget.type==='logo'){ document.getElementById('setLogoUrl').value=publicUrl; showToast('تم رفع اللوجو ✓ اضغط حفظ','success'); }
    else if(uploadTarget.type==='favicon'){ document.getElementById('setFaviconUrl').value=publicUrl; showToast('تم رفع الأيقونة ✓ اضغط حفظ','success'); }
    else if(uploadTarget.type==='item'){ const inp=document.getElementById('editImage'); if(inp)inp.value=publicUrl; showToast('تم رفع الصورة ✓','success'); }
  }catch(err){ console.error(err); showToast('فشل الرفع: '+(err.message||'تحقق من Storage'),'error'); }
  e.target.value=''; uploadTarget=null;
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
async function moveCategory(catId,direction){
  const idx=categories.findIndex(c=>c.id===catId); if(idx===-1)return;
  const newIdx=idx+direction; if(newIdx<0||newIdx>=categories.length)return;
  const a=categories[idx], b=categories[newIdx];
  const t=a.sort_order; a.sort_order=b.sort_order; b.sort_order=t;
  categories[idx]=b; categories[newIdx]=a;
  try{
    await Promise.all([sb.from('categories').update({sort_order:a.sort_order}).eq('id',a.id), sb.from('categories').update({sort_order:b.sort_order}).eq('id',b.id)]);
    renderCategoryPills(); switchAdminTab('cats');
  }catch(err){ showToast('فشل الترتيب','error'); }
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
