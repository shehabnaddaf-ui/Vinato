// ═══════════════════════════════════════════════
// VINATO ADMIN DASHBOARD — admin.js
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  /* ─── State Management ─── */
  const state = {
    mediaLibrary: [], // Array of local object URLs
    colors: [
      { id: 'c1', name: 'Black', hex: '#000000', images: [] }
    ],
    activeColorIdForMedia: null,
    settings: {
      instagram: localStorage.getItem('s_instagram') || 'https://instagram.com/vinato',
      phone: localStorage.getItem('s_phone') || '+1 (212) 555-1234'
    }
  };

  // Credentials Management
  const updateCredsBtn = document.getElementById('updateCredsBtn');
  const adminUserInput = document.getElementById('admin_user_input');
  const adminPassInput = document.getElementById('admin_pass_input');
  const togglePassSettings = document.querySelector('.toggle-pass-settings');

  if (togglePassSettings) {
    togglePassSettings.addEventListener('click', () => {
      const type = adminPassInput.getAttribute('type') === 'password' ? 'text' : 'password';
      adminPassInput.setAttribute('type', type);
      togglePassSettings.textContent = type === 'password' ? 'SHOW' : 'HIDE';
    });
  }

  if (updateCredsBtn) {
    updateCredsBtn.addEventListener('click', () => {
      const newUser = adminUserInput.value.trim();
      const newPass = adminPassInput.value.trim();

      if (!newUser || !newPass) {
        showToast("Please enter both username and password");
        return;
      }

      localStorage.setItem('admin_user', newUser);
      localStorage.setItem('admin_pass', newPass);
      showToast("Credentials updated successfully!");
      adminUserInput.value = '';
      adminPassInput.value = '';
    });
  }

  // Logout Logic
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('admin_session');
      window.location.href = 'login.html';
    });
  }

  /* ─── Navigation & Views ─── */
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view-panel');
  const previewPanel = document.querySelector('.preview-panel');

  function switchView(targetViewId) {
    // Update Nav
    navItems.forEach(item => {
      if (item.dataset.view === targetViewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update Views
    views.forEach(view => {
      if (view.id === targetViewId) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Preview Toggle (Only for products)
    if (previewPanel) {
      if (targetViewId === 'products-view') {
        previewPanel.classList.remove('hidden');
        previewPanel.style.display = 'flex';
      } else {
        previewPanel.classList.add('hidden');
        previewPanel.style.display = 'none';
      }
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetViewId = item.dataset.view;
      if (targetViewId) switchView(targetViewId);
    });
  });

  // Init default view
  const currentActive = document.querySelector('.nav-item.active');
  if (currentActive && currentActive.dataset.view) {
    switchView(currentActive.dataset.view);
  } else {
    switchView('products-view'); // Fallback
  }

  // Image Manager — renders all site images with Media Library picker
  let imgMgrTargetKey = null;

  function renderImageManager() {
    const list = document.getElementById('imageManagerList');
    if (!list) return;

    const SITE_IMAGES = [
      { key: 'hero_bg',           label: 'Hero Background',            location: 'Homepage → Hero Section',           path: '/store/images/optimized/hero_unisex.png.webp' },
      { key: 'new_collection',    label: 'New Collection',             location: 'Homepage → New Collection Section', path: '/store/images/optimized/new_collection.webp' },
      { key: 'best_sellers',      label: 'Best Sellers',               location: 'Homepage → Best Sellers Section',   path: '/store/images/optimized/best_sellers.webp' },
      { key: 'instagram_grid',    label: 'Instagram Gallery',          location: 'Homepage → Instagram Section',     path: '/store/images/optimized/instagram_grid.webp' },
      { key: 'prod_coat_men',     label: "Men's Structured Overcoat",  location: 'Shop → Men / Product Page',         path: '/store/images/optimized/prod_coat_men.webp' },
      { key: 'prod_dress_silk',   label: "Women's Silk Slip Dress",    location: 'Shop → Women / Category Section',   path: '/store/images/optimized/prod_dress_silk.webp' },
      { key: 'prod_knitwear',     label: 'Oversized Cashmere Sweater', location: 'Shop → Product Page (Main Image)',  path: '/store/images/optimized/prod_knitwear.webp' },
      { key: 'prod_trousers',     label: 'Tailored Wool Trousers',     location: 'Shop → Women / Category Card',      path: '/store/images/optimized/prod_trousers.webp' },
      { key: 'hero_bg_editorial', label: 'Editorial Split Image',      location: 'Homepage → Editorial Split Section',path: '/store/images/optimized/hero_bg.webp' },
    ];

    const replaced = JSON.parse(localStorage.getItem('vinato_replaced_server_files') || '{}');
    list.innerHTML = '';

    SITE_IMAGES.forEach(img => {
      const currentUrl = replaced[img.key] || img.path;
      const isReplaced = !!replaced[img.key];

      const card = document.createElement('div');
      card.className = 'form-card';
      card.style.cssText = 'display:flex; gap:20px; align-items:flex-start; padding:20px;';
      card.innerHTML = `
        <div style="flex:0 0 120px; height:120px; background:#111; border-radius:6px; overflow:hidden;">
          <img src="${currentUrl}" alt="${img.label}" style="width:100%; height:100%; object-fit:cover; display:block;" id="imgPreview_${img.key}">
        </div>
        <div style="flex:1; min-width:0;">
          <div style="font-weight:600; font-size:0.9rem; margin-bottom:4px;">${img.label}</div>
          <div style="font-size:0.72rem; color:#888; margin-bottom:2px;">📍 ${img.location}</div>
          <div style="font-size:0.68rem; color:#666; margin-bottom:12px; direction:ltr; word-break:break-all;">${img.path}</div>
          ${isReplaced ? `<div style="font-size:0.68rem; color:#d4af37; margin-bottom:8px;">✓ تم استبداله → <span style="word-break:break-all;">${currentUrl}</span></div>` : ''}
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-primary" style="font-size:0.78rem;" onclick="openImgMgrPicker('${img.key}')">
              🖼 اختر من المكتبة
            </button>
            ${isReplaced ? `<button class="btn btn-outline" style="font-size:0.75rem;" onclick="resetImage('${img.key}')">♻ Reset</button>` : ''}
          </div>
        </div>
      `;
      list.appendChild(card);
    });
  }

  window.openImgMgrPicker = (key) => {
    imgMgrTargetKey = key;
    state.activeColorIdForMedia = '__imgmgr__';
    openMediaModal('__imgmgr__');
  };

  window.resetImage = (key) => {
    const replaced = JSON.parse(localStorage.getItem('vinato_replaced_server_files') || '{}');
    delete replaced[key];
    localStorage.setItem('vinato_replaced_server_files', JSON.stringify(replaced));
    renderImageManager();
    showToast('♻ تم إعادة الصورة الأصلية');
  };

  // Trigger render when nav item clicked + manage-products-view
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (item.dataset.view === 'server-media-view') renderImageManager();
      if (item.dataset.view === 'manage-products-view') renderManageProducts();
    });
  });

  if (currentActive && currentActive.dataset.view === 'server-media-view') renderImageManager();
  if (currentActive && currentActive.dataset.view === 'manage-products-view') renderManageProducts();

  // ─── Manage Products Table ───
  let editingProductId = null;

  function renderManageProducts() {
    const tbody = document.getElementById('manageProductsBody');
    if (!tbody) return;

    const products = JSON.parse(localStorage.getItem('vinato_dynamic_products') || '[]');
    tbody.innerHTML = '';

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:#888;">لا توجد منتجات منشورة بعد. اضغط "+ إضافة منتج" للبدء.</td></tr>`;
      return;
    }

    const STATUS_ICONS = { Published: '✅', Draft: '📝', Hidden: '🙈' };
    const PLACEMENT_LABELS = { shop: '🛍', homepage_featured: '⭐', homepage_editorial: '🎨', homepage_bestseller: '🔥' };

    products.forEach(prod => {
      const thumb = prod.colors?.[0]?.images?.[0] || '';
      const placements = (prod.placement || ['shop']).map(p => PLACEMENT_LABELS[p] || p).join(' ');
      const statusIcon = STATUS_ICONS[prod.status] || '📝';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><div style="width:50px; height:60px; overflow:hidden; border-radius:4px; background:#111;">
          ${thumb ? `<img src="${thumb}" style="width:100%;height:100%;object-fit:cover;">` : '—'}
        </div></td>
        <td style="font-weight:500;">${prod.name_ar || prod.name || '—'}</td>
        <td>$${prod.price || '0'}</td>
        <td>${prod.gender || '—'}</td>
        <td style="font-size:1.1rem; letter-spacing:4px;">${placements}</td>
        <td><span class="badge-status ${prod.status === 'Published' ? 'active' : prod.status === 'Hidden' ? 'warning' : ''}"
          style="cursor:pointer;" onclick="cycleStatus('${prod.id}')">${statusIcon} ${prod.status || 'Draft'}</span></td>
        <td style="display:flex; gap:6px; align-items:center;">
          <button class="btn-icon" title="تعديل" onclick="openEditProduct('${prod.id}')">✎</button>
          <button class="btn-icon" title="نسخ" onclick="duplicateProduct('${prod.id}')">📄</button>
          <button class="btn-icon" title="حذف" style="color:#e55;" onclick="deleteProduct('${prod.id}')">×</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('editProductForm').style.display = 'none';
  }

  window.deleteProduct = (id) => {
    if (!confirm('حذف المنتج نهائياً؟')) return;
    let products = JSON.parse(localStorage.getItem('vinato_dynamic_products') || '[]');
    products = products.filter(p => p.id !== id);
    localStorage.setItem('vinato_dynamic_products', JSON.stringify(products));
    renderManageProducts();
    showToast('تم حذف المنتج ✓');
  };

  window.duplicateProduct = (id) => {
    let products = JSON.parse(localStorage.getItem('vinato_dynamic_products') || '[]');
    const orig = products.find(p => p.id === id);
    if (!orig) return;
    const copy = JSON.parse(JSON.stringify(orig));
    copy.id = 'p' + Date.now();
    copy.name_ar = 'نسخة - ' + (copy.name_ar || copy.name || '');
    copy.name = copy.name_ar;
    copy.status = 'Draft';
    copy.timestamp = Date.now();
    products.push(copy);
    localStorage.setItem('vinato_dynamic_products', JSON.stringify(products));
    renderManageProducts();
    showToast('📄 تم نسخ المنتج ✓');
  };

  window.cycleStatus = (id) => {
    const cycle = ['Draft', 'Published', 'Hidden'];
    let products = JSON.parse(localStorage.getItem('vinato_dynamic_products') || '[]');
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    const idx = cycle.indexOf(prod.status || 'Draft');
    prod.status = cycle[(idx + 1) % cycle.length];
    localStorage.setItem('vinato_dynamic_products', JSON.stringify(products));
    renderManageProducts();
    showToast(`الحالة: ${prod.status}`);
  };

  window.openEditProduct = (id) => {
    const products = JSON.parse(localStorage.getItem('vinato_dynamic_products') || '[]');
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    editingProductId = id;
    document.getElementById('edit_name').value = prod.name_ar || prod.name || '';
    document.getElementById('edit_price').value = prod.price || '';
    document.getElementById('edit_compare_price').value = prod.comparePrice || '';
    document.getElementById('edit_status').value = prod.status || 'Draft';
    document.getElementById('editFormTitle').textContent = `✏️ تعديل: ${prod.name_ar || prod.name}`;
    document.getElementById('editProductForm').style.display = 'block';
    document.getElementById('editProductForm').scrollIntoView({ behavior: 'smooth' });
  };

  document.getElementById('saveEditBtn')?.addEventListener('click', () => {
    if (!editingProductId) return;
    let products = JSON.parse(localStorage.getItem('vinato_dynamic_products') || '[]');
    const prod = products.find(p => p.id === editingProductId);
    if (!prod) return;
    prod.name_ar = document.getElementById('edit_name').value.trim();
    prod.name = prod.name_ar;
    prod.price = document.getElementById('edit_price').value;
    prod.comparePrice = document.getElementById('edit_compare_price').value;
    prod.status = document.getElementById('edit_status').value;
    localStorage.setItem('vinato_dynamic_products', JSON.stringify(products));
    editingProductId = null;
    renderManageProducts();
    showToast('تم حفظ التعديلات ✓');
  });

  document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
    editingProductId = null;
    document.getElementById('editProductForm').style.display = 'none';
  });

  /* ─── Toast Notifications (Interactive Feedback) ─── */
  function showToast(message) {
    let toast = document.getElementById('adminToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'adminToast';
      toast.className = 'admin-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove('show');
    void toast.offsetWidth; // Trigger reflow to restart animation
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Products Management (Save/Publish)
  const publishBtn = document.getElementById('publishBtn');
  if (publishBtn) {
    publishBtn.addEventListener('click', (e) => {
      e.preventDefault();
      saveCurrentProduct();
    });
  }

  function saveCurrentProduct() {
    const nameAr = inputs.name.value.trim();
    const descAr = (document.getElementById('p_description') || {}).value?.trim() || '';
    const catSelect = document.getElementById('p_cat_ar');
    const catSlug = catSelect ? catSelect.value.trim() : '';

    // Map English slugs → Arabic display names
    const CAT_AR_MAP = {
      jackets: 'جاكيتات', shirts: 'قمصان', sweaters: 'كنزات', pants: 'بناطيل',
      suits: 'بدلات', dresses: 'فساتين', accessories: 'إكسسوارات',
      pajamas: 'بيجامات', underwear: 'ملابس داخلية', shoes: 'أحذية'
    };
    const catAr = CAT_AR_MAP[catSlug] || catSlug;
    const catEn = catSlug; // already English slug

    if (!nameAr || inputs.colors.every ? inputs.colors.every(c => c.images.length === 0) : false) {
      // We'll validate below
    }

    const product = {
      id: 'p' + Date.now(),
      name_ar: nameAr,
      name: nameAr,
      description_ar: descAr,
      cat_ar: catAr,
      cat: catAr || 'General',
      name_en: nameAr,
      description_en: descAr,
      cat_en: catAr,
      gender: inputs.gender.value,
      price: inputs.price.value,
      comparePrice: inputs.comparePrice.value,
      badge: inputs.badge.value.trim(),
      sort: inputs.p_sort.value || 1,
      status: document.getElementById('p_status').value,
      placement: [
        'shop',
        ...(document.getElementById('place_featured')?.checked ? ['homepage_featured'] : []),
        ...(document.getElementById('place_editorial')?.checked ? ['homepage_editorial'] : []),
        ...(document.getElementById('place_bestseller')?.checked ? ['homepage_bestseller'] : [])
      ],
      featured: document.getElementById('place_featured')?.checked || false,
      sizes: Array.from(inputs.sizes).filter(s => s.checked).map(s => s.value),
      colors: state.colors.map(c => ({
        name: c.name,
        hex: c.hex,
        images: c.images
      })),
      timestamp: Date.now()
    };

    if (!product.name_ar || product.colors.every(c => c.images.length === 0)) {
      showToast('يرجى إدخال اسم المنتج وصورة واحدة على الأقل.');
      return;
    }

    // Helper: call MyMemory free API
    async function translateText(text) {
      if (!text || !text.trim()) return text;
      try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ar|en`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.responseStatus === 200) {
          return data.responseData.translatedText || text;
        }
      } catch(e) { /* fallback below */ }
      return text; // fallback: return original on error
    }

    showToast('جارٍ الترجمة...');

    Promise.all([
      translateText(nameAr),
      translateText(descAr)
    ]).then(([nameEn, descEn]) => {
      product.name_en = nameEn || nameAr;
      product.description_en = descEn || descAr;
      product.cat_en = catEn;
      product.name = nameAr;
      product.cat  = catAr;

      const existingProducts = JSON.parse(localStorage.getItem('vinato_dynamic_products') || '[]');
      existingProducts.push(product);
      localStorage.setItem('vinato_dynamic_products', JSON.stringify(existingProducts));

      showToast('تم النشر بنجاح ✓');
    }).catch(() => {
      // Even if translation failed, save with Arabic only
      const existingProducts = JSON.parse(localStorage.getItem('vinato_dynamic_products') || '[]');
      existingProducts.push(product);
      localStorage.setItem('vinato_dynamic_products', JSON.stringify(existingProducts));
      showToast('تم الحفظ (الترجمة غير متاحة حالياً)');
    });
  }

  const placeholderBtnIds = ['saveDraftBtn', 'saveSettingsBtn'];
  placeholderBtnIds.forEach(id => {
    const btn = document.getElementById(id);
    if(btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Action successful');
      });
    }
  });

  document.querySelectorAll('.toast-btn, .sp-add-btn, .sp-size-guide').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Action successful');
    });
  });

  // Settings Management
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const sInstagramInput = document.getElementById('s_instagram');
  const sPhoneInput = document.getElementById('s_phone');

  if (saveSettingsBtn) {
    // Populate initial values
    if (sInstagramInput) sInstagramInput.value = state.settings.instagram;
    if (sPhoneInput) sPhoneInput.value = state.settings.phone;

    saveSettingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const newInsta = sInstagramInput.value.trim();
      const newPhone = sPhoneInput.value.trim();

      localStorage.setItem('s_instagram', newInsta);
      localStorage.setItem('s_phone', newPhone);
      state.settings.instagram = newInsta;
      state.settings.phone = newPhone;

      showToast("Store settings saved!");
    });
  }

  const productForm = document.getElementById('productForm');
  if(productForm) {
    productForm.addEventListener('submit', (e) => { e.preventDefault(); });
  }

  /* ─── Media Library (Drag & Drop) ─── */
  const dropZone = document.getElementById('mediaDropZone');
  const fileInput = document.getElementById('mediaFileInput');
  const mediaGrid = document.getElementById('mediaGrid');

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
    dropZone.addEventListener(evt, preventDefaults, false);
  });
  function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

  ['dragenter', 'dragover'].forEach(evt => {
    dropZone.addEventListener(evt, () => dropZone.classList.add('dragover'), false);
  });
  ['dragleave', 'drop'].forEach(evt => {
    dropZone.addEventListener(evt, () => dropZone.classList.remove('dragover'), false);
  });

  dropZone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
  fileInput.addEventListener('change', function() { handleFiles(this.files); });

  function handleFiles(files) {
    [...files].forEach(file => {
      if (!file.type.startsWith('image/')) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Url = e.target.result;
        state.mediaLibrary.push(base64Url);
        renderMediaGrid();
      };
      reader.readAsDataURL(file);
    });
  }

  function renderMediaGrid() {
    mediaGrid.innerHTML = '';
    state.mediaLibrary.forEach(url => {
      const item = document.createElement('div');
      item.className = 'media-item';
      item.innerHTML = `
        <img src="${url}" alt="Media">
        <div class="media-overlay"><button class="btn btn-sm btn-outline" style="background:white; border:none;" onclick="deleteMedia('${url}')">Delete</button></div>
      `;
      mediaGrid.appendChild(item);
    });
  }

  window.deleteMedia = (url) => {
    state.mediaLibrary = state.mediaLibrary.filter(u => u !== url);
    // Also remove from any colors that used it
    state.colors.forEach(c => {
      c.images = c.images.filter(imgUrl => imgUrl !== url);
    });
    renderMediaGrid();
    renderColorBlocks();
    updateLivePreview();
  };

  /* ─── Color Management ─── */
  const colorList = document.getElementById('colorList');
  const addColorBtn = document.getElementById('addColorBtn');

  addColorBtn.addEventListener('click', () => {
    const newId = 'c' + Date.now();
    state.colors.push({ id: newId, name: 'New Color', hex: '#cccccc', images: [] });
    renderColorBlocks();
    updateLivePreview();
  });

  function renderColorBlocks() {
    colorList.innerHTML = '';
    state.colors.forEach((color, index) => {
      const block = document.createElement('div');
      block.className = 'color-block';
      block.dataset.colorId = color.id;
      
      const imgsHtml = color.images.map(url => `
        <div class="selected-image-thumb">
          <img src="${url}" alt="thumb">
          <button type="button" class="remove-img" onclick="removeImageFromColor('${color.id}', '${url}')">✖</button>
        </div>
      `).join('');

      block.innerHTML = `
        <div class="color-header">
          <input type="text" class="form-input color-name-input" placeholder="Color Name" value="${color.name}" data-id="${color.id}">
          <input type="color" class="color-picker" value="${color.hex}" data-id="${color.id}">
          ${state.colors.length > 1 ? `<button type="button" class="btn-icon remove-color-btn" onclick="removeColor('${color.id}')" title="Remove Color">×</button>` : ''}
        </div>
        <div class="color-images-area">
          <button type="button" class="btn-select-media" onclick="openMediaModal('${color.id}')">Choose from Media Library</button>
          <div class="selected-images-grid">${imgsHtml}</div>
        </div>
      `;
      colorList.appendChild(block);
    });

    // Reattach listeners
    document.querySelectorAll('.color-name-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const c = state.colors.find(c => c.id === e.target.dataset.id);
        if(c) { c.name = e.target.value; updateLivePreview(); }
      });
    });
    document.querySelectorAll('.color-picker').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const c = state.colors.find(c => c.id === e.target.dataset.id);
        if(c) { c.hex = e.target.value; updateLivePreview(); }
      });
    });
  }

  window.removeColor = (id) => {
    state.colors = state.colors.filter(c => c.id !== id);
    renderColorBlocks();
    updateLivePreview();
  };

  window.removeImageFromColor = (colorId, imgUrl) => {
    const c = state.colors.find(c => c.id === colorId);
    if(c) {
      c.images = c.images.filter(u => u !== imgUrl);
      renderColorBlocks();
      updateLivePreview();
    }
  };

  /* ─── Media Modal logic ─── */
  const modal = document.getElementById('mediaSelectModal');
  const modalMediaGrid = document.getElementById('modalMediaGrid');
  let selectedModalUrls = [];

  window.openMediaModal = (colorId) => {
    state.activeColorIdForMedia = colorId;
    selectedModalUrls = [];
    modal.classList.remove('hidden');
    renderModalGrid();
  };

  document.getElementById('closeMediaModal').addEventListener('click', () => modal.classList.add('hidden'));
  document.getElementById('cancelMediaSelect').addEventListener('click', () => modal.classList.add('hidden'));

  function renderModalGrid() {
    modalMediaGrid.innerHTML = '';
    if(state.mediaLibrary.length === 0) {
      modalMediaGrid.innerHTML = '<p class="help-text" style="grid-column: 1/-1;">No media uploaded yet. Go to Media Library to upload.</p>';
      return;
    }
    state.mediaLibrary.forEach(url => {
      const item = document.createElement('div');
      item.className = 'media-item';
      item.onclick = () => {
        item.classList.toggle('selected');
        if(item.classList.contains('selected')) selectedModalUrls.push(url);
        else selectedModalUrls = selectedModalUrls.filter(u => u !== url);
      };
      item.innerHTML = `<img src="${url}" alt="Media">`;
      modalMediaGrid.appendChild(item);
    });
  }

  document.getElementById('confirmMediaSelect').addEventListener('click', () => {
    // Image Manager flow
    if (state.activeColorIdForMedia === '__imgmgr__' && imgMgrTargetKey && selectedModalUrls.length > 0) {
      const replaced = JSON.parse(localStorage.getItem('vinato_replaced_server_files') || '{}');
      replaced[imgMgrTargetKey] = selectedModalUrls[0];
      localStorage.setItem('vinato_replaced_server_files', JSON.stringify(replaced));
      modal.classList.add('hidden');
      imgMgrTargetKey = null;
      state.activeColorIdForMedia = null;
      renderImageManager();
      showToast('تم استبدال الصورة ✓');
      return;
    }
    // Normal product color flow
    const c = state.colors.find(c => c.id === state.activeColorIdForMedia);
    if(c && selectedModalUrls.length > 0) {
      selectedModalUrls.forEach(url => {
        if(!c.images.includes(url)) c.images.push(url);
      });
      renderColorBlocks();
      updateLivePreview();
    }
    modal.classList.add('hidden');
  });

  const inputs = {
    name: document.getElementById('p_name'),
    cat: { value: '' }, // replaced by p_cat_ar
    gender: document.getElementById('p_gender'),
    price: document.getElementById('p_price'),
    comparePrice: document.getElementById('p_compare_price'),
    badge: document.getElementById('p_badge'),
    p_sort: document.getElementById('p_sort'),
    sizes: document.querySelectorAll('input[name="size"]')
  };

  const prev = {
    name: document.getElementById('prevName'),
    cat: document.getElementById('prevCatLabel'), // UPDATED mapping
    gender: document.getElementById('prevGenderLabel'), // NEW
    price: document.getElementById('prevPrice'),
    comparePrice: document.getElementById('prevComparePrice'), // NEW
    badge: document.getElementById('prevBadge'), // NEW
    sizes: document.getElementById('prevSizes'),
    swatches: document.getElementById('prevSwatches'),
    gallery: document.getElementById('prevGallery'),
    colorLabel: document.getElementById('prevColorLabel')
  };

  // Bind basic inputs (skip 'cat' since it's now a dummy object)
  ['name', 'gender', 'price', 'comparePrice', 'badge'].forEach(key => {
    if (inputs[key] && inputs[key].addEventListener) {
      inputs[key].addEventListener('input', updateLivePreview);
    }
  });
  // Also bind category Arabic input
  const catArElem = document.getElementById('p_cat_ar');
  if (catArElem) catArElem.addEventListener('input', updateLivePreview);
  inputs.sizes.forEach(sz => sz.addEventListener('change', updateLivePreview));

  let activePreviewColorId = null;

  function updateLivePreview() {
    // 1. Basic Info & Pricing
    prev.name.textContent = inputs.name.value || 'اسم المنتج';
    const catArVal = (document.getElementById('p_cat_ar') || {}).value || 'الفئة';
    prev.cat.textContent = catArVal;
    prev.gender.textContent = inputs.gender.value || 'الجنس';
    prev.price.textContent = inputs.price.value ? `$${parseFloat(inputs.price.value).toFixed(2)}` : '$0.00';
    
    // Compare Price
    if (inputs.comparePrice.value && parseFloat(inputs.comparePrice.value) > 0) {
      prev.comparePrice.style.display = 'inline';
      prev.comparePrice.textContent = `$${parseFloat(inputs.comparePrice.value).toFixed(2)}`;
    } else {
      prev.comparePrice.style.display = 'none';
    }

    // Badge
    if (inputs.badge.value.trim() !== '') {
      prev.badge.style.display = 'flex';
      prev.badge.textContent = inputs.badge.value.trim().toUpperCase();
    } else {
      prev.badge.style.display = 'none';
    }

    // 2. Sizes
    const checkedSizes = Array.from(inputs.sizes).filter(s => s.checked).map(s => s.value);
    prev.sizes.innerHTML = checkedSizes.length 
      ? checkedSizes.map(s => `<div class="sp-size-box">${s}</div>`).join('')
      : '<span style="font-size:0.7rem; color:#888;">No sizes selected</span>';

    // 3. Swatches
    if(!activePreviewColorId || !state.colors.find(c => c.id === activePreviewColorId)) {
      activePreviewColorId = state.colors[0]?.id;
    }

    prev.swatches.innerHTML = state.colors.map(c => `
      <div class="sp-swatch ${c.id === activePreviewColorId ? 'active' : ''}" 
           style="background: ${c.hex};" 
           title="${c.name}"
           onclick="changePreviewColor('${c.id}')">
      </div>
    `).join('');

    // 4. Update Gallery & Label for active color
    const activeColor = state.colors.find(c => c.id === activePreviewColorId);
    if(activeColor) {
      prev.colorLabel.textContent = activeColor.name || 'Unnamed';
      if(activeColor.images.length > 0) {
        prev.gallery.innerHTML = `<img src="${activeColor.images[0]}" alt="Preview">`;
      } else {
        prev.gallery.innerHTML = '<div class="sp-placeholder">Add images to see preview</div>';
      }
    }
  }

  window.changePreviewColor = (colorId) => {
    activePreviewColorId = colorId;
    updateLivePreview();
  };

  // Device Toggle (within preview panel)
  const devToggles = document.querySelectorAll('.preview-device-toggle button');
  const devFrame = document.querySelector('.preview-content');
  if (devToggles.length >= 2) {
    devToggles[0].addEventListener('click', () => { devToggles[0].classList.add('active'); devToggles[1].classList.remove('active'); devFrame.style.width = '100%'; });
    devToggles[1].addEventListener('click', () => { devToggles[1].classList.add('active'); devToggles[0].classList.remove('active'); devFrame.style.width = '375px'; devFrame.style.margin = '0 auto'; });
  }

  // Init Form
  renderColorBlocks();
  updateLivePreview();



});

