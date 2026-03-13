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
    activeColorIdForMedia: null
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

  const placeholderBtnIds = ['saveDraftBtn', 'publishBtn', 'saveSettingsBtn'];
  placeholderBtnIds.forEach(id => {
    const btn = document.getElementById(id);
    if(btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Action successful (Supabase sync pending)');
      });
    }
  });

  document.querySelectorAll('.toast-btn, .sp-add-btn, .sp-size-guide').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Action successful (Supabase sync pending)');
    });
  });

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
      const url = URL.createObjectURL(file);
      state.mediaLibrary.push(url);
      renderMediaGrid();
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
    cat: document.getElementById('p_cat'),
    gender: document.getElementById('p_gender'), // NEW
    price: document.getElementById('p_price'),
    comparePrice: document.getElementById('p_compare_price'), // NEW
    badge: document.getElementById('p_badge'), // NEW
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

  // Bind basic inputs
  ['name', 'cat', 'gender', 'price', 'comparePrice', 'badge'].forEach(key => {
    inputs[key].addEventListener('input', updateLivePreview);
  });
  inputs.sizes.forEach(sz => sz.addEventListener('change', updateLivePreview));

  let activePreviewColorId = null;

  function updateLivePreview() {
    // 1. Basic Info & Pricing
    prev.name.textContent = inputs.name.value || 'Product Name';
    prev.cat.textContent = inputs.cat.value || 'Category';
    prev.gender.textContent = inputs.gender.value || 'Gender';
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
