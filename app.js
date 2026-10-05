// =====================================================
// كافيه شغف - Supabase + Cart + Settings + Search
// =====================================================

const SUPABASE_URL = 'https://opvjcjohxcgagyzxtemh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KaWJM5urxHkjbg6tI6xB6w_n6c8--gk';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== State =====
let categories = [];
let items = [];
let settings = { whatsapp: '', facebook: '', instagram: '' };
let cart = JSON.parse(localStorage.getItem('shaghaf_cart') || '{}');
let isAdmin = false;
let activeCategory = 'all';
let searchQuery = '';
const ADMIN_PASSWORD = 'shaghaf2024';

// ===== Init =====
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
        instagram: settingsRes.data.instagram || ''
      };
    }

    renderCategoryPills();
    renderMenu();
    renderFooter();
    updateCartBar();
    loadingEl.style.display = 'none';
    menuEl.style.display = 'block';
  } catch (err) {
    console.error(err);
    loadingEl.innerHTML = `
      <p style="color:#C62828;font-weight:700;">حدث خطأ أثناء تحميل القائمة</p>
      <p style="color:var(--gray-600);font-size:0.9rem;margin-top:8px;">${err.message || ''}</p>
      <button class="btn-submit" style="margin-top:16px;max-width:200px;margin:16px auto 0;display:block;" onclick="location.reload()">إعادة المحاولة</button>
    `;
  }
}

