// ===== Default Menu Data =====
const DEFAULT_MENU = {
  cakes: {
    id: 'cakes',
    title: 'حلويات كيك',
    badge: 'كيك فاخر',
    desc: 'كيكات طازجة مخبوزة يوميًا بأجود المكونات',
    items: [
      {
        id: 'c1',
        name: 'كيك الشوكولاتة البلجيكية',
        desc: 'طبقات غنية من الشوكولاتة البلجيكية مع كريمة الزبدة',
        price: 45,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=400&fit=crop'
      },
      {
        id: 'c2',
        name: 'كيك الفانيلا الكلاسيكي',
        desc: 'كيك فانيلا ناعم مع كريمة الفانيلا الطبيعية',
        price: 38,
        image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&h=400&fit=crop'
      },
      {
        id: 'c3',
        name: 'كيك الجبن النيويوركي',
        desc: 'تشيز كيك كريمي مع صلصة التوت البري',
        price: 42,
        image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=500&h=400&fit=crop'
      },
      {
        id: 'c4',
        name: 'كيك الريد فلفت',
        desc: 'كيك أحمر مخملي مع كريمة الجبن الكريمية',
        price: 48,
        image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=500&h=400&fit=crop'
      }
    ]
  },
  icecream: {
    id: 'icecream',
    title: 'بوظة',
    badge: 'آيس كريم',
    desc: 'بوظة إيطالية فاخرة بنكهات طبيعية',
    items: [
      {
        id: 'i1',
        name: 'بوظة الفانيلا المدغشقرية',
        desc: 'فانيلا طبيعية من مدغشقر مع قطع البسكويت',
        price: 22,
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&h=400&fit=crop'
      },
      {
        id: 'i2',
        name: 'بوظة الشوكولاتة الداكنة',
        desc: 'شوكولاتة 70% مع رقائق الكاكاو',
        price: 24,
        image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=500&h=400&fit=crop'
      },
      {
        id: 'i3',
        name: 'بوظة الفراولة الطازجة',
        desc: 'فراولة طازجة مهروسة مع كريمة الحليب',
        price: 23,
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&h=400&fit=crop'
      },
      {
        id: 'i4',
        name: 'بوظة المانجو الاستوائية',
        desc: 'مانجو باكستاني ناضج مع لمسة ليمون',
        price: 25,
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&h=400&fit=crop'
      }
    ]
  },
  western: {
    id: 'western',
    title: 'حلو غربي',
    badge: 'حلويات غربية',
    desc: 'أشهى الحلويات الغربية بطابع عصري',
    items: [
      {
        id: 'w1',
        name: 'تيراميسو إيطالي',
        desc: 'طبقات الماسكاربوني والقهوة مع الكاكاو',
        price: 35,
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=400&fit=crop'
      },
      {
        id: 'w2',
        name: 'كرواسون بالشوكولاتة',
        desc: 'كرواسون مقرمش محشو بالشوكولاتة البلجيكية',
        price: 18,
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&h=400&fit=crop'
      },
      {
        id: 'w3',
        name: 'دونات مغطاة',
        desc: 'دونات طازجة مع تغطية الشوكولاتة والرشات',
        price: 15,
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&h=400&fit=crop'
      },
      {
        id: 'w4',
        name: 'ماكرون فرنسي',
        desc: 'تشكيلة ماكرون بألوان ونكهات متنوعة',
        price: 28,
        image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=500&h=400&fit=crop'
      }
    ]
  },
  eastern: {
    id: 'eastern',
    title: 'حلو شرقي',
    badge: 'حلويات شرقية',
    desc: 'أصالة الحلويات الشرقية بنكهات تقليدية',
    items: [
      {
        id: 'e1',
        name: 'بقلاوة بالفستق',
        desc: 'طبقات رقيقة محشوة بالفستق الحلبي والشيرة',
        price: 32,
        image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=500&h=400&fit=crop'
      },
      {
        id: 'e2',
        name: 'كنافة نابلسية',
        desc: 'كنافة مقرمشة مع الجبنة العكاوي والشيرة',
        price: 36,
        image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500&h=400&fit=crop'
      },
      {
        id: 'e3',
        name: 'معمول بالتمر',
        desc: 'معمول طري محشو بالتمر والمكسرات',
        price: 20,
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=400&fit=crop'
      },
      {
        id: 'e4',
        name: 'هريسة بالقشطة',
        desc: 'هريسة طازجة مغطاة بالقشطة والفستق',
        price: 28,
        image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&h=400&fit=crop'
      }
    ]
  },
  coldCoffee: {
    id: 'cold-coffee',
    title: 'قهوات باردة',
    badge: 'مشروبات باردة',
    desc: 'قهوة باردة منعشة لتحيي يومك',
    items: [
      {
        id: 'cc1',
        name: 'لاتيه مثلج',
        desc: 'إسبريسو مع حليب بارد وثلج',
        price: 22,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&h=400&fit=crop'
      },
      {
        id: 'cc2',
        name: 'أمريكانو مثلج',
        desc: 'إسبريسو مخفف بالماء البارد والثلج',
        price: 18,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&h=400&fit=crop'
      },
      {
        id: 'cc3',
        name: 'فرابتشينو كراميل',
        desc: 'مزيج القهوة المثلجة مع الكراميل والكريمة',
        price: 28,
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&h=400&fit=crop'
      },
      {
        id: 'cc4',
        name: 'آيس موكا',
        desc: 'قهوة مثلجة مع الشوكولاتة والحليب',
        price: 25,
        image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=500&h=400&fit=crop'
      }
    ]
  },
  hotCoffee: {
    id: 'hot-coffee',
    title: 'قهوات ساخنة',
    badge: 'قهوة ساخنة',
    desc: 'قهوة محمصة طازجة بطرق تحضير احترافية',
    items: [
      {
        id: 'hc1',
        name: 'إسبريسو',
        desc: 'جرعة مركزة من القهوة الإيطالية الأصيلة',
        price: 14,
        image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500&h=400&fit=crop'
      },
      {
        id: 'hc2',
        name: 'كابتشينو',
        desc: 'إسبريسو مع رغوة الحليب الكريمية',
        price: 20,
        image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&h=400&fit=crop'
      },
      {
        id: 'hc3',
        name: 'لاتيه',
        desc: 'إسبريسو مع حليب مبخر ناعم',
        price: 22,
        image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=500&h=400&fit=crop'
      },
      {
        id: 'hc4',
        name: 'فلات وايت',
        desc: 'إسبريسو مزدوج مع حليب مبخر حريري',
        price: 24,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=400&fit=crop'
      }
    ]
  },
  juices: {
    id: 'juices',
    title: 'مشروبات باردة وعصائر',
    badge: 'عصائر طازجة',
    desc: 'عصائر طبيعية 100% بدون إضافات',
    items: [
      {
        id: 'j1',
        name: 'عصير برتقال طازج',
        desc: 'برتقال طازج معصور يوميًا',
        price: 18,
        image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=400&fit=crop'
      },
      {
        id: 'j2',
        name: 'عصير ليمون بالنعناع',
        desc: 'ليمون طازج مع أوراق النعناع والثلج',
        price: 16,
        image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&h=400&fit=crop'
      },
      {
        id: 'j3',
        name: 'عصير مانجو',
        desc: 'مانجو ناضج مهروس مع الحليب أو الماء',
        price: 20,
        image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&h=400&fit=crop'
      },
      {
        id: 'j4',
        name: 'سموذي التوت المشكل',
        desc: 'مزيج التوت الأزرق والفراولة والموز',
        price: 26,
        image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=500&h=400&fit=crop'
      }
    ]
  }
};

