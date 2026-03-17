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

  /* ─── Server Media Management (Simulated) ─── */
  const serverMediaList = [
    { name: 'best_sellers.png', path: '../store/images/best_sellers.png' },
    { name: 'instagram_grid.png', path: '../store/images/instagram_grid.png' },
    { name: 'new_collection.png', path: '../store/images/new_collection.png' },
    { name: 'prod_coat_men.png', path: '../store/images/prod_coat_men.png' },
    { name: 'prod_dress_silk.png', path: '../store/images/prod_dress_silk.png' },
    { name: 'prod_knitwear.png', path: '../store/images/prod_knitwear.png' },
    { name: 'prod_trousers.png', path: '../store/images/prod_trousers.png' }
  ];

  function renderServerMediaTable() {
    const tableBody = document.getElementById('serverMediaTableBody');
    if (!tableBody) return;

    const hiddenFiles = JSON.parse(localStorage.getItem('vinato_hidden_server_files') || '[]');
    const replacedFiles = JSON.parse(localStorage.getItem('vinato_replaced_server_files') || '{}');

    tableBody.innerHTML = '';

    serverMediaList.forEach(file => {
      if (hiddenFiles.includes(file.name)) return;

      const displayPath = replacedFiles[file.name] || file.path;
      const isReplaced = !!replacedFiles[file.name];

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><div class="media-thumb-sm"><img src="${displayPath}" alt="${file.name}"></div></td>
        <td>
          <div style="font-weight:500;">${file.name}</div>
          <div style="font-size:0.75rem; color:#888;">${file.path}</div>
        </td>
        <td><span class="badge-status ${isReplaced ? 'warning' : 'active'}">${isReplaced ? 'Replaced' : 'Original'}</span></td>
        <td>
          <button class="btn-icon" onclick="editServerImage('${file.name}')" title="Edit/Replace">✎</button>
          <button class="btn-icon" onclick="deleteServerImage('${file.name}')" title="Delete">×</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  window.deleteServerImage = (name) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will hide it from the storage manager.`)) return;
    const hiddenFiles = JSON.parse(localStorage.getItem('vinato_hidden_server_files') || '[]');
    hiddenFiles.push(name);
    localStorage.setItem('vinato_hidden_server_files', JSON.stringify(hiddenFiles));
    renderServerMediaTable();
    showToast(`${name} deleted (hidden).`);
  };

  window.editServerImage = (name) => {
    // Simulated editing: ask for a new URL or Base64
    const newUrl = prompt(`Enter new URL or Base64 for ${name}:`);
    if (newUrl) {
      const replacedFiles = JSON.parse(localStorage.getItem('vinato_replaced_server_files') || '{}');
      replacedFiles[name] = newUrl;
      localStorage.setItem('vinato_replaced_server_files', JSON.stringify(replacedFiles));
      renderServerMediaTable();
      showToast(`${name} updated.`);
    }
  };

  // Switch to server media view should trigger render
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (item.dataset.view === 'server-media-view') renderServerMediaTable();
    });
  });

  // Also render if it's the default view (unlikely but safe)
  if (currentActive && currentActive.dataset.view === 'server-media-view') {
    renderServerMediaTable();
  }

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
      // Arabic originals
      name_ar: nameAr,
      name: nameAr, // fallback
      description_ar: descAr,
      cat_ar: catAr,
      cat: catAr || 'General', // fallback
      // English (filled after translation)
      name_en: nameAr,
      description_en: descAr,
      cat_en: catAr,
      gender: inputs.gender.value,
      price: inputs.price.value,
      comparePrice: inputs.comparePrice.value,
      badge: inputs.badge.value.trim(),
      sort: inputs.p_sort.value || 1,
      featured: document.getElementById('p_featured').checked,
      status: document.getElementById('p_status').value,
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
    const c = state.colors.find(c => c.id === state.activeColorIdForMedia);
    if(c && selectedModalUrls.length > 0) {
      // Add unique urls
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

  // ═══════════════════════════════════════════════
  // IMAGE MANAGER — File System Access API
  // ═══════════════════════════════════════════════
  (function initImageManager() {
    const openBtn = document.getElementById('openImageFolderBtn');
    const grid    = document.getElementById('imageManagerGrid');
    const stats   = document.getElementById('imgMgrStats');
    const countEl = document.getElementById('imgMgrCount');
    const sizeEl  = document.getElementById('imgMgrSize');

    if (!openBtn) return;

    let rootDirHandle = null;

    const IMAGE_EXTS = ['jpg','jpeg','png','webp','gif','svg','avif'];

    function isImage(name) {
      const ext = name.split('.').pop().toLowerCase();
      return IMAGE_EXTS.includes(ext);
    }

    function formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    async function loadDirectory(dirHandle, parentPath) {
      const entries = [];
      for await (const [name, handle] of dirHandle) {
        if (handle.kind === 'file' && isImage(name)) {
          const file = await handle.getFile();
          entries.push({ name, handle, file, path: parentPath + '/' + name, dirHandle });
        } else if (handle.kind === 'directory') {
          const sub = await loadDirectory(handle, parentPath + '/' + name);
          entries.push(...sub);
        }
      }
      return entries;
    }

    function renderGrid(entries) {
      grid.innerHTML = '';

      if (entries.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted)">لا توجد صور في هذا المجلد</div>';
        return;
      }

      let totalSize = 0;
      entries.forEach(entry => { totalSize += entry.file.size; });

      // Stats
      stats.style.display = 'block';
      countEl.textContent = entries.length + ' صورة';
      sizeEl.textContent  = formatSize(totalSize);

      entries.forEach(entry => {
        const url  = URL.createObjectURL(entry.file);
        const card = document.createElement('div');
        card.style.cssText = `
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          transition: box-shadow 0.2s;
        `;
        card.innerHTML = `
          <div style="position:relative;aspect-ratio:1;overflow:hidden;background:#111">
            <img src="${url}" alt="${entry.name}" 
                 style="width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.3s"
                 onmouseover="this.style.transform='scale(1.05)'" 
                 onmouseout="this.style.transform='scale(1)'">
          </div>
          <div style="padding:8px 10px;">
            <div style="font-size:0.7rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px" title="${entry.path}">
              ${entry.name}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:0.65rem;color:var(--text-muted)">${formatSize(entry.file.size)}</span>
              <button class="btn-icon" title="حذف الصورة" style="color:#e55;font-size:1.1rem;line-height:1;padding:2px 6px" 
                      onclick="this.closest('[data-img-name]').remove(); ">🗑</button>
            </div>
          </div>
        `;
        card.setAttribute('data-img-name', entry.name);

        // delete button
        const delBtn = card.querySelector('button');
        delBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (!confirm(`حذف الصورة "${entry.name}"؟\nهذا الإجراء لا يمكن التراجع عنه.`)) return;
          try {
            await entry.dirHandle.removeEntry(entry.name);
            URL.revokeObjectURL(url);
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8)';
            card.style.transition = 'all 0.3s ease';
            setTimeout(() => {
              card.remove();
              // Update count
              const remaining = grid.querySelectorAll('[data-img-name]').length;
              countEl.textContent = remaining + ' صورة';
              if (remaining === 0) {
                grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted)">تم حذف جميع الصور</div>';
              }
            }, 300);
            showToast('تم حذف ' + entry.name + ' ✓');
          } catch(err) {
            console.error(err);
            showToast('فشل الحذف — تأكد من الصلاحيات');
          }
        });

        grid.appendChild(card);
      });
    }

    openBtn.addEventListener('click', async () => {
      if (!window.showDirectoryPicker) {
        alert('متصفحك لا يدعم هذه الميزة.\nاستخدم Chrome أو Edge.');
        return;
      }
      try {
        showToast('جارٍ فتح المجلد...');
        rootDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
        showToast('جارٍ تحميل الصور...');
        const entries = await loadDirectory(rootDirHandle, rootDirHandle.name);
        renderGrid(entries);
        showToast('تم تحميل ' + entries.length + ' صورة ✓');
      } catch(err) {
        if (err.name !== 'AbortError') {
          console.error(err);
          showToast('حدث خطأ: ' + err.message);
        }
      }
    });
  })();

});