// ===== Category Pills =====
function renderCategoryPills() {
  const el = document.getElementById('catPills');
  let html = `<button class="cat-btn ${activeCategory === 'all' ? 'active' : ''}" data-cat="all" onclick="filterCategory('all')">الكل</button>`;
  categories.forEach(c => {
    html += `<button class="cat-btn ${activeCategory === c.id ? 'active' : ''}" data-cat="${c.id}" onclick="filterCategory('${c.id}')">${escapeHtml(c.name)}</button>`;
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

// ===== Event Listeners =====
function setupEventListeners() {
  window.addEventListener('scroll', () => {
    document.getElementById('header').classList.toggle('scrolled', window.scrollY > 40);
  });

  document.getElementById('adminBtn').addEventListener('click', openAdminModal);
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('adminModal').addEventListener('click', e => {
    if (e.target.id === 'adminModal') closeModal();
  });

  document.getElementById('openCartBtn').addEventListener('click', openCart);
  document.getElementById('closeCartModal').addEventListener('click', closeCart);
  document.getElementById('cartModal').addEventListener('click', e => {
    if (e.target.id === 'cartModal') closeCart();
  });

  document.getElementById('searchInput').addEventListener('input', e => {
    searchQuery = e.target.value.trim().toLowerCase();
    activeCategory = 'all';
    renderCategoryPills();
    renderMenu();
  });
}

// ===== Render Menu =====
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
    titleEl.textContent = searchQuery ? 'نتائج البحث: "' + searchQuery + '"' : 'كل الأصناف';
  }

  if (searchQuery) {
    filtered = filtered.filter(i =>
      (i.name || '').toLowerCase().includes(searchQuery) ||
      (i.description || '').toLowerCase().includes(searchQuery)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noRes.style.display = 'block';
    return;
  }

  noRes.style.display = 'none';
  grid.innerHTML = filtered.map(item => renderCard(item)).join('');
}

function renderCard(item) {
  const qty = cart[item.id] || 0;
  return `
    <div class="product-card" data-id="${item.id}">
      <div class="admin-controls">
        <button class="admin-btn" onclick="openEditItem('${item.id}')" title="تعديل">✏️</button>
        <button class="admin-btn delete" onclick="deleteItem('${item.id}')" title="حذف">🗑️</button>
      </div>
      <div class="product-img-wrap">
        <img class="product-img" src="${escapeHtml(item.image_url || '')}" alt="${escapeHtml(item.name)}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=400&fit=crop'">
        <span class="product-price-badge">${item.price} ر.س</span>
      </div>
      <div class="product-body">
        <h3 class="product-name">${escapeHtml(item.name)}</h3>
        <p class="product-desc">${escapeHtml(item.description || '')}</p>
        <div class="product-actions">
          ${qty === 0
            ? `<button class="btn-add" onclick="changeQty('${item.id}', 1)">+ إضافة</button>`
            : `<div class="qty-controls">
                <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
                <span class="qty-num">${qty}</span>
                <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
              </div>`
          }
        </div>
      </div>
    </div>
  `;
}

// ===== Cart =====
function saveCart() {
  localStorage.setItem('shaghaf_cart', JSON.stringify(cart));
  updateCartBar();
  renderMenu();
}

function changeQty(itemId, delta) {
  const current = cart[itemId] || 0;
  const next = current + delta;
  if (next <= 0) {
    delete cart[itemId];
  } else {
    cart[itemId] = next;
  }
  saveCart();
}

function updateCartBar() {
  const bar = document.getElementById('cartBar');
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = items.find(i => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  if (count > 0) {
    bar.style.display = 'block';
    document.getElementById('cartCountBadge').textContent = count;
    document.getElementById('cartTotalText').textContent = total.toFixed(0) + ' ر.س';
  } else {
    bar.style.display = 'none';
  }
}

function openCart() {
  const body = document.getElementById('cartBody');
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    body.innerHTML = `<div class="cart-empty"><p>السلة فارغة</p></div>`;
  } else {
    let html = '';
    let total = 0;
    entries.forEach(([id, qty]) => {
      const item = items.find(i => i.id === id);
      if (!item) return;
      const line = item.price * qty;
      total += line;
      html += `
        <div class="cart-item">
          <img class="cart-item-img" src="${escapeHtml(item.image_url || '')}" alt="">
          <div class="cart-item-info">
            <div class="cart-item-name">${escapeHtml(item.name)}</div>
            <div class="cart-item-price">${item.price} ر.س × ${qty} = ${line} ر.س</div>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="changeQty('${id}', -1); openCart();">−</button>
            <span class="qty-num">${qty}</span>
            <button class="qty-btn" onclick="changeQty('${id}', 1); openCart();">+</button>
          </div>
        </div>
      `;
    });

    const hasWhatsapp = settings.whatsapp && settings.whatsapp.trim();
    html += `
      <div class="cart-summary">
        <div class="cart-summary-row">
          <span>المجموع</span>
          <span>${total.toFixed(0)} ر.س</span>
        </div>
        <button class="btn-whatsapp" onclick="sendWhatsAppOrder()" ${!hasWhatsapp ? 'disabled' : ''}>
          ${hasWhatsapp ? '📱 إرسال الطلب عبر واتساب' : '⚠️ أضف رقم واتساب من لوحة التحكم'}
        </button>
        <button class="btn-clear-cart" onclick="clearCart()">تفريغ السلة</button>
      </div>
    `;
    body.innerHTML = html;
  }
  document.getElementById('cartModal').classList.add('active');
}

function closeCart() {
  document.getElementById('cartModal').classList.remove('active');
}

function clearCart() {
  cart = {};
  saveCart();
  closeCart();
  showToast('تم تفريغ السلة', 'success');
}

function sendWhatsAppOrder() {
  if (!settings.whatsapp) {
    showToast('رقم الواتساب غير مضاف', 'error');
    return;
  }
  const entries = Object.entries(cart);
  if (entries.length === 0) return;

  let msg = 'مرحباً، أريد طلب التالي من كافيه شغف:\n\n';
  let total = 0;
  entries.forEach(([id, qty]) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const line = item.price * qty;
    total += line;
    msg += '• ' + item.name + ' × ' + qty + ' = ' + line + ' ر.س\n';
  });
  msg += '\nالمجموع: ' + total.toFixed(0) + ' ر.س';

  let phone = settings.whatsapp.replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) phone = '966' + phone.slice(1);
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
}

// ===== Footer =====
function renderFooter() {
  const socialEl = document.getElementById('footerSocial');
  let html = '';
  if (settings.facebook) {
    html += '<a href="' + escapeHtml(settings.facebook) + '" target="_blank" rel="noopener">📘 فيسبوك</a>';
  }
  if (settings.instagram) {
    html += '<a href="' + escapeHtml(settings.instagram) + '" target="_blank" rel="noopener">📷 إنستغرام</a>';
  }
  socialEl.innerHTML = html || '<span style="opacity:0.6">—</span>';

  const waEl = document.getElementById('footerWhatsapp');
  if (settings.whatsapp) {
    let phone = settings.whatsapp.replace(/[^0-9]/g, '');
    waEl.innerHTML = '📞 <a href="https://wa.me/' + phone + '" target="_blank" style="color:inherit;">' + escapeHtml(settings.whatsapp) + '</a>';
  } else {
    waEl.textContent = '📞 —';
  }
}

// ===== Admin =====
function checkAdminSession() {
  if (sessionStorage.getItem('shaghaf_admin') === 'true') {
    isAdmin = true;
    document.body.classList.add('admin-mode');
  }
}

