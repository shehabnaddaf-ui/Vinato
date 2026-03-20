// ═══════════════════════════════════════════════
// VINATO ADMIN DASHBOARD — admin.js
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  /* ─── State Management ─── */
  const state = {
    mediaLibrary: [],
    addColors: [{ id: 'c1', name: 'Black', hex: '#000000', images: [], inventory: null, price_adjustment: 0 }],
    editColors: [],
    activeColorListKey: null,
    activeColorId: null
  };

  const navItems = document.querySelectorAll('.nav-item');
  const viewPanels = document.querySelectorAll('.view-panel');
  window.imgMgrTargetKey = null;

  // Header Inputs (Settings)
  const sInstagramInput = document.getElementById('s_instagram');
  const sPhoneInput = document.getElementById('s_phone');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');

  window.switchView = (viewId) => {
    console.log('Switching view to:', viewId);
    viewPanels.forEach(panel => {
      panel.classList.add('hidden');
      panel.classList.remove('active');
    });
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('active');
    }
    navItems.forEach(item => {
      if (item.dataset.view === viewId) item.classList.add('active');
      else item.classList.remove('active');
    });

    if (viewId === 'server-media-view') renderImageManager();
    if (viewId === 'manage-products-view') renderManageProducts();
    if (viewId === 'media-view') renderMediaGrid();
  };

  // Trigger render when nav item clicked
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const vid = item.dataset.view;
      if (vid) window.switchView(vid);
    });
  });

  // Init view (Standard sync part)
  const queryView = new URLSearchParams(window.location.search).get('view');
  const initialView = queryView || (document.querySelector('.nav-item.active')?.dataset.view) || 'products-view';
  window.switchView(initialView);


  // --- Supabase Storage Helper ---
  async function uploadToSupabase(file, folder = 'products') {
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await window.supabase.storage.from('media').upload(filePath, file);
    if (error) throw error;

    const { data: { publicUrl } } = window.supabase.storage.from('media').getPublicUrl(filePath);
    return publicUrl;
  }

  // --- Translation Logic ---
  async function translateText(text) {
    if (!text || !text.trim()) return text;
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ar|en`;
      const res = await fetch(url);
      const data = await res.json();
      return data.responseStatus === 200 ? data.responseData.translatedText : text;
    } catch (e) {
      console.error('Translation error:', e);
      return text;
    }
  }
  window.translateText = translateText;

  const DEFAULT_SITE_IMAGES = [
    { key: 'hero_bg', label: 'Hero Background', location: 'Homepage → Hero Section', path: '/store/images/optimized/hero_unisex.png.webp', price: 'Premium', name: 'Vintage Hero' },
    { key: 'new_collection', label: 'New Collection', location: 'Homepage → New Collection Section', path: '/store/images/optimized/new_collection.webp', price: '$2,450', name: 'SS26 Showcase' },
    { key: 'best_sellers', label: 'Best Sellers', location: 'Homepage → Best Sellers Section', path: '/store/images/optimized/best_sellers.webp', price: '$1,890', name: 'Bestseller Grid' },
    { key: 'instagram_grid', label: 'Instagram Gallery', location: 'Homepage → Instagram Section', path: '/store/images/optimized/instagram_grid.webp', price: 'Social', name: 'IG Feed Main' },
    { key: 'prod_coat_men', label: "Men's Structured Overcoat", location: 'Shop → Men / Product Page', path: '/store/images/optimized/prod_coat_men.webp', price: '$1,290', name: 'Structured Overcoat' },
    { key: 'prod_dress_silk', label: "Women's Silk Slip Dress", location: 'Shop → Women / Category Section', path: '/store/images/optimized/prod_dress_silk.webp', price: '$950', name: 'Silk Slip Dress' },
    { key: 'prod_knitwear', label: 'Oversized Cashmere Sweater', location: 'Shop → Product Page (Main Image)', path: '/store/images/optimized/prod_knitwear.webp', price: '$780', name: 'Cashmere Sweater' },
    { key: 'prod_trousers', label: 'Tailored Wool Trousers', location: 'Shop → Women / Category Card', path: '/store/images/optimized/prod_trousers.webp', price: '$640', name: 'Wool Trousers' },
    { key: 'hero_bg_editorial', label: 'Editorial Split Image', location: 'Homepage → Editorial Split Section', path: '/store/images/optimized/hero_bg.webp', price: 'Editorial', name: 'Philosophy Cover' },
  ];

  async function getSiteConfig(key, defaultVal) {
    const { data, error } = await window.supabase.from('site_config').select('value').eq('key', key).single();
    if (error || !data) return defaultVal;
    return data.value;
  }

  async function saveSiteConfig(key, value) {
    await window.supabase.from('site_config').upsert({ key, value });
  }

  async function getSiteImages() {
    const config = await getSiteConfig('vinato_site_images_config', DEFAULT_SITE_IMAGES);
    return (config && config.length > 0) ? config : DEFAULT_SITE_IMAGES;
  }

  async function saveSiteImages(config) {
    await saveSiteConfig('vinato_site_images_config', config);
  }

  async function renderImageManager() {
    const list = document.getElementById('imageManagerList');
    if (!list) return;

    const SITE_IMAGES = await getSiteImages();
    const replaced = await getSiteConfig('vinato_replaced_server_files', {});
    list.innerHTML = `<div style="padding:20px; color:#aaa; font-size:0.8rem;">Loading settings...</div>`;

    let html = `
      <div class="form-card" style="padding:20px; margin-bottom:30px;">
        <div style="font-weight:600; margin-bottom:15px; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-plus-circle" style="color:var(--gold);"></i> إضافة صورة جديدة للموقع
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:15px;">
          <input type="text" id="newImgName" class="form-control" placeholder="اسم الصورة/المنتج (مثلاً: رداء صيفي)">
          <input type="text" id="newImgPrice" class="form-control" placeholder="السعر (مثلاً: $1,200)">
          <input type="text" id="newImgLoc" class="form-control" placeholder="الموقع (مثلاً: الصفحة الرئيسية)">
        </div>
        <button class="btn btn-primary" onclick="window.addNewSiteImage()">➕ إضافة للقائمة</button>
      </div>
    `;

    SITE_IMAGES.forEach((img) => {
      const currentUrl = replaced[img.key] || img.path;
      const isReplaced = !!replaced[img.key];

      html += `
        <div class="form-card" style="display:flex; gap:20px; align-items:flex-start; padding:20px; margin-bottom:15px;">
          <div style="flex:0 0 120px; height:120px; background:#111; border-radius:6px; overflow:hidden;">
            <img src="${currentUrl}" alt="${img.label || img.name}" style="width:100%; height:100%; object-fit:cover; display:block;" id="imgPreview_${img.key}">
          </div>
          <div style="flex:1; min-width:0;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
              <div>
                <label style="font-size:0.65rem; color:#888; display:block; margin-bottom:4px;">اسم المنتج/الصورة</label>
                <input type="text" class="form-control" style="font-size:0.85rem; height:32px;" value="${img.name}" 
                       onchange="window.editImageMetadata('${img.key}', 'name', this.value)">
              </div>
              <div>
                <label style="font-size:0.65rem; color:#888; display:block; margin-bottom:4px;">السعر</label>
                <input type="text" class="form-control" style="font-size:0.85rem; height:32px;" value="${img.price}" 
                       onchange="window.editImageMetadata('${img.key}', 'price', this.value)">
              </div>
            </div>
            <div style="font-size:0.72rem; color:#aaa; margin-bottom:12px; line-height:1.4;">
              📍 ${img.location} <br>
              <span style="font-size:0.65rem; color:#666; word-break:break-all;">${img.path}</span>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="btn btn-primary" style="font-size:0.78rem;" onclick="openImgMgrPicker('${img.key}')">
                🖼 استبدال الصورة
              </button>
              ${isReplaced ? `<button class="btn btn-outline" style="font-size:0.75rem;" onclick="resetImage('${img.key}')">♻ Reset Image</button>` : ''}
              <button class="btn btn-outline" style="font-size:0.75rem; color:#ff4d4d; border-color:#ff4d4d;" onclick="window.removeSiteImage('${img.key}')">🗑 حذف</button>
            </div>
          </div>
        </div>
      `;
    });

    list.innerHTML = html;
  }

  window.editImageMetadata = async (key, field, value) => {
    const config = await getSiteImages();
    const item = config.find(i => i.key === key);
    if (item) {
      item[field] = value;
      await saveSiteImages(config);
      showToast('تم تحديث البيانات بنجاح');
    }
  };

  window.addNewSiteImage = async () => {
    const name = document.getElementById('newImgName').value.trim();
    const price = document.getElementById('newImgPrice').value.trim();
    const loc = document.getElementById('newImgLoc').value.trim();

    if (!name) return showToast('يرجى إدخال اسم الصورة', 'error');

    const config = await getSiteImages();
    const key = 'custom_img_' + Date.now();
    config.unshift({
      key,
      name,
      price: price || 'N/A',
      location: loc || 'Showcase Section',
      label: name,
      path: '/store/images/placeholder.webp'
    });

    await saveSiteImages(config);
    await renderImageManager();
    showToast('تمت الإضافة بنجاح');
  };

  window.removeSiteImage = async (key) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;
    const config = (await getSiteImages()).filter(i => i.key !== key);
    await saveSiteImages(config);

    // Also remove any replacement
    const replaced = await getSiteConfig('vinato_replaced_server_files', {});
    delete replaced[key];
    await saveSiteConfig('vinato_replaced_server_files', replaced);

    await renderImageManager();
    showToast('تم الحذف');
  };



  // Trigger render when nav item clicked + manage-products-view
  // Initial data load
  (async function initAdmin() {
    const gallery = await getSiteConfig('vinato_media_gallery', []);
    state.mediaLibrary = gallery;
    await loadSettings();
    if (document.getElementById('manage-products-view').classList.contains('active')) renderManageProducts();
    if (document.getElementById('media-view').classList.contains('active')) renderMediaGrid();
    if (document.getElementById('server-media-view').classList.contains('active')) renderImageManager();
  })();

  // ─── Manage Products Table ───
  let editingProductId = null;

  async function renderManageProducts() {
    const tbody = document.getElementById('manageProductsBody');
    if (!tbody) return;

    const { data: products, error } = await window.supabase.from('products').select('*').order('created_at', { ascending: false });
    tbody.innerHTML = '';

    if (error || !products || products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:#888;">لا توجد منتجات منشورة بعد. اضغط "+ إضافة منتج" للبدء.</td></tr>`;
      return;
    }

    const STATUS_ICONS = { Published: '✅', Draft: '📝', Hidden: '🙈' };
    const PLACEMENT_LABELS = { shop: '🛍', homepage_featured: '⭐', homepage_editorial: '🎨', homepage_bestseller: '🔥' };

    products.forEach(prod => {
      const thumb = (prod.images && prod.images[0]) || '';
      const placements = (prod.placement || ['shop']).map(p => PLACEMENT_LABELS[p] || p).join(' ');
      const statusIcon = STATUS_ICONS[prod.status] || '📝';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><div style="width:50px; height:60px; overflow:hidden; border-radius:4px; background:#111;">
          ${thumb ? `<img src="${thumb}" style="width:100%;height:100%;object-fit:cover;">` : '—'}
        </div></td>
        <td style="font-weight:500;">${prod.name_ar || '—'}</td>
        <td>$${prod.price || '0'}</td>
        <td>${prod.gender || '—'}</td>
        <td style="font-size:1.1rem; letter-spacing:4px;">${placements}</td>
        <td><span class="badge-status ${prod.status === 'Published' ? 'active' : prod.status === 'Hidden' ? 'warning' : ''}"
          style="cursor:pointer;" onclick="cycleStatus('${prod.id}', '${prod.status}')">${statusIcon} ${prod.status || 'Draft'}</span></td>
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

  window.deleteProduct = async (id) => {
    if (!confirm('حذف المنتج نهائياً؟')) return;
    const { error } = await window.supabase.from('products').delete().eq('id', id);
    if (error) return showToast('Error deleting product');
    await renderManageProducts();
    showToast('تم حذف المنتج ✓');
  };

  window.duplicateProduct = async (id) => {
    const { data: orig, error } = await window.supabase.from('products').select('*').eq('id', id).single();
    if (error || !orig) return;

    const copy = { ...orig };
    delete copy.id;
    delete copy.created_at;
    delete copy.updated_at;
    copy.name_ar = 'نسخة - ' + (copy.name_ar || '');
    copy.status = 'Draft';

    const { error: insError } = await window.supabase.from('products').insert(copy);
    if (insError) return showToast('Error duplicating product');

    await renderManageProducts();
    showToast('📄 تم نسخ المنتج ✓');
  };

  window.cycleStatus = async (id, currentStatus) => {
    const cycle = ['Draft', 'Published', 'Hidden'];
    const idx = cycle.indexOf(currentStatus || 'Draft');
    const newStatus = cycle[(idx + 1) % cycle.length];

    const { error } = await window.supabase.from('products').update({ status: newStatus }).eq('id', id);
    if (error) return showToast('Error updating status');

    await renderManageProducts();
    showToast(`الحالة: ${newStatus}`);
  };

  window.openEditProduct = async (id) => {
    const { data: prod, error } = await window.supabase.from('products').select('*').eq('id', id).single();
    if (error || !prod) return;
    editingProductId = id;
    document.getElementById('edit_name').value = prod.name_ar || '';
    document.getElementById('edit_price').value = prod.price || '';
    document.getElementById('edit_compare_price').value = prod.compare_price || '';
    document.getElementById('edit_status').value = prod.status || 'Draft';
    // Populate Colors
    state.editColors = prod.colors || [{ id: 'c1', name: 'Original', hex: '#000000', images: prod.images || [], inventory: null, price_adjustment: 0 }];
    renderColorBlocks('editColorList', 'editColors');

    document.getElementById('editProductForm').style.display = 'block';
    document.getElementById('editProductForm').scrollIntoView({ behavior: 'smooth' });
  };

  document.getElementById('saveEditBtn')?.addEventListener('click', async () => {
    if (!editingProductId) return;
    const nameAr = document.getElementById('edit_name').value.trim();
    const price = document.getElementById('edit_price').value;
    const compare = document.getElementById('edit_compare_price').value;
    const status = document.getElementById('edit_status').value;

    const colorBlocks = Array.from(document.querySelectorAll('#editColorList .color-block'));
    const updatedColors = colorBlocks.map(block => {
      const id = block.dataset.colorId;
      const name = block.querySelector('.color-name-input').value;
      const hex = block.querySelector('.color-picker').value;
      const existing = state.editColors.find(c => c.id === id) || {};
      return {
        id,
        name,
        hex,
        images: existing.images || [],
        inventory: existing.inventory || null,
        price_adjustment: existing.price_adjustment || 0
      };
    });

    const aggregatedImages = [];
    updatedColors.forEach(c => {
      (c.images || []).forEach(img => {
        if (!aggregatedImages.includes(img)) aggregatedImages.push(img);
      });
    });

    const { error } = await window.supabase.from('products').update({
      name_ar: nameAr,
      name_en: nameAr,
      price: price,
      compare_price: compare,
      status: status,
      badge: document.getElementById('edit_badge')?.value.trim() || '',
      sort: parseInt(document.getElementById('edit_sort')?.value) || 0,
      colors: updatedColors,
      images: aggregatedImages
    }).eq('id', editingProductId);

    if (error) return showToast('Error saving edits');

    editingProductId = null;
    document.getElementById('editProductForm').style.display = 'none';
    await renderManageProducts();
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

  async function saveCurrentProduct() {
    const nameAr = previewInputs.name.value.trim();
    const descAr = (document.getElementById('p_description') || {}).value?.trim() || '';
    const catSelect = previewInputs.catAr;
    const catSlug = catSelect ? catSelect.value.trim() : '';

    if (!nameAr || state.addColors.every(c => c.images.length === 0)) {
      showToast('يرجى إدخال اسم المنتج وصورة واحدة على الأقل.');
      return;
    }

    showToast('⏳ جاري رفع الصور والترجمة...');

    // 1. Upload images to Supabase Storage
    const allImageUrls = [];
    try {
      for (const color of state.addColors) {
        for (const imgData of color.images) {
          if (imgData.startsWith('data:image')) {
            const blob = await fetch(imgData).then(r => r.blob());
            const file = new File([blob], "prod.webp", { type: 'image/webp' });
            const url = await uploadToSupabase(file, 'products');
            allImageUrls.push(url);
          } else {
            allImageUrls.push(imgData);
          }
        }
      }
    } catch (err) {
      console.error(err);
      return showToast('فشل في رفع الصور', 'error');
    }

    const [nameEn, descEn] = await Promise.all([
      translateText(nameAr),
      translateText(descAr)
    ]);

    // 3. Prepare data for Supabase
    const colorBlocks = Array.from(document.querySelectorAll('.color-block'));
    const updatedColors = colorBlocks.map(block => {
      const id = block.dataset.colorId;
      const name = block.querySelector('.color-name-input').value;
      const hex = block.querySelector('.color-picker').value;
      const existing = state.addColors.find(c => c.id === id) || {};
      return {
        id,
        name,
        hex,
        images: existing.images || [],
        inventory: existing.inventory || null, // Future-proof
        price_adjustment: existing.price_adjustment || 0 // Future-proof
      };
    });

    // Determine the main images array: 
    // Aggregate all specific images, but ensure the first one is from the first color
    const aggregatedImages = [];
    updatedColors.forEach(c => {
      c.images.forEach(img => {
        if (!aggregatedImages.includes(img)) aggregatedImages.push(img);
      });
    });

    const product = {
      name_ar: nameAr,
      name_en: nameEn || nameAr,
      description_ar: descAr,
      description_en: descEn || descAr,
      category: catSlug,
      gender: previewInputs.gender.value,
      price: parseFloat(previewInputs.price.value) || 0,
      compare_price: parseFloat(previewInputs.comparePrice.value) || 0,
      status: document.getElementById('p_status').value,
      placement: [
        'shop',
        ...(document.getElementById('place_featured')?.checked ? ['homepage_featured'] : []),
        ...(document.getElementById('place_editorial')?.checked ? ['homepage_editorial'] : []),
        ...(document.getElementById('place_bestseller')?.checked ? ['homepage_bestseller'] : [])
      ],
      images: aggregatedImages,
      colors: updatedColors,
      sizes: Array.from(document.querySelectorAll('input[name="size"]:checked')).map(s => s.value),
      badge: previewInputs.badge.value.trim(),
      sort: parseInt(previewInputs.p_sort.value) || 0
    };

    const { error: dbError } = await window.supabase.from('products').insert(product);

    if (dbError) {
      console.error(dbError);
      showToast('❌ خطأ في حفظ البيانات: ' + dbError.message);
    } else {
      showToast('✅ تم نشر المنتج بنجاح!');
      setTimeout(() => window.location.reload(), 2000);
    }
  }

  const placeholderBtnIds = ['saveDraftBtn', 'saveSettingsBtn'];
  placeholderBtnIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
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
  async function loadSettings() {
    const { data, error } = await window.supabase.from('store_settings').select('*').eq('id', 1).single();
    if (error || !data) return;

    if (sInstagramInput) sInstagramInput.value = data.instagram || '';
    if (sPhoneInput) sPhoneInput.value = data.phone || '';
    if (document.getElementById('s_whatsapp')) document.getElementById('s_whatsapp').value = data.whatsapp || '';
  }

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const newInsta = sInstagramInput.value.trim();
      const newPhone = sPhoneInput.value.trim();
      const newWA = document.getElementById('s_whatsapp')?.value.trim() || '';

      const { error } = await window.supabase.from('store_settings').upsert({
        id: 1,
        instagram: newInsta,
        phone: newPhone,
        whatsapp: newWA
      });

      if (error) return showToast('Error saving settings');
      showToast('تم حفظ الإعدادات بنجاح ✓');
    });
  }

  const productForm = document.getElementById('productForm');
  if (productForm) {
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
  fileInput.addEventListener('change', function () { handleFiles(this.files); });

  async function handleFiles(files) {
    showToast('⏳ جاري رفع الملفات...');
    const gallery = await getSiteConfig('vinato_media_gallery', []);

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const url = await uploadToSupabase(file, 'gallery');
        gallery.unshift(url);
      } catch (err) {
        console.error(err);
        showToast('Error uploading file');
      }
    }

    await saveSiteConfig('vinato_media_gallery', gallery);
    await renderMediaGrid();
    showToast('تم الرفع بنجاح');
  }

  async function renderMediaGrid() {
    if (!mediaGrid) return;
    const gallery = await getSiteConfig('vinato_media_gallery', []);
    state.mediaLibrary = gallery; // Sync state for color picker
    mediaGrid.innerHTML = '';
    gallery.forEach(url => {
      const item = document.createElement('div');
      item.className = 'media-item';
      item.innerHTML = `
        <img src="${url}" style="width:100%; height:100%; object-fit:cover;">
        <div class="media-overlay">
          <button class="btn btn-outline" style="font-size:0.7rem; padding:4px 8px;" onclick="window.copyToClipboard('${url}')">Copy URL</button>
          <button class="btn btn-outline" style="font-size:0.7rem; padding:4px 8px; color:#ff4d4d; border-color:#ff4d4d;" onclick="window.deleteMedia('${url}')">Delete</button>
        </div>
      `;
      item.onclick = (e) => {
        if (e.target.tagName !== 'BUTTON') {
          // Select for picker if active
          if (imgMgrTargetKey) {
            window.replaceImageWith(url);
          }
        }
      };
      mediaGrid.appendChild(item);
    });
  }

  /* ─── Color Management ─── */
  function renderColorBlocks(containerId, colorListKey) {
    const list = document.getElementById(containerId);
    if (!list) return;
    const colors = state[colorListKey];
    list.innerHTML = '';
    colors.forEach((color) => {
      const block = document.createElement('div');
      block.className = 'color-block';
      block.dataset.colorId = color.id;

      const imgsHtml = (color.images || []).map(url => `
        <div class="selected-image-thumb">
          <img src="${url}" alt="thumb">
          <button type="button" class="remove-img" onclick="window.removeImageFromColor('${colorListKey}', '${color.id}', '${url}')">✖</button>
        </div>
      `).join('');

      block.innerHTML = `
        <div class="color-header">
          <input type="text" class="form-input color-name-input" placeholder="Color Name" value="${color.name}" data-id="${color.id}">
          <input type="color" class="color-picker" value="${color.hex}" data-id="${color.id}">
          ${colors.length > 1 ? `<button type="button" class="btn-icon remove-color-btn" onclick="window.removeColor('${colorListKey}', '${color.id}')" title="Remove Color">×</button>` : ''}
        </div>
        <div class="color-images-area">
          <button type="button" class="btn-select-media" onclick="window.openMediaModal('${colorListKey}', '${color.id}')">Choose from Media Library</button>
          <div class="selected-images-grid">${imgsHtml}</div>
        </div>
      `;
      list.appendChild(block);
    });

    // Reattach listeners
    list.querySelectorAll('.color-name-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const c = state[colorListKey].find(c => c.id === e.target.dataset.id);
        if (c) { c.name = e.target.value; updateLivePreview(); }
      });
    });
    list.querySelectorAll('.color-picker').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const c = state[colorListKey].find(c => c.id === e.target.dataset.id);
        if (c) { c.hex = e.target.value; updateLivePreview(); }
      });
    });
  }

  // Hook up Add buttons
  document.getElementById('addColorBtn')?.addEventListener('click', () => {
    const newId = 'c' + Date.now();
    state.addColors.push({ id: newId, name: 'New Color', hex: '#cccccc', images: [], inventory: null, price_adjustment: 0 });
    renderColorBlocks('colorList', 'addColors');
    updateLivePreview();
  });

  document.getElementById('addEditColorBtn')?.addEventListener('click', () => {
    const newId = 'c' + Date.now();
    state.editColors.push({ id: newId, name: 'New Color', hex: '#cccccc', images: [], inventory: null, price_adjustment: 0 });
    renderColorBlocks('editColorList', 'editColors');
  });

  window.removeColor = (colorListKey, id) => {
    state[colorListKey] = state[colorListKey].filter(c => c.id !== id);
    const containerId = colorListKey === 'addColors' ? 'colorList' : 'editColorList';
    renderColorBlocks(containerId, colorListKey);
    updateLivePreview();
  };

  window.removeImageFromColor = (colorListKey, colorId, imgUrl) => {
    const c = state[colorListKey].find(c => c.id === colorId);
    if (c) {
      c.images = c.images.filter(u => u !== imgUrl);
      const containerId = colorListKey === 'addColors' ? 'colorList' : 'editColorList';
      renderColorBlocks(containerId, colorListKey);
      updateLivePreview();
    }
  };

  /* ─── Media Modal logic ─── */
  const modal = document.getElementById('mediaSelectModal');
  const modalMediaGrid = document.getElementById('modalMediaGrid');
  let selectedModalUrls = [];

  window.openMediaModal = (colorListKey, colorId) => {
    const m = document.getElementById('mediaSelectModal');
    if (!m) return console.error('Modal not found');
    state.activeColorListKey = colorListKey;
    state.activeColorId = colorId;
    selectedModalUrls = [];
    m.classList.remove('hidden');
    renderModalGrid();
  };

  document.getElementById('closeMediaModal')?.addEventListener('click', () => document.getElementById('mediaSelectModal')?.classList.add('hidden'));
  document.getElementById('cancelMediaSelect')?.addEventListener('click', () => document.getElementById('mediaSelectModal')?.classList.add('hidden'));

  function renderModalGrid() {
    modalMediaGrid.innerHTML = '';
    if (state.mediaLibrary.length === 0) {
      modalMediaGrid.innerHTML = '<p class="help-text" style="grid-column: 1/-1;">No media uploaded yet. Go to Media Library to upload.</p>';
      return;
    }
    state.mediaLibrary.forEach(url => {
      const item = document.createElement('div');
      item.className = 'media-item';
      item.onclick = () => {
        item.classList.toggle('selected');
        if (item.classList.contains('selected')) selectedModalUrls.push(url);
        else selectedModalUrls = selectedModalUrls.filter(u => u !== url);
      };
      item.innerHTML = `<img src="${url}" alt="Media">`;
      modalMediaGrid.appendChild(item);
    });
  }

  document.getElementById('confirmMediaSelect')?.addEventListener('click', () => {
    const m = document.getElementById('mediaSelectModal');
    // Image Manager flow
    if (state.activeColorIdForMedia === '__imgmgr__' && window.imgMgrTargetKey && selectedModalUrls.length > 0) {
      window.replaceImageWith(selectedModalUrls[0]);
      m?.classList.add('hidden');
      return;
    }
    // Color Mapping flow
    if (state.activeColorListKey && state.activeColorId) {
      const list = state[state.activeColorListKey];
      const color = list.find(c => c.id === state.activeColorId);
      if (color) {
        selectedModalUrls.forEach(url => {
          if (!color.images.includes(url)) color.images.push(url);
        });
        const containerId = state.activeColorListKey === 'addColors' ? 'colorList' : 'editColorList';
        renderColorBlocks(containerId, state.activeColorListKey);
      }
      m.classList.add('hidden');
      updateLivePreview();
    }
  });

  // ─── Live Preview Logic ───
  const previewInputs = {
    name: document.getElementById('p_name'),
    catAr: document.getElementById('p_cat_ar'),
    gender: document.getElementById('p_gender'),
    price: document.getElementById('p_price'),
    comparePrice: document.getElementById('p_compare_price'),
    badge: document.getElementById('p_badge'),
    p_sort: document.getElementById('p_sort'),
    sizes: document.querySelectorAll('input[name="size"]')
  };

  const prevRefs = {
    name: document.getElementById('prevName'),
    nameEn: document.getElementById('prevNameEn'),
    cat: document.getElementById('prevCatLabel'),
    gender: document.getElementById('prevGenderLabel'),
    price: document.getElementById('prevPrice'),
    comparePrice: document.getElementById('prevComparePrice'),
    badge: document.getElementById('prevBadge'),
    sizes: document.getElementById('prevSizes'),
    swatches: document.getElementById('prevSwatches'),
    gallery: document.getElementById('prevGallery'),
    colorLabel: document.getElementById('prevColorLabel')
  };

  function updateLivePreview() {
    if (!prevRefs.name) return;
    const nameAr = previewInputs.name.value || 'اسم المنتج';
    prevRefs.name.textContent = nameAr;

    // Auto-translation for preview (Debounced via some mechanism, or just show it)
    clearTimeout(window.previewTranslateTimeout);
    window.previewTranslateTimeout = setTimeout(async () => {
      if (nameAr && nameAr !== 'اسم المنتج') {
        const translated = await translateText(nameAr);
        if (prevRefs.nameEn) prevRefs.nameEn.textContent = translated;
      }
    }, 1000);

    // Get category label from select
    let catLabel = 'الفئة';
    if (previewInputs.catAr.selectedIndex >= 0) {
      catLabel = previewInputs.catAr.options[previewInputs.catAr.selectedIndex].text.split(' — ')[0];
    }
    prevRefs.cat.textContent = catLabel.toUpperCase();
    prevRefs.gender.textContent = previewInputs.gender.value || 'الجنس';

    // Price
    const price = parseFloat(previewInputs.price.value) || 0;
    prevRefs.price.textContent = `$${price.toFixed(2)}`;

    // Compare Price
    const compPrice = parseFloat(previewInputs.comparePrice.value) || 0;
    if (compPrice > price) {
      prevRefs.comparePrice.style.display = 'inline';
      prevRefs.comparePrice.textContent = `$${compPrice.toFixed(2)}`;
    } else {
      prevRefs.comparePrice.style.display = 'none';
    }

    // Badge
    const badgeText = previewInputs.badge.value.trim();
    if (badgeText) {
      prevRefs.badge.style.display = 'flex';
      prevRefs.badge.textContent = badgeText.toUpperCase();
    } else {
      prevRefs.badge.style.display = 'none';
    }

    // Sizes
    const checkedSizes = Array.from(document.querySelectorAll('input[name="size"]:checked')).map(s => s.value);
    prevRefs.sizes.innerHTML = checkedSizes.length
      ? checkedSizes.map(s => `<div class="sp-size-box">${s}</div>`).join('')
      : '<span style="font-size:0.7rem; color:#888;">No sizes selected</span>';

    // Swatches & Gallery
    const colors = state.addColors;
    if (!activePreviewColorId || !colors.find(c => c.id === activePreviewColorId)) {
      activePreviewColorId = colors[0]?.id;
    }

    prevRefs.swatches.innerHTML = colors.map(c => `
      <div class="sp-swatch ${c.id === activePreviewColorId ? 'active' : ''}" 
           style="background: ${c.hex};" 
           title="${c.name}"
           onclick="window.changePreviewColor('${c.id}')">
      </div>
    `).join('');

    const activeColor = colors.find(c => c.id === activePreviewColorId);
    if (activeColor) {
      prevRefs.colorLabel.textContent = activeColor.name || 'Unnamed';
      if (activeColor.images && activeColor.images.length > 0) {
        prevRefs.gallery.innerHTML = `<img src="${activeColor.images[0]}" alt="Preview">`;
      } else {
        prevRefs.gallery.innerHTML = '<div class="sp-placeholder">Add images to see preview</div>';
      }
    }
  }

  function updateSizeOptions() {
    const catVal = previewInputs.catAr.value;
    const sizesGrid = document.getElementById('sizesGrid');
    if (!sizesGrid) return;

    let sizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
    if (catVal === 'shoes') {
      sizes = ['38', '39', '40', '41', '42', '43', '44', '45'];
    }

    sizesGrid.innerHTML = sizes.map(s => `
      <label class="checkbox-label"><input type="checkbox" name="size" value="${s}"><span class="checkmark"></span>${s}</label>
    `).join('');

    // Re-attach event listeners to new checkboxes
    document.querySelectorAll('input[name="size"]').forEach(sz => {
      sz.addEventListener('change', updateLivePreview);
    });

    updateLivePreview();
  }

  // Bind Listeners
  ['name', 'catAr', 'gender', 'price', 'comparePrice', 'badge', 'p_sort'].forEach(key => {
    previewInputs[key]?.addEventListener('input', updateLivePreview);
  });

  previewInputs.catAr?.addEventListener('change', updateSizeOptions);

  document.querySelectorAll('input[name="size"]').forEach(sz => {
    sz.addEventListener('change', updateLivePreview);
  });

  let activePreviewColorId = null;

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

  // --- Image Manager Picker Logic ---
  window.openImgMgrPicker = (key) => {
    imgMgrTargetKey = key;
    switchView('media-view');
    showToast('اختر صورة من المكتبة للاستبدال');
  };

  window.replaceImageWith = async (url) => {
    if (!imgMgrTargetKey) return;
    const replaced = await getSiteConfig('vinato_replaced_server_files', {});
    replaced[imgMgrTargetKey] = url;
    await saveSiteConfig('vinato_replaced_server_files', replaced);

    imgMgrTargetKey = null;
    switchView('image-manager-view');
    await renderImageManager();
    showToast('تم استبدال الصورة بنجاح ✓');
  };

  window.resetImage = async (key) => {
    const replaced = await getSiteConfig('vinato_replaced_server_files', {});
    delete replaced[key];
    await saveSiteConfig('vinato_replaced_server_files', replaced);
    await renderImageManager();
    showToast('تمت استعادة الصورة الأصلية');
  };

  // Final Async Init
  (async () => {
    try {
      // Basic UI init
      renderColorBlocks('colorList', 'addColors');
      updateLivePreview();

      // Async Data load
      await Promise.all([
        loadSettings(),
        renderManageProducts(),
        renderImageManager(),
        renderMediaGrid()
      ]);
    } catch (e) {
      console.error("Initialization failed", e);
    }
  })();
});

