// =====================================================
// كافيه شغف - Connected to Supabase (Cloud Database)
// =====================================================

// ========== 1. SUPABASE CONFIG ==========
// استبدل القيم التالية بمفاتيح مشروعك من لوحة Supabase
// Settings → API → Project URL + anon public key
const SUPABASE_URL = 'https://opvjcjohxcgagyzxtemh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KaWJM5urxHkjbg6tI6xB6w_n6c8--gk';

// إنشاء عميل Supabase
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== 2. STATE ==========
let categories = [];   // من جدول categories
let items = [];        // من جدول items
let isAdmin = false;
const ADMIN_PASSWORD = 'shaghaf2024';

// ========== 3. INIT ==========
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  checkAdminSession();
  await loadMenuFromSupabase();
});

// ========== 4. FETCH FROM SUPABASE ==========
async function loadMenuFromSupabase() {
  const loadingEl = document.getElementById('loadingState');
  const menuEl = document.getElementById('menuContainer');

  try {
    // جلب الأقسام مرتبة
    const { data: cats, error: catError } = await sb
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (catError) throw catError;

    // جلب الأصناف مرتبة
    const { data: prods, error: itemError } = await sb
      .from('items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (itemError) throw itemError;

    categories = cats || [];
    items = prods || [];

    renderMenu();
    loadingEl.style.display = 'none';
    menuEl.style.display = 'block';
  } catch (err) {
    console.error('Error loading menu:', err);
    loadingEl.innerHTML = `
      <p style="color:#C62828;font-weight:700;">حدث خطأ أثناء تحميل القائمة</p>
      <p style="color:var(--gray-600);font-size:0.9rem;margin-top:8px;">تأكد من إعداد مفاتيح Supabase بشكل صحيح</p>
      <button class="btn-primary" style="margin-top:16px;" onclick="location.reload()">إعادة المحاولة</button>
    `;
  }
}

// ========== 5. RENDER ==========
function renderMenu() {
  const container = document.getElementById('menuContainer');
  container.innerHTML = '';

  if (categories.length === 0) {
    container.innerHTML = `
      <div class="container" style="text-align:center;padding:60px 20px;">
        <p style="color:var(--gray-600);">لا توجد أقسام بعد. سجّل كمسؤول وأضف بيانات.</p>
      </div>`;
    return;
  }

  categories.forEach(cat => {
    const catItems = items.filter(i => i.category_id === cat.id);

    const sectionEl = document.createElement('section');
    sectionEl.className = 'menu-section';
    sectionEl.id = cat.slug;

    sectionEl.innerHTML = `
      <div class="container">
        <div class="section-header">
          <span class="section-badge">${escapeHtml(cat.badge || '')}</span>
          <h2 class="section-title">${escapeHtml(cat.name)}</h2>
          <p class="section-desc">${escapeHtml(cat.description || '')}</p>
        </div>
        <div class="menu-grid">
          ${catItems.map(item => renderCard(item, cat.id)).join('')}
          <button class="add-item-btn" onclick="openAddItem('${cat.id}')">
            ➕ إضافة صنف جديد
          </button>
        </div>
      </div>
    `;
    container.appendChild(sectionEl);
  });
}

function renderCard(item, categoryId) {
  return `
    <div class="product-card" data-id="${item.id}">
      <div class="admin-controls">
        <button class="admin-btn" onclick="openEditItem('${item.id}')" title="تعديل">✏️</button>
        <button class="admin-btn delete" onclick="deleteItem('${item.id}')" title="حذف">🗑️</button>
      </div>
      <div class="product-img-wrap">
        <img class="product-img" src="${escapeHtml(item.image_url || '')}" alt="${escapeHtml(item.name)}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=400&fit=crop'">
      </div>
      <div class="product-body">
        <h3 class="product-name">${escapeHtml(item.name)}</h3>
        <p class="product-desc">${escapeHtml(item.description || '')}</p>
        <div class="product-footer">
          <span class="product-price">${item.price} <span>ر.س</span></span>
        </div>
      </div>
    </div>
  `;
}

// ========== 6. EVENT LISTENERS ==========
function setupEventListeners() {
  window.addEventListener('scroll', () => {
    document.getElementById('header').classList.toggle('scrolled', window.scrollY > 50);
  });

  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('nav').classList.toggle('open');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('nav').classList.remove('open');
    });
  });

  document.getElementById('adminBtn').addEventListener('click', openAdminModal);
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('adminModal').addEventListener('click', (e) => {
    if (e.target.id === 'adminModal') closeModal();
  });
}