function openAdminModal() {
  const modal = document.getElementById('adminModal');
  const body = document.getElementById('adminBody');
  modal.classList.add('active');

  if (isAdmin) {
    body.innerHTML = `
      <div class="admin-panel">
        <div class="admin-status">
          <span>🟢</span>
          <span>أنت مسجل كمسؤول — التعديلات تُحفظ في السحابة</span>
        </div>

        <div class="settings-section">
          <h3>⚙️ إعدادات التواصل</h3>
          <div class="form-group">
            <label>رقم واتساب (مع كود الدولة)</label>
            <input type="text" id="setWhatsapp" value="${escapeHtml(settings.whatsapp || '')}" placeholder="9665xxxxxxxx">
          </div>
          <div class="form-group">
            <label>رابط فيسبوك</label>
            <input type="url" id="setFacebook" value="${escapeHtml(settings.facebook || '')}" placeholder="https://facebook.com/...">
          </div>
          <div class="form-group">
            <label>رابط إنستغرام</label>
            <input type="url" id="setInstagram" value="${escapeHtml(settings.instagram || '')}" placeholder="https://instagram.com/...">
          </div>
          <button class="btn-submit" onclick="saveSettings()">حفظ الإعدادات</button>
        </div>

        <p style="color:var(--gray-600);font-size:0.9rem;">
          لتعديل صنف: اضغط ✏️ على الكارت. لإضافة صنف جديد استخدم الزر أدناه.
        </p>
        <div class="admin-actions">
          <button class="btn-secondary" onclick="seedDefaultData()">تعبئة البيانات الافتراضية</button>
          <button class="btn-secondary" onclick="openAddItemPicker()">➕ إضافة صنف جديد</button>
          <button class="btn-secondary" onclick="logoutAdmin()" style="background:#FFEBEE;color:#C62828;">تسجيل الخروج</button>
        </div>
      </div>
    `;
  } else {
    body.innerHTML = `
      <form class="login-form" onsubmit="loginAdmin(event)">
        <p style="color:var(--gray-600);margin-bottom:8px;">أدخل كلمة المرور للدخول إلى وضع التعديل</p>
        <div class="form-group">
          <label>كلمة المرور</label>
          <input type="password" id="adminPass" placeholder="أدخل كلمة المرور" required autocomplete="current-password">
        </div>
        <button type="submit" class="btn-submit">دخول</button>
        <p style="font-size:0.8rem;color:var(--gray-600);text-align:center;margin-top:8px;">
          كلمة المرور الافتراضية: <strong>shaghaf2024</strong>
        </p>
      </form>
    `;
  }
}

function closeModal() {
  document.getElementById('adminModal').classList.remove('active');
}

function loginAdmin(e) {
  e.preventDefault();
  const pass = document.getElementById('adminPass').value;
  if (pass === ADMIN_PASSWORD) {
    isAdmin = true;
    sessionStorage.setItem('shaghaf_admin', 'true');
    document.body.classList.add('admin-mode');
    showToast('تم تسجيل الدخول بنجاح', 'success');
    openAdminModal();
  } else {
    showToast('كلمة المرور خاطئة', 'error');
  }
}

function logoutAdmin() {
  isAdmin = false;
  sessionStorage.removeItem('shaghaf_admin');
  document.body.classList.remove('admin-mode');
  closeModal();
  showToast('تم تسجيل الخروج', 'success');
}

async function saveSettings() {
  const whatsapp = document.getElementById('setWhatsapp').value.trim();
  const facebook = document.getElementById('setFacebook').value.trim();
  const instagram = document.getElementById('setInstagram').value.trim();

  try {
    const { error } = await sb
      .from('settings')
      .upsert({ id: 1, whatsapp, facebook, instagram, updated_at: new Date().toISOString() });

    if (error) throw error;

    settings = { whatsapp, facebook, instagram };
    renderFooter();
    showToast('تم حفظ الإعدادات ✓', 'success');
  } catch (err) {
    console.error(err);
    showToast('فشل الحفظ: ' + (err.message || ''), 'error');
  }
}