// ===== State =====
let menuData = {};
let isAdmin = false;
const ADMIN_PASSWORD = 'shaghaf2024';

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderMenu();
  setupEventListeners();
  checkAdminSession();
});

function loadData() {
  const saved = localStorage.getItem('shaghaf_menu');
  if (saved) {
    try {
      menuData = JSON.parse(saved);
    } catch {
      menuData = structuredClone(DEFAULT_MENU);
    }
  } else {
    menuData = structuredClone(DEFAULT_MENU);
  }
}

function saveData() {
  localStorage.setItem('shaghaf_menu', JSON.stringify(menuData));
  showToast('تم الحفظ بنجاح ✓', 'success');
}

function checkAdminSession() {
  if (sessionStorage.getItem('shaghaf_admin') === 'true') {
    isAdmin = true;
    document.body.classList.add('admin-mode');
  }
}

// ===== Render =====
function renderMenu() {
  const container = document.getElementById('menuContainer');
  container.innerHTML = '';

  const order = ['cakes', 'icecream', 'western', 'eastern', 'coldCoffee', 'hotCoffee', 'juices'];

  order.forEach(key => {
    const section = menuData[key];
    if (!section) return;

    const sectionEl = document.createElement('section');
    sectionEl.className = 'menu-section';
    sectionEl.id = section.id;

    sectionEl.innerHTML = `
      <div class="container">
        <div class="section-header">
          <span class="section-badge">${section.badge}</span>
          <h2 class="section-title">${section.title}</h2>
          <p class="section-desc">${section.desc}</p>
        </div>
        <div class="menu-grid" id="grid-${key}">
          ${section.items.map(item => renderCard(item, key)).join('')}
          <button class="add-item-btn" onclick="openAddItem('${key}')">
            ➕ إضافة صنف جديد
          </button>
        </div>
      </div>
    `;
    container.appendChild(sectionEl);
  });
}

