document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const qrForm = document.getElementById('qr-form');
  const urlInput = document.getElementById('url-input');
  const clearInputBtn = document.getElementById('clear-input');
  const generateBtn = document.getElementById('generate-btn');
  
  // Customization Elements
  const accordionToggle = document.getElementById('accordion-toggle');
  const accordion = accordionToggle.parentElement;
  const fgColorInput = document.getElementById('fg-color');
  const fgColorHex = document.getElementById('fg-color-hex');
  const bgColorInput = document.getElementById('bg-color');
  const bgColorHex = document.getElementById('bg-color-hex');
  const marginInput = document.getElementById('margin-input');
  const ecLevelSelect = document.getElementById('ec-level');
  
  // Preview Elements
  const qrPlaceholder = document.getElementById('qr-placeholder');
  const qrSpinner = document.getElementById('qr-spinner');
  const qrPreview = document.getElementById('qr-preview');
  const previewActions = document.getElementById('preview-actions');
  const downloadPngBtn = document.getElementById('download-png');
  const downloadSvgBtn = document.getElementById('download-svg');
  const shareBtn = document.getElementById('share-btn');
  
  // History Elements
  const historyList = document.getElementById('history-list');
  const clearHistoryBtn = document.getElementById('clear-history');
  
  // Canvas for conversion
  const canvas = document.getElementById('conversion-canvas');
  const ctx = canvas.getContext('2d');

  // Application State
  let currentSvgData = '';
  let currentUrl = '';
  let history = JSON.parse(localStorage.getItem('qr_history')) || [];

  // Initialize App
  init();

  function init() {
    renderHistory();
    setupEventListeners();
    updateInputButtonVisibility();
  }

  function setupEventListeners() {
    // Form Submit
    qrForm.addEventListener('submit', handleFormSubmit);

    // Clear Input Button
    urlInput.addEventListener('input', updateInputButtonVisibility);
    clearInputBtn.addEventListener('click', () => {
      urlInput.value = '';
      urlInput.focus();
      updateInputButtonVisibility();
    });

    // Customization Accordion
    accordionToggle.addEventListener('click', () => {
      accordion.classList.toggle('active');
    });

    // Color Pickers (Real-time updates)
    fgColorInput.addEventListener('input', (e) => {
      const color = e.target.value;
      fgColorHex.textContent = color.toUpperCase();
      document.documentElement.style.setProperty('--qr-fg-color', color);
    });

    bgColorInput.addEventListener('input', (e) => {
      const color = e.target.value;
      bgColorHex.textContent = color.toUpperCase();
      document.documentElement.style.setProperty('--qr-bg-color', color);
    });

    // Downloads
    downloadSvgBtn.addEventListener('click', downloadSVG);
    downloadPngBtn.addEventListener('click', downloadPNG);
    shareBtn.addEventListener('click', copyToClipboard);

    // History Clear
    clearHistoryBtn.addEventListener('click', clearAllHistory);
  }

  // Toggle clear button inside URL input
  function updateInputButtonVisibility() {
    if (urlInput.value.length > 0) {
      clearInputBtn.style.display = 'block';
    } else {
      clearInputBtn.style.display = 'none';
    }
  }

  // Handle QR Generation Request
  async function handleFormSubmit(e) {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    // Show loading state
    setLoadingState(true);
    currentUrl = url;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          margin: marginInput.value,
          ecLevel: ecLevelSelect.value,
          format: 'svg' // Request SVG for client-side styling & sharp rendering
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR Code');
      }

      const result = await response.json();
      currentSvgData = result.data;

      // Render QR code
      displayQRCode(currentSvgData);

      // Save to history
      saveToHistory({
        id: Date.now().toString(),
        url: url,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        fgColor: fgColorInput.value,
        bgColor: bgColorInput.value,
        svgData: currentSvgData,
        margin: marginInput.value,
        ecLevel: ecLevelSelect.value
      });

    } catch (error) {
      console.error(error);
      alert('Error generating QR code. Please try again.');
      setLoadingState(false);
    }
  }

  function setLoadingState(isLoading) {
    if (isLoading) {
      qrPlaceholder.classList.add('hidden');
      qrPreview.classList.add('hidden');
      previewActions.classList.add('hidden');
      qrSpinner.classList.remove('hidden');
      generateBtn.disabled = true;
      generateBtn.querySelector('span').textContent = 'Generating...';
    } else {
      qrSpinner.classList.add('hidden');
      generateBtn.disabled = false;
      generateBtn.querySelector('span').textContent = 'Generate QR Code';
    }
  }

  function displayQRCode(svgString) {
    // Set colors in CSS custom properties
    document.documentElement.style.setProperty('--qr-fg-color', fgColorInput.value);
    document.documentElement.style.setProperty('--qr-bg-color', bgColorInput.value);

    // Insert SVG into DOM
    qrPreview.innerHTML = svgString;
    
    // Show preview elements
    setLoadingState(false);
    qrPreview.classList.remove('hidden');
    previewActions.classList.remove('hidden');
  }

  // ==========================================
  // DOWNLOADS & SHARING
  // ==========================================

  // Returns stylized SVG string with custom colors embedded
  function getStylizedSvgString() {
    const parser = new DOMParser();
    const doc = parser.parseFromString(currentSvgData, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    const pathEl = doc.querySelector('path');
    
    const fgColor = fgColorInput.value;
    const bgColor = bgColorInput.value;

    // Apply dimensions and background
    svgEl.setAttribute('width', '500');
    svgEl.setAttribute('height', '500');
    svgEl.style.backgroundColor = bgColor;

    // Create background rect inside SVG
    const rect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', bgColor);
    
    // Insert rect before path
    svgEl.insertBefore(rect, pathEl);

    // Set path color
    pathEl.setAttribute('fill', fgColor);

    return new XMLSerializer().serializeToString(doc);
  }

  function downloadSVG() {
    const svgString = getStylizedSvgString();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `qrcraft-${sanitizeFilename(currentUrl)}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function downloadPNG() {
    const svgString = getStylizedSvgString();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.src = blobUrl;
    
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = 1000;
      canvas.height = 1000;
      
      // Draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Trigger download
      try {
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `qrcraft-${sanitizeFilename(currentUrl)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Error generating PNG', err);
        alert('Could not export to PNG on this browser. Try downloading the SVG format!');
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }

  // Copy PNG image to Clipboard
  async function copyToClipboard() {
    const svgString = getStylizedSvgString();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.src = blobUrl;
    
    img.onload = async () => {
      canvas.width = 500;
      canvas.height = 500;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      try {
        canvas.toBlob(async (blob) => {
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob
            })
          ]);
          
          // Show Success Feedback on button
          const originalContent = shareBtn.innerHTML;
          shareBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          shareBtn.classList.add('btn-secondary');
          shareBtn.classList.remove('btn-outline');
          
          setTimeout(() => {
            shareBtn.innerHTML = originalContent;
            shareBtn.classList.remove('btn-secondary');
            shareBtn.classList.add('btn-outline');
          }, 2000);
        }, 'image/png');
      } catch (err) {
        console.error('Clipboard copy failed', err);
        alert('Clipboard copy not supported. Please use the download buttons.');
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }

  function sanitizeFilename(name) {
    return name
      .replace(/^(https?:\/\/)?(www\.)?/, '') // Remove protocol
      .replace(/[^a-zA-Z0-9]/g, '-')          // Replace special chars with hyphen
      .substring(0, 30);                      // Limit length
  }

  // ==========================================
  // HISTORY MANAGEMENT
  // ==========================================

  function saveToHistory(item) {
    // Prevent duplicate consecutive URLs
    if (history.length > 0 && history[0].url === item.url && history[0].fgColor === item.fgColor && history[0].bgColor === item.bgColor) {
      return;
    }

    // Add to start of array
    history.unshift(item);

    // Limit history to 15 items
    if (history.length > 15) {
      history.pop();
    }

    localStorage.setItem('qr_history', JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    if (history.length === 0) {
      historyList.innerHTML = `
        <div class="history-empty">
          <p>No QR codes generated yet.</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = '';
    
    history.forEach((item) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'history-item';
      itemEl.innerHTML = `
        <div class="history-item-details">
          <span class="history-item-url" title="${item.url}">${item.url}</span>
          <span class="history-item-meta">
            <span>${item.date}</span>
            <span class="badge" style="background: rgba(255,255,255,0.05); color: var(--text-secondary); border-color: rgba(255,255,255,0.1); padding: 1px 6px; font-size: 0.65rem;">
              EC: ${item.ecLevel}
            </span>
          </span>
        </div>
        <div class="history-item-actions">
          <button class="btn-icon load-btn" title="Reload settings and QR code" aria-label="Load">
            <i class="fa-solid fa-arrows-rotate"></i>
          </button>
          <button class="btn-icon delete-btn delete-btn-icon" title="Delete from history" aria-label="Delete">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;

      // Event listener to reload history item
      itemEl.querySelector('.load-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        loadHistoryItem(item);
      });

      itemEl.addEventListener('click', () => {
        loadHistoryItem(item);
      });

      // Event listener to delete item
      itemEl.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteHistoryItem(item.id);
      });

      historyList.appendChild(itemEl);
    });
  }

  function loadHistoryItem(item) {
    urlInput.value = item.url;
    fgColorInput.value = item.fgColor;
    fgColorHex.textContent = item.fgColor.toUpperCase();
    bgColorInput.value = item.bgColor;
    bgColorHex.textContent = item.bgColor.toUpperCase();
    marginInput.value = item.margin;
    ecLevelSelect.value = item.ecLevel;
    
    currentUrl = item.url;
    currentSvgData = item.svgData;
    
    updateInputButtonVisibility();
    displayQRCode(item.svgData);
    
    // Scroll to preview
    qrPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function deleteHistoryItem(id) {
    history = history.filter(item => item.id !== id);
    localStorage.setItem('qr_history', JSON.stringify(history));
    renderHistory();
  }

  function clearAllHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
      history = [];
      localStorage.removeItem('qr_history');
      renderHistory();
    }
  }
});