// ===== CRUD Items =====
function openEditItem(itemId) {
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  const modal = document.getElementById('adminModal');
  const body = document.getElementById('adminBody');
  modal.classList.add('active');

  body.innerHTML = `
    <form class="edit-form" onsubmit="saveEditItem(event, '${itemId}')">
      <h3 style="color:var(--blue-900);margin-bottom:12px;">تعديل الصنف</h3>
      <div class="form-group">
        <label>اسم الصنف</label>
        <input type="text" id="editName" value="${escapeHtml(item.name)}" required>
      </div>
      <div class="form-group">
        <label>الوصف</label>
        <textarea id="editDesc" rows="2" required>${escapeHtml(item.description || '')}</textarea>
      </div>
      <div class="form-group">
        <label>السعر (ر.س)</label>
        <input type="number" id="editPrice" value="${item.price}" min="1" step="0.5" required>
      </div>
      <div class="form-group">
        <label>رابط الصورة</label>
        <input type="url" id="editImage" value="${escapeHtml(item.image_url || '')}" required>
      </div>
      <div style="display:flex;gap:10px;margin-top:8px;">
        <button type="submit" class="btn-submit" style="flex:1;">حفظ التعديلات</button>
        <button type="button" class="btn-secondary" onclick="closeModal()">إلغاء</button>
      </div>
    </form>
  `;
}

async function saveEditItem(e, itemId) {
  e.preventDefault();
  const name = document.getElementById('editName').value.trim();
  const description = document.getElementById('editDesc').value.trim();
  const price = Number(document.getElementById('editPrice').value);
  const image_url = document.getElementById('editImage').value.trim();

  try {
    const { error } = await sb
      .from('items')
      .update({ name, description, price, image_url })
      .eq('id', itemId);

    if (error) throw error;

    const idx = items.findIndex(i => i.id === itemId);
    if (idx !== -1) items[idx] = { ...items[idx], name, description, price, image_url };

    renderMenu();
    closeModal();
    showToast('تم التحديث بنجاح ✓', 'success');
  } catch (err) {
    console.error(err);
    showToast('فشل التحديث: ' + (err.message || ''), 'error');
  }
}

function openAddItemPicker() {
  if (categories.length === 0) {
    showToast('أضف أقسام أولاً عبر تعبئة البيانات', 'error');
    return;
  }
  const modal = document.getElementById('adminModal');
  const body = document.getElementById('adminBody');
  modal.classList.add('active');

  let options = categories.map(c =>
    '<button class="btn-secondary" style="width:100%;margin-bottom:8px;text-align:right;" onclick="openAddItem(\'' + c.id + '\')">' + escapeHtml(c.name) + '</button>'
  ).join('');

  body.innerHTML = `
    <h3 style="color:var(--blue-900);margin-bottom:12px;">اختر القسم</h3>
    ${options}
    <button class="btn-secondary" style="width:100%;margin-top:8px;" onclick="openAdminModal()">رجوع</button>
  `;
}

function openAddItem(categoryId) {
  const modal = document.getElementById('adminModal');
  const body = document.getElementById('adminBody');
  modal.classList.add('active');

  body.innerHTML = `
    <form class="edit-form" onsubmit="saveNewItem(event, '${categoryId}')">
      <h3 style="color:var(--blue-900);margin-bottom:12px;">إضافة صنف جديد</h3>
      <div class="form-group">
        <label>اسم الصنف</label>
        <input type="text" id="editName" placeholder="مثال: كيك الشوكولاتة" required>
      </div>
      <div class="form-group">
        <label>الوصف</label>
        <textarea id="editDesc" rows="2" placeholder="وصف قصير" required></textarea>
      </div>
      <div class="form-group">
        <label>السعر (ر.س)</label>
        <input type="number" id="editPrice" placeholder="25" min="1" step="0.5" required>
      </div>
      <div class="form-group">
        <label>رابط الصورة</label>
        <input type="url" id="editImage" placeholder="https://..." required>
      </div>
      <div style="display:flex;gap:10px;margin-top:8px;">
        <button type="submit" class="btn-submit" style="flex:1;">إضافة</button>
        <button type="button" class="btn-secondary" onclick="closeModal()">إلغاء</button>
      </div>
    </form>
  `;
}

async function saveNewItem(e, categoryId) {
  e.preventDefault();
  const name = document.getElementById('editName').value.trim();
  const description = document.getElementById('editDesc').value.trim();
  const price = Number(document.getElementById('editPrice').value);
  const image_url = document.getElementById('editImage').value.trim();

  const catItems = items.filter(i => i.category_id === categoryId);
  const sort_order = catItems.length > 0 ? Math.max(...catItems.map(i => i.sort_order || 0)) + 1 : 1;

  try {
    const { data, error } = await sb
      .from('items')
      .insert([{ category_id: categoryId, name, description, price, image_url, sort_order }])
      .select()
      .single();

    if (error) throw error;

    items.push(data);
    renderMenu();
    closeModal();
    showToast('تمت الإضافة بنجاح ✓', 'success');
  } catch (err) {
    console.error(err);
    showToast('فشل الإضافة: ' + (err.message || ''), 'error');
  }
}