// ========== 7. ADMIN AUTH (Client-side password) ==========
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
          <span>أنت مسجل كمسؤول — التعديلات تُحفظ مباشرة في السحابة وتظهر لكل الزوار</span>
        </div>
        <p style="color:var(--gray-600);font-size:0.95rem;">
          انقر ✏️ لتعديل صنف أو 🗑️ لحذفه. أو أضف أصنافًا جديدة من كل قسم.
        </p>
        <div class="admin-actions">
          <button class="btn-secondary" onclick="seedDefaultData()">تعبئة البيانات الافتراضية</button>
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

// ========== 8. CRUD OPERATIONS (Supabase) ==========

// --- Edit Item ---
function openEditItem(itemId) {
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  const modal = document.getElementById('adminModal');
  const body = document.getElementById('adminBody');
  modal.classList.add('active');

  body.innerHTML = `
    <form class="edit-form" onsubmit="saveEditItem(event, '${itemId}')">
      <h3 style="color:var(--blue-900);margin-bottom:8px;">تعديل الصنف</h3>
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

    // تحديث محلي
    const idx = items.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      items[idx] = { ...items[idx], name, description, price, image_url };
    }

    renderMenu();
    closeModal();
    showToast('تم التحديث بنجاح ✓', 'success');
  } catch (err) {
    console.error(err);
    showToast('فشل التحديث: ' + (err.message || 'خطأ غير معروف'), 'error');
  }
}

// --- Add Item ---
function openAddItem(categoryId) {
  const modal = document.getElementById('adminModal');
  const body = document.getElementById('adminBody');
  modal.classList.add('active');

  body.innerHTML = `
    <form class="edit-form" onsubmit="saveNewItem(event, '${categoryId}')">
      <h3 style="color:var(--blue-900);margin-bottom:8px;">إضافة صنف جديد</h3>
      <div class="form-group">
        <label>اسم الصنف</label>
        <input type="text" id="editName" placeholder="مثال: كيك الشوكولاتة" required>
      </div>
      <div class="form-group">
        <label>الوصف</label>
        <textarea id="editDesc" rows="2" placeholder="وصف قصير للصنف" required></textarea>
      </div>
      <div class="form-group">
        <label>السعر (ر.س)</label>
        <input type="number" id="editPrice" placeholder="25" min="1" step="0.5" required>
      </div>
      <div class="form-group">
        <label>رابط الصورة</label>
        <input type="url" id="editImage" placeholder="https://images.unsplash.com/..." required>
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

  // حساب ترتيب جديد
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
    showToast('فشل الإضافة: ' + (err.message || 'خطأ غير معروف'), 'error');
  }
}

// --- Delete Item ---
async function deleteItem(itemId) {
  if (!confirm('هل أنت متأكد من حذف هذا الصنف؟')) return;

  try {
    const { error } = await sb
      .from('items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;

    items = items.filter(i => i.id !== itemId);
    renderMenu();
    showToast('تم الحذف بنجاح', 'success');
  } catch (err) {
    console.error(err);
    showToast('فشل الحذف: ' + (err.message || 'خطأ غير معروف'), 'error');
  }
}

// ========== 9. SEED DEFAULT DATA (مرة واحدة) ==========
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

    // إدخال الأقسام
    const { data: insertedCats, error: catErr } = await sb
      .from('categories')
      .upsert(defaultCategories, { onConflict: 'slug' })
      .select();

    if (catErr) throw catErr;

    // إدخال الأصناف
    for (const cat of insertedCats) {
      const catItems = defaultItemsMap[cat.slug] || [];
      const itemsToInsert = catItems.map(item => ({
        ...item,
        category_id: cat.id
      }));

      if (itemsToInsert.length > 0) {
        const { error: itemErr } = await sb.from('items').insert(itemsToInsert);
        if (itemErr) throw itemErr;
      }
    }

    await loadMenuFromSupabase();
    closeModal();
    showToast('تم تعبئة البيانات بنجاح ✓', 'success');
  } catch (err) {
    console.error(err);
    showToast('فشل التعبئة: ' + (err.message || 'خطأ'), 'error');
  }
}

// ========== 10. HELPERS ==========
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
