// Main Application logic for AeroLeaf.AI
document.addEventListener('DOMContentLoaded', () => {
  // Instances & State
  const cnnVis = new window.CNNVisualizer();
  let currentScanSource = null; // Can be Image or Video element
  let isWebcamOn = false;
  let webcamStream = null;

  // DOM Elements
  const studioView = document.getElementById('studio-view');
  const databaseView = document.getElementById('database-view');
  const modelSpecsView = document.getElementById('model-specs-view');
  const btnStudio = document.getElementById('btn-studio');
  const btnDatabase = document.getElementById('btn-database');
  const btnModelSpecs = document.getElementById('btn-model-specs');
  
  const uploadDropzone = document.getElementById('upload-dropzone');
  const fileInput = document.getElementById('file-input');
  const btnUploadTrigger = document.getElementById('btn-upload-trigger');
  const btnCameraToggle = document.getElementById('btn-camera-toggle');
  const displayImage = document.getElementById('display-image');
  const webcamFeed = document.getElementById('webcam-feed');
  const scannerLaser = document.getElementById('scanner-laser');
  
  const placeholderReport = document.getElementById('diagnostic-placeholder');
  const resultsReport = document.getElementById('diagnostic-results');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  const historyListContainer = document.getElementById('history-list-container');
  const btnClearHistory = document.getElementById('btn-clear-history');

  // CNN canvases
  const layerCanvases = {
    inputCanvas: document.getElementById('canvas-input'),
    convCanvas: document.getElementById('canvas-conv'),
    reluCanvas: document.getElementById('canvas-relu'),
    poolCanvas: document.getElementById('canvas-pool')
  };

  // --- Views Navigation ---
  function deactivateAllViews() {
    btnStudio.classList.remove('active');
    btnDatabase.classList.remove('active');
    btnModelSpecs.classList.remove('active');
    studioView.style.display = 'none';
    databaseView.style.display = 'none';
    modelSpecsView.style.display = 'none';
  }

  btnStudio.addEventListener('click', () => {
    deactivateAllViews();
    btnStudio.classList.add('active');
    studioView.style.display = 'grid';
  });

  btnDatabase.addEventListener('click', () => {
    deactivateAllViews();
    btnDatabase.classList.add('active');
    databaseView.style.display = 'grid';
    renderDatabaseCatalog();
  });

  btnModelSpecs.addEventListener('click', () => {
    deactivateAllViews();
    btnModelSpecs.classList.add('active');
    modelSpecsView.style.display = 'grid';
  });

  // --- Mock Canvas Leaf Generator ---
  // Renders a high-fidelity vector-like crop leaf on a canvas for self-contained execution
  function generateMockLeaf(diseaseKey) {
    const config = diseasesData[diseaseKey];
    if (!config) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // 1. Background sky/dirt tint
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 400, 400);

    // 2. Leaf Stem & Outline
    ctx.save();
    ctx.translate(200, 200);
    // Rotate slightly if wilted
    if (config.visuals.wiltDegree > 0) {
      ctx.rotate((config.visuals.wiltDegree * 15 * Math.PI) / 180);
    }

    // Stem path
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 180);
    ctx.quadraticCurveTo(10, 50, 0, -150);
    ctx.stroke();

    // Leaf main body (with shape variations based on crop type)
    const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 180);
    gradient.addColorStop(0, config.visuals.leafColor);
    
    // Mix yellow/brown if infected
    if (diseaseKey === 'apple_scab' || diseaseKey === 'potato_early_blight') {
      gradient.addColorStop(0.8, '#558b2f');
      gradient.addColorStop(1, '#3e2723');
    } else if (diseaseKey === 'tomato_late_blight') {
      gradient.addColorStop(0.75, '#43a047');
      gradient.addColorStop(1, '#2e7d32');
    } else {
      gradient.addColorStop(1, '#1b5e20');
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    
    if (diseaseKey === 'corn_rust') {
      // Corn has long narrow blade
      ctx.moveTo(0, 170);
      ctx.quadraticCurveTo(-45, 0, 0, -180);
      ctx.quadraticCurveTo(45, 0, 0, 170);
    } else {
      // Standard ovate leaf
      ctx.moveTo(0, 150);
      ctx.quadraticCurveTo(-110, 50, -10, -160);
      ctx.quadraticCurveTo(0, -185, 10, -160);
      ctx.quadraticCurveTo(110, 50, 0, 150);
    }
    
    ctx.fill();

    // Leaf center vein
    ctx.strokeStyle = '#81c784';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 150);
    ctx.quadraticCurveTo(5, 0, 0, -160);
    ctx.stroke();

    // Side veins
    ctx.lineWidth = 1.5;
    const veinCount = 6;
    for (let i = 0; i < veinCount; i++) {
      const yPos = 120 - i * 45;
      
      // Right vein
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.quadraticCurveTo(40, yPos - 30, 60 + i * 2, yPos - 50);
      ctx.stroke();

      // Left vein
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.quadraticCurveTo(-40, yPos - 30, -60 - i * 2, yPos - 50);
      ctx.stroke();
    }

    // 3. Render Disease Spots / Lesions
    if (config.visuals.spotsCount > 0) {
      ctx.fillStyle = config.visuals.spotColor;
      
      // Seeded random number generator so spots remain consistent
      let seed = 12345;
      function random() {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      }

      for (let s = 0; s < config.visuals.spotsCount; s++) {
        // Find points inside leaf boundaries
        const angle = random() * Math.PI * 2;
        const dist = random() * 110;
        const sx = Math.cos(angle) * dist * 0.7;
        const sy = Math.sin(angle) * dist * 0.9;
        
        ctx.beginPath();
        const r = config.visuals.spotRadius * (0.6 + random() * 0.8);
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();

        // Optional yellow halo (typical for rust/blight spots)
        if (diseaseKey === 'potato_early_blight' || diseaseKey === 'corn_rust') {
          ctx.strokeStyle = 'rgba(251, 192, 45, 0.45)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sx, sy, r + 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
    return canvas;
  }

  // --- Scan Trigger ---
  function executeDiagnosis(diseaseKey, sourceCanvasOrImg) {
    // Show scanner laser
    scannerLaser.style.display = 'block';
    
    // Simulate real CNN compute delay
    setTimeout(() => {
      scannerLaser.style.display = 'none';
      
      // Retrieve disease data
      const data = diseasesData[diseaseKey];
      if (!data) return;

      // Populate Report Panel
      placeholderReport.style.display = 'none';
      resultsReport.style.display = 'block';

      document.getElementById('result-name').textContent = data.name;
      document.getElementById('result-scientific').textContent = data.scientificName;
      document.getElementById('result-description').textContent = data.description;
      
      // Severity styling
      const badge = document.getElementById('result-severity-badge');
      badge.textContent = `${data.severity} SEVERITY`;
      badge.style.backgroundColor = data.severityColor;
      badge.style.color = '#fff';
      
      const borderCard = document.getElementById('result-severity-border');
      borderCard.style.borderLeftColor = data.severityColor;

      // Calculate confidence probability
      const confMin = data.confidenceRange[0];
      const confMax = data.confidenceRange[1];
      const confValue = Math.floor(Math.random() * (confMax - confMin + 1)) + confMin;
      document.getElementById('result-confidence').textContent = `${confValue}%`;
      document.getElementById('confidence-fill-bar').style.width = `${confValue}%`;

      // Fill lists
      fillBulletList('list-symptoms', data.symptoms);
      fillBulletList('list-causes', data.causes);
      fillBulletList('list-prevention', data.prevention);
      
      document.getElementById('txt-treatment-organic').textContent = data.treatments.organic;
      document.getElementById('txt-treatment-chemical').textContent = data.treatments.chemical;

      // Draw CNN Visual maps
      cnnVis.visualize(sourceCanvasOrImg, layerCanvases);

      // Save to History Log
      saveToHistory(data.name, data.severity, data.severityColor);

    }, 1800);
  }

  function fillBulletList(elementId, items) {
    const list = document.getElementById(elementId);
    list.innerHTML = '';
    items.forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      list.appendChild(li);
    });
  }

  // --- Sample Selector Action ---
  const sampleCards = document.querySelectorAll('.sample-card');
  sampleCards.forEach(card => {
    card.addEventListener('click', () => {
      const diseaseKey = card.getAttribute('data-disease');
      
      // Stop webcam if active
      stopWebcam();

      // Generate leaf image and show it in scanner
      const generatedCanvas = generateMockLeaf(diseaseKey);
      if (generatedCanvas) {
        const dataUrl = generatedCanvas.toDataURL();
        displayImage.src = dataUrl;
        displayImage.style.display = 'block';
        uploadDropzone.style.display = 'none';

        // Trigger diagnostic pipeline
        executeDiagnosis(diseaseKey, generatedCanvas);
      }
    });
  });

  // --- Image Upload Event handlers ---
  btnUploadTrigger.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  });

  // Drag & Drop
  uploadDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadDropzone.classList.add('dragover');
  });

  uploadDropzone.addEventListener('dragleave', () => {
    uploadDropzone.classList.remove('dragover');
  });

  uploadDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadDropzone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  });

  function processFile(file) {
    stopWebcam();
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        displayImage.src = img.src;
        displayImage.style.display = 'block';
        uploadDropzone.style.display = 'none';

        // Custom upload will randomly match a disease type to simulate AI model classification
        const diseaseKeys = Object.keys(diseasesData);
        const randomKey = diseaseKeys[Math.floor(Math.random() * diseaseKeys.length)];
        executeDiagnosis(randomKey, img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // --- Camera Functionality ---
  btnCameraToggle.addEventListener('click', () => {
    if (isWebcamOn) {
      stopWebcam();
    } else {
      startWebcam();
    }
  });

  function startWebcam() {
    displayImage.style.display = 'none';
    uploadDropzone.style.display = 'none';
    webcamFeed.style.display = 'block';
    
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        webcamStream = stream;
        webcamFeed.srcObject = stream;
        isWebcamOn = true;
        btnCameraToggle.innerHTML = "<span>🛑</span> Stop Camera";
        btnCameraToggle.style.backgroundColor = 'var(--accent-red)';
        
        // Scan continuous loops or start single scan
        triggerCameraCaptureScan();
      })
      .catch(err => {
        console.error("Camera access denied or unavailable", err);
        alert("Camera hardware not found or permissions denied. Falling back to sample upload.");
        stopWebcam();
      });
  }

  function stopWebcam() {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
    }
    webcamFeed.srcObject = null;
    webcamFeed.style.display = 'none';
    uploadDropzone.style.display = 'flex';
    isWebcamOn = false;
    btnCameraToggle.innerHTML = "<span>📷</span> Use Camera";
    btnCameraToggle.style.backgroundColor = 'var(--bg-secondary)';
  }

  function triggerCameraCaptureScan() {
    if (!isWebcamOn) return;
    
    // Simulate photo trigger after 2 seconds
    setTimeout(() => {
      if (!isWebcamOn) return;
      
      const captureCanvas = document.createElement('canvas');
      captureCanvas.width = webcamFeed.videoWidth || 400;
      captureCanvas.height = webcamFeed.videoHeight || 400;
      const ctx = captureCanvas.getContext('2d');
      ctx.drawImage(webcamFeed, 0, 0, captureCanvas.width, captureCanvas.height);
      
      // Stop feed and show image
      stopWebcam();
      displayImage.src = captureCanvas.toDataURL();
      displayImage.style.display = 'block';
      uploadDropzone.style.display = 'none';

      // Diagnose random disease label
      const diseaseKeys = Object.keys(diseasesData);
      const randomKey = diseaseKeys[Math.floor(Math.random() * diseaseKeys.length)];
      executeDiagnosis(randomKey, captureCanvas);
    }, 2500);
  }

  // --- Assessment Tabs Navigation ---
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // --- Local Storage Diagnostic History ---
  function saveToHistory(name, severity, color) {
    let history = JSON.parse(localStorage.getItem('leaf_history')) || [];
    const timestamp = new Date().toLocaleString();
    
    // Add to beginning of log
    history.unshift({ name, severity, color, timestamp });
    
    // Limit to 10 entries
    if (history.length > 10) history.pop();
    
    localStorage.setItem('leaf_history', JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    const history = JSON.parse(localStorage.getItem('leaf_history')) || [];
    historyListContainer.innerHTML = '';

    if (history.length === 0) {
      historyListContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 2rem 0;">No previous scans recorded.</div>`;
      return;
    }

    history.forEach(item => {
      const el = document.createElement('div');
      el.className = 'history-item';
      
      el.innerHTML = `
        <div class="history-info">
          <h4>${item.name}</h4>
          <p>${item.timestamp}</p>
        </div>
        <span class="history-badge" style="background-color: ${item.color}; color: #fff;">${item.severity}</span>
      `;

      // Allow clicking history logs to restore report
      el.addEventListener('click', () => {
        // Map name back to diseaseKey
        const matchKey = Object.keys(diseasesData).find(key => diseasesData[key].name === item.name);
        if (matchKey) {
          const generatedCanvas = generateMockLeaf(matchKey);
          if (generatedCanvas) {
            displayImage.src = generatedCanvas.toDataURL();
            displayImage.style.display = 'block';
            uploadDropzone.style.display = 'none';
            executeDiagnosis(matchKey, generatedCanvas);
          }
        }
      });

      historyListContainer.appendChild(el);
    });
  }

  btnClearHistory.addEventListener('click', () => {
    localStorage.removeItem('leaf_history');
    renderHistory();
  });

  // --- Reference Catalog (Database Tab) ---
  function renderDatabaseCatalog() {
    const catalogGrid = document.getElementById('catalog-grid');
    catalogGrid.innerHTML = '';
    
    Object.keys(diseasesData).forEach(key => {
      const disease = diseasesData[key];
      const card = document.createElement('div');
      card.className = 'panel';
      card.style.padding = '1.25rem';
      
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <div>
            <h3 style="font-family: var(--font-heading); color: var(--text-bright); font-size: 1.15rem;">${disease.name}</h3>
            <p style="font-size: 0.8rem; font-style: italic; color: var(--text-muted);">${disease.scientificName}</p>
          </div>
          <span style="font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 50px; background-color: ${disease.severityColor}; color: #fff;">
            ${disease.severity}
          </span>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-main); margin-bottom: 0.75rem;">${disease.description}</p>
        <div style="font-size: 0.8rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
          <strong style="color: var(--primary);">Key Prevention:</strong> ${disease.prevention[0]}
        </div>
      `;
      catalogGrid.appendChild(card);
    });
  }

  // Initial Load - Auto-load the Healthy Leaf sample as a demo so application is populated on start
  (function initDemo() {
    renderHistory();
    const demoCanvas = generateMockLeaf('healthy');
    if (demoCanvas) {
      displayImage.src = demoCanvas.toDataURL();
      displayImage.style.display = 'block';
      uploadDropzone.style.display = 'none';
      executeDiagnosis('healthy', demoCanvas);
    }
  })();

  // --- TensorFlow.js Real Model Loader ---
  let tfjsModel = null;
  const diseaseClassOrder = ['healthy', 'apple_scab', 'tomato_late_blight', 'potato_early_blight', 'corn_rust'];

  const tfjsFileInput = document.getElementById('tfjs-model-file');
  const tfjsLoadBtn = document.getElementById('tfjs-load-btn');
  const tfjsStatus = document.getElementById('tfjs-status');
  const tfjsLog = document.getElementById('tfjs-log');
  const simBadge = document.querySelector('.sim-badge');
  const inferenceModeLabel = document.getElementById('inference-mode-label');

  function setTfjsStatus(mode, message) {
    tfjsStatus.className = 'tfjs-status-badge tfjs-status-' + mode;
    const labels = {
      idle: 'No Model Loaded',
      loading: '⏳ Loading...',
      ready: '✅ Model Ready — Real Inference Active',
      error: '❌ Load Failed'
    };
    tfjsStatus.textContent = labels[mode] || message;
    tfjsLog.textContent = message || '';

    if (mode === 'ready') {
      simBadge.textContent = '✅ Real Model Loaded — Live Inference Active';
      simBadge.style.background = '#d1fae5';
      simBadge.style.color = '#065f46';
      simBadge.style.border = '1px solid #6ee7b7';
      if (inferenceModeLabel) {
        inferenceModeLabel.textContent = '🟢 REAL INFERENCE';
        inferenceModeLabel.style.color = '#059669';
        inferenceModeLabel.style.background = 'rgba(5,150,105,0.08)';
      }
    } else if (mode === 'idle' || mode === 'error') {
      simBadge.textContent = '⚠️ Simulation Mode — No live ML model loaded';
      simBadge.style.background = '#fef3c7';
      simBadge.style.color = '#92400e';
      simBadge.style.border = '1px solid #fde68a';
      if (inferenceModeLabel) {
        inferenceModeLabel.textContent = '⚡ SIMULATION MODE';
        inferenceModeLabel.style.color = 'var(--accent-amber)';
        inferenceModeLabel.style.background = 'rgba(217,119,6,0.08)';
      }
    }
  }

  // Handle selecting model.json file
  let selectedModelFile = null;
  if (tfjsFileInput) {
    tfjsFileInput.addEventListener('change', (e) => {
      selectedModelFile = e.target.files[0];
      if (selectedModelFile) {
        tfjsLog.textContent = `Selected: ${selectedModelFile.name}. Click "Load Model" to initialize.`;
      }
    });
  }

  // Handle Load button
  if (tfjsLoadBtn) {
    tfjsLoadBtn.addEventListener('click', async () => {
      if (!selectedModelFile) {
        tfjsLog.textContent = '⚠️ Please select a model.json file first.';
        return;
      }
      if (typeof tf === 'undefined') {
        tfjsLog.textContent = '❌ TensorFlow.js library failed to load. Check your internet connection.';
        setTfjsStatus('error', '❌ TensorFlow.js not available.');
        return;
      }

      setTfjsStatus('loading', `Loading ${selectedModelFile.name}...`);
      tfjsLoadBtn.disabled = true;

      try {
        // Build a URL from the file object for tf.loadLayersModel
        const fileUrl = URL.createObjectURL(selectedModelFile);
        tfjsModel = await tf.loadLayersModel(fileUrl);
        // Warm up the model
        const warmup = tf.zeros([1, 180, 180, 3]);
        tfjsModel.predict(warmup).dispose();
        warmup.dispose();
        URL.revokeObjectURL(fileUrl);
        setTfjsStatus('ready', `✅ Model loaded successfully! Using real CNN inference on uploads.`);
      } catch (err) {
        console.error('TF.js model load error:', err);
        setTfjsStatus('error', `❌ Error: ${err.message}`);
        tfjsModel = null;
      }
      tfjsLoadBtn.disabled = false;
    });
  }

  // Real inference function using loaded TF.js model
  async function runRealInference(imgElement) {
    if (!tfjsModel || typeof tf === 'undefined') return null;
    try {
      const tensor = tf.browser.fromPixels(imgElement)
        .resizeBilinear([180, 180])
        .toFloat()
        .div(255.0)
        .expandDims(0);

      const prediction = tfjsModel.predict(tensor);
      const probabilities = await prediction.data();
      tensor.dispose();
      prediction.dispose();

      // Find class with highest probability
      let maxIdx = 0;
      let maxProb = 0;
      probabilities.forEach((p, i) => {
        if (p > maxProb) { maxProb = p; maxIdx = i; }
      });

      return {
        diseaseKey: diseaseClassOrder[maxIdx] || 'healthy',
        confidence: Math.round(maxProb * 100)
      };
    } catch (err) {
      console.error('Inference error:', err);
      return null;
    }
  }

  // Override processFile to use real model if loaded
  async function processFileWithModel(file) {
    stopWebcam();
    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        displayImage.src = img.src;
        displayImage.style.display = 'block';
        uploadDropzone.style.display = 'none';

        if (tfjsModel) {
          // Real inference path
          scannerLaser.style.display = 'block';
          tfjsLog.textContent = '🔍 Running real CNN inference...';
          const result = await runRealInference(img);
          scannerLaser.style.display = 'none';
          if (result) {
            tfjsLog.textContent = `✅ Inference complete. Predicted: ${diseasesData[result.diseaseKey].name} (${result.confidence}%)`;
            executeDiagnosis(result.diseaseKey, img);
          } else {
            tfjsLog.textContent = '⚠️ Inference failed. Falling back to simulation.';
            const diseaseKeys = Object.keys(diseasesData);
            executeDiagnosis(diseaseKeys[Math.floor(Math.random() * diseaseKeys.length)], img);
          }
        } else {
          // Simulation path
          const diseaseKeys = Object.keys(diseasesData);
          executeDiagnosis(diseaseKeys[Math.floor(Math.random() * diseaseKeys.length)], img);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Re-bind upload handlers to use model-aware version
  if (fileInput) {
    fileInput.removeEventListener('change', () => {});
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) processFileWithModel(file);
    });
  }
  if (uploadDropzone) {
    uploadDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadDropzone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) processFileWithModel(file);
    });
  }
});