function renderCard(item, sectionKey) {
  return `
    <div class="product-card" data-id="${item.id}" data-section="${sectionKey}">
      <div class="admin-controls">
        <button class="admin-btn" onclick="openEditItem('${sectionKey}', '${item.id}')" title="تعديل">✏️</button>
        <button class="admin-btn delete" onclick="deleteItem('${sectionKey}', '${item.id}')" title="حذف">🗑️</button>
      </div>
      <div class="product-img-wrap">
        <img class="product-img" src="${item.image}" alt="${item.name}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=400&fit=crop'">
      </div>
      <div class="product-body">
        <h3 class="product-name">${item.name}</h3>
        <p class="product-desc">${item.desc}</p>
        <div class="product-footer">
          <span class="product-price">${item.price} <span>ر.س</span></span>
        </div>
      </div>
    </div>
  `;
}

// ===== Event Listeners =====
function setupEventListeners() {
  // Header scroll
  window.addEventListener('scroll', () => {
    document.getElementById('header').classList.toggle('scrolled', window.scrollY > 50);
  });

  // Mobile menu
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('nav').classList.toggle('open');
  });

  // Close nav on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('nav').classList.remove('open');
    });
  });

  // Admin button
  document.getElementById('adminBtn').addEventListener('click', openAdminModal);

  // Close modal
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('adminModal').addEventListener('click', (e) => {
    if (e.target.id === 'adminModal') closeModal();
  });
}