async function deleteItem(itemId) {
  if (!confirm('هل أنت متأكد من حذف هذا الصنف؟')) return;

  try {
    const { error } = await sb.from('items').delete().eq('id', itemId);
    if (error) throw error;

    items = items.filter(i => i.id !== itemId);
    delete cart[itemId];
    saveCart();
    renderMenu();
    showToast('تم الحذف بنجاح', 'success');
  } catch (err) {
    console.error(err);
    showToast('فشل الحذف: ' + (err.message || ''), 'error');
  }
}

// ===== Seed Default Data =====
async function seedDefaultData() {
  if (!confirm('سيتم إضافة الأقسام والأصناف الافتراضية. هل تريد المتابعة؟')) return;

  const defaultCategories = [
    { name: 'حلويات كيك', badge: 'كيك فاخر', description: 'كيكات طازجة مخبوزة يوميًا بأجود المكونات', slug: 'cakes', sort_order: 1 },
    { name: 'بوظة', badge: 'آيس كريم', description: 'بوظة إيطالية فاخرة بنكهات طبيعية', slug: 'icecream', sort_order: 2 },
    { name: 'حلو غربي', badge: 'حلويات غربية', description: 'أشهى الحلويات الغربية بطابع عصري', slug: 'western', sort_order: 3 },
    { name: 'حلو شرقي', badge: 'حلويات شرقية', description: 'أصالة الحلويات الشرقية بنكهات تقليدية', slug: 'eastern', sort_order: 4 },
    { name: 'قهوات باردة', badge: 'مشروبات باردة', description: 'قهوة باردة منعشة لتحيي يومك', slug: 'cold-coffee', sort_order: 5 },
    { name: 'قهوات ساخنة', badge: 'قهوة ساخنة', description: 'قهوة محمصة طازجة بطرق تحضير احترافية', slug: 'hot-coffee', sort_order: 6 },
    { name: 'مشروبات باردة وعصائر', badge: 'عصائر طازجة', description: 'عصائر طبيعية 100% بدون إضافات', slug: 'juices', sort_order: 7 }
  ];

  const defaultItemsMap = {
    'cakes': [
      { name: 'كيك الشوكولاتة البلجيكية', description: 'طبقات غنية من الشوكولاتة البلجيكية مع كريمة الزبدة', price: 45, image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=400&fit=crop', sort_order: 1 },
      { name: 'كيك الفانيلا الكلاسيكي', description: 'كيك فانيلا ناعم مع كريمة الفانيلا الطبيعية', price: 38, image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&h=400&fit=crop', sort_order: 2 },
      { name: 'كيك الجبن النيويوركي', description: 'تشيز كيك كريمي مع صلصة التوت البري', price: 42, image_url: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=500&h=400&fit=crop', sort_order: 3 },
      { name: 'كيك الريد فلفت', description: 'كيك أحمر مخملي مع كريمة الجبن الكريمية', price: 48, image_url: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=500&h=400&fit=crop', sort_order: 4 }
    ],
    'icecream': [
      { name: 'بوظة الفانيلا المدغشقرية', description: 'فانيلا طبيعية من مدغشقر مع قطع البسكويت', price: 22, image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&h=400&fit=crop', sort_order: 1 },
      { name: 'بوظة الشوكولاتة الداكنة', description: 'شوكولاتة 70% مع رقائق الكاكاو', price: 24, image_url: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=500&h=400&fit=crop', sort_order: 2 },
      { name: 'بوظة الفراولة الطازجة', description: 'فراولة طازجة مهروسة مع كريمة الحليب', price: 23, image_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&h=400&fit=crop', sort_order: 3 },
      { name: 'بوظة المانجو الاستوائية', description: 'مانجو باكستاني ناضج مع لمسة ليمون', price: 25, image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&h=400&fit=crop', sort_order: 4 }
    ],
    'western': [
      { name: 'تيراميسو إيطالي', description: 'طبقات الماسكاربوني والقهوة مع الكاكاو', price: 35, image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=400&fit=crop', sort_order: 1 },
      { name: 'كرواسون بالشوكولاتة', description: 'كرواسون مقرمش محشو بالشوكولاتة البلجيكية', price: 18, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&h=400&fit=crop', sort_order: 2 },
      { name: 'دونات مغطاة', description: 'دونات طازجة مع تغطية الشوكولاتة والرشات', price: 15, image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&h=400&fit=crop', sort_order: 3 },
      { name: 'ماكرون فرنسي', description: 'تشكيلة ماكرون بألوان ونكهات متنوعة', price: 28, image_url: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=500&h=400&fit=crop', sort_order: 4 }
    ],
    'eastern': [
      { name: 'بقلاوة بالفستق', description: 'طبقات رقيقة محشوة بالفستق الحلبي والشيرة', price: 32, image_url: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=500&h=400&fit=crop', sort_order: 1 },
      { name: 'كنافة نابلسية', description: 'كنافة مقرمشة مع الجبنة العكاوي والشيرة', price: 36, image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500&h=400&fit=crop', sort_order: 2 },
      { name: 'معمول بالتمر', description: 'معمول طري محشو بالتمر والمكسرات', price: 20, image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=400&fit=crop', sort_order: 3 },
      { name: 'هريسة بالقشطة', description: 'هريسة طازجة مغطاة بالقشطة والفستق', price: 28, image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&h=400&fit=crop', sort_order: 4 }
    ],
    'cold-coffee': [
      { name: 'لاتيه مثلج', description: 'إسبريسو مع حليب بارد وثلج', price: 22, image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&h=400&fit=crop', sort_order: 1 },
      { name: 'أمريكانو مثلج', description: 'إسبريسو مخفف بالماء البارد والثلج', price: 18, image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&h=400&fit=crop', sort_order: 2 },
      { name: 'فرابتشينو كراميل', description: 'مزيج القهوة المثلجة مع الكراميل والكريمة', price: 28, image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&h=400&fit=crop', sort_order: 3 },
      { name: 'آيس موكا', description: 'قهوة مثلجة مع الشوكولاتة والحليب', price: 25, image_url: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=500&h=400&fit=crop', sort_order: 4 }
    ],
    'hot-coffee': [
      { name: 'إسبريسو', description: 'جرعة مركزة من القهوة الإيطالية الأصيلة', price: 14, image_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500&h=400&fit=crop', sort_order: 1 },
      { name: 'كابتشينو', description: 'إسبريسو مع رغوة الحليب الكريمية', price: 20, image_url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&h=400&fit=crop', sort_order: 2 },
      { name: 'لاتيه', description: 'إسبريسو مع حليب مبخر ناعم', price: 22, image_url: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=500&h=400&fit=crop', sort_order: 3 },
      { name: 'فلات وايت', description: 'إسبريسو مزدوج مع حليب مبخر حريري', price: 24, image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=400&fit=crop', sort_order: 4 }
    ],
    'juices': [
      { name: 'عصير برتقال طازج', description: 'برتقال طازج معصور يوميًا', price: 18, image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=400&fit=crop', sort_order: 1 },
      { name: 'عصير ليمون بالنعناع', description: 'ليمون طازج مع أوراق النعناع والثلج', price: 16, image_url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&h=400&fit=crop', sort_order: 2 },
      { name: 'عصير مانجو', description: 'مانجو ناضج مهروس مع الحليب أو الماء', price: 20, image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&h=400&fit=crop', sort_order: 3 },
      { name: 'سموذي التوت المشكل', description: 'مزيج التوت الأزرق والفراولة والموز', price: 26, image_url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=500&h=400&fit=crop', sort_order: 4 }
    ]
  };

  try {
    showToast('جاري تعبئة البيانات...', '');

    const { data: insertedCats, error: catErr } = await sb
      .from('categories')
      .upsert(defaultCategories, { onConflict: 'slug' })
      .select();

    if (catErr) throw catErr;

    for (const cat of insertedCats) {
      const catItems = defaultItemsMap[cat.slug] || [];
      const itemsToInsert = catItems.map(item => ({ ...item, category_id: cat.id }));
      if (itemsToInsert.length > 0) {
        const { error: itemErr } = await sb.from('items').insert(itemsToInsert);
        if (itemErr) throw itemErr;
      }
    }

    await loadAll();
    closeModal();
    showToast('تم تعبئة البيانات بنجاح ✓', 'success');
  } catch (err) {
    console.error(err);
    showToast('فشل التعبئة: ' + (err.message || ''), 'error');
  }
}

// ===== Helpers =====
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&')
    .replace(/"/g, '"')
    .replace(/'/g, '&#39;')
    .replace(/</g, '<')
    .replace(/>/g, '>');
}