// ===== Admin Modal =====
function openAdminModal() {
  const modal = document.getElementById('adminModal');
  const body = document.getElementById('adminBody');
  modal.classList.add('active');

  if (isAdmin) {
    body.innerHTML = `
      <div class="admin-panel">
        <div class="admin-status">
          <span>🟢</span>
          <span>أنت مسجل كمسؤول — يمكنك تعديل أي صنف مباشرة من القائمة</span>
        </div>
        <p style="color:var(--gray-600);font-size:0.95rem;">
          انقر على أيقونة ✏️ لتعديل صنف أو 🗑️ لحذفه. أو أضف أصنافًا جديدة من كل قسم.
        </p>
        <div class="admin-actions">
          <button class="btn-secondary" onclick="resetToDefault()">إعادة تعيين البيانات الافتراضية</button>
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

function resetToDefault() {
  if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات إلى الافتراضية؟ سيتم فقدان التعديلات.')) {
    menuData = structuredClone(DEFAULT_MENU);
    saveData();
    renderMenu();
    closeModal();
  }
}

// ===== Edit / Add / Delete =====
function openEditItem(sectionKey, itemId) {
  const section = menuData[sectionKey];
  const item = section.items.find(i => i.id === itemId);
  if (!item) return;

  const modal = document.getElementById('adminModal');
  const body = document.getElementById('adminBody');
  modal.classList.add('active');

  body.innerHTML = `
    <form class="edit-form" onsubmit="saveEditItem(event, '${sectionKey}', '${itemId}')">
      <h3 style="color:var(--blue-900);margin-bottom:8px;">تعديل الصنف</h3>
      <div class="form-group">
        <label>اسم الصنف</label>
        <input type="text" id="editName" value="${escapeHtml(item.name)}" required>
      </div>
      <div class="form-group">
        <label>الوصف</label>
        <textarea id="editDesc" rows="2" required>${escapeHtml(item.desc)}</textarea>
      </div>
      <div class="form-group">
        <label>السعر (ر.س)</label>
        <input type="number" id="editPrice" value="${item.price}" min="1" step="1" required>
      </div>
      <div class="form-group">
        <label>رابط الصورة</label>
        <input type="url" id="editImage" value="${escapeHtml(item.image)}" required>
      </div>
      <div style="display:flex;gap:10px;margin-top:8px;">
        <button type="submit" class="btn-submit" style="flex:1;">حفظ التعديلات</button>
        <button type="button" class="btn-secondary" onclick="closeModal()">إلغاء</button>
      </div>
    </form>
  `;
}

function saveEditItem(e, sectionKey, itemId) {
  e.preventDefault();
  const section = menuData[sectionKey];
  const item = section.items.find(i => i.id === itemId);
  if (!item) return;

  item.name = document.getElementById('editName').value.trim();
  item.desc = document.getElementById('editDesc').value.trim();
  item.price = Number(document.getElementById('editPrice').value);
  item.image = document.getElementById('editImage').value.trim();

  saveData();
  renderMenu();
  closeModal();
}

function openAddItem(sectionKey) {
  const modal = document.getElementById('adminModal');
  const body = document.getElementById('adminBody');
  modal.classList.add('active');

  body.innerHTML = `
    <form class="edit-form" onsubmit="saveNewItem(event, '${sectionKey}')">
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
        <input type="number" id="editPrice" placeholder="25" min="1" step="1" required>
      </div>
      <div class="form-group">
        <label>رابط الصورة (من Unsplash أو أي رابط)</label>
        <input type="url" id="editImage" placeholder="https://images.unsplash.com/..." required>
      </div>
      <div style="display:flex;gap:10px;margin-top:8px;">
        <button type="submit" class="btn-submit" style="flex:1;">إضافة</button>
        <button type="button" class="btn-secondary" onclick="closeModal()">إلغاء</button>
      </div>
    </form>
  `;
}

function saveNewItem(e, sectionKey) {
  e.preventDefault();
  const section = menuData[sectionKey];
  const newItem = {
    id: 'item_' + Date.now(),
    name: document.getElementById('editName').value.trim(),
    desc: document.getElementById('editDesc').value.trim(),
    price: Number(document.getElementById('editPrice').value),
    image: document.getElementById('editImage').value.trim()
  };
  section.items.push(newItem);
  saveData();
  renderMenu();
  closeModal();
}

function deleteItem(sectionKey, itemId) {
  if (!confirm('هل أنت متأكد من حذف هذا الصنف؟')) return;
  const section = menuData[sectionKey];
  section.items = section.items.filter(i => i.id !== itemId);
  saveData();
  renderMenu();
}

// ===== Helpers =====
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
