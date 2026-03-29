const API_BASE = "http://localhost:8000/api";

let currentMode = "camera";
let html5QrCode = null;
let cameraRunning = false;
let selectedFile = null;

// ─── Mode Switch ──────────────────────────────────────────────
function switchMode(mode) {
  if (mode === currentMode) return;

  // Stop camera if switching away
  if (cameraRunning) stopCamera();

  currentMode = mode;

  document.getElementById("btnCamera").classList.toggle("active", mode === "camera");
  document.getElementById("btnUpload").classList.toggle("active", mode === "upload");
  document.getElementById("cameraSection").classList.toggle("hidden", mode !== "camera");
  document.getElementById("uploadSection").classList.toggle("hidden", mode !== "upload");

  resetResult();
}

// ─── Camera Mode ─────────────────────────────────────────────
document.getElementById("startCameraBtn").addEventListener("click", startCamera);
document.getElementById("stopCameraBtn").addEventListener("click", stopCamera);

function startCamera() {
  resetResult();
  setStatus("Starting camera... <span class='spinner dark' style='margin-left:8px; width:16px; height:16px; border-width:2px;'></span>", "#aaa");

  html5QrCode = new Html5Qrcode("reader");
  html5QrCode
    .start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        await stopCamera();
        await verifyProduct(decodedText);
      },
      () => {} // Ignore per-frame misses
    )
    .then(() => {
      cameraRunning = true;
      document.getElementById("startCameraBtn").classList.add("hidden");
      document.getElementById("stopCameraBtn").classList.remove("hidden");
      setStatus("Point camera at a product QR code", "#aaa");
    })
    .catch((err) => {
      let cleanErr = "Could not access the camera.";
      const errStr = String(err).toLowerCase();
      
      if (errStr.includes("notallowederror") || errStr.includes("permission denied")) {
        cleanErr = "Camera access denied. Please allow camera permissions in your browser.";
      } else if (errStr.includes("notfounderror") || errStr.includes("device not found")) {
        cleanErr = "No connected camera found on this device.";
      } else if (errStr.includes("notsupportederror") || errStr.includes("secure context")) {
        cleanErr = "Camera access requires a secure connection (HTTPS) or localhost.";
      } else if (errStr.includes("notreadableerror") || errStr.includes("already in use")) {
        cleanErr = "Camera is already in use by another application.";
      }

      setStatus(`❌ ${cleanErr}`, "#ff6b6b");
    });
}

async function stopCamera() {
  if (html5QrCode && cameraRunning) {
    try { await html5QrCode.stop(); } catch (_) {}
    html5QrCode = null;
  }
  cameraRunning = false;
  document.getElementById("startCameraBtn").classList.remove("hidden");
  document.getElementById("stopCameraBtn").classList.add("hidden");
}

// ─── Upload Mode ──────────────────────────────────────────────
const fileInput = document.getElementById("qrFileInput");
const uploadLabelText = document.getElementById("uploadLabelText");

fileInput.addEventListener("change", (e) => {
  selectedFile = e.target.files[0];
  if (selectedFile) {
    uploadLabelText.textContent = "✅ " + selectedFile.name;
    resetResult();
  }
});

document.getElementById("verifyUploadBtn").addEventListener("click", async () => {
  if (!selectedFile) {
    setStatus("❌ Please select a QR image first.", "#ff6b6b");
    return;
  }

  setStatus("Reading QR code... <span class='spinner dark' style='margin-left:8px; width:16px; height:16px; border-width:2px;'></span>", "#aaa");

  try {
    const scanner = new Html5Qrcode("reader"); // uses a hidden element
    const decodedText = await scanner.scanFile(selectedFile, false);
    await verifyProduct(decodedText);
  } catch (err) {
    setStatus("❌ Could not read QR code from image. Try a clearer photo.", "#ff6b6b");
  }
});

// ─── Verify API Call ──────────────────────────────────────────
async function verifyProduct(decodedText) {
  setStatus(`Verifying on blockchain... <span class='spinner dark' style='margin-left:8px; width:16px; height:16px; border-width:2px;'></span>`, "#aaa");

  let productId = decodedText.trim();
  try {
    const payload = JSON.parse(decodedText);
    if (payload.id) productId = payload.id;
  } catch (e) {
    // If not JSON, assume raw text is ID
  }

  try {
    const res = await fetch(`${API_BASE}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Verification failed");
    }

    const prod = data.data.product.product_data;
    showResult(true, "✅ Product is Authentic!", prod);

  } catch (err) {
    showResult(false, "❌ " + err.message, null);
  }
}

// ─── UI Helpers ───────────────────────────────────────────────
function showResult(isValid, message, productData) {
  setStatus("", "");

  const resultSection = document.getElementById("resultSection");
  const statusEl = document.getElementById("verificationStatus");
  const badgeEl = document.getElementById("resultBadge");
  const iconEl = document.getElementById("resultIcon");

  resultSection.classList.remove("hidden");
  document.getElementById("resetBtn").classList.remove("hidden");

  statusEl.textContent = message;
  
  if (isValid) {
    statusEl.style.color = "#00c9a7";
    badgeEl.style.background = "rgba(0, 201, 167, 0.1)";
    badgeEl.style.boxShadow = "0 0 0 8px rgba(0, 201, 167, 0.05)";
    iconEl.style.stroke = "#00c9a7";
    iconEl.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
  } else {
    statusEl.style.color = "#ff6b6b";
    badgeEl.style.background = "rgba(255, 107, 107, 0.1)";
    badgeEl.style.boxShadow = "0 0 0 8px rgba(255, 107, 107, 0.05)";
    iconEl.style.stroke = "#ff6b6b";
    iconEl.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';
  }

  const detailsEl = document.getElementById("productDetails");
  if (isValid && productData) {
    detailsEl.style.display = "block";
    document.getElementById("productName").textContent = productData.productName || "—";
    document.getElementById("productBrand").textContent = productData.brand || "—";
    document.getElementById("productCategory").textContent = productData.category || "—";
    document.getElementById("productQuantity").textContent = productData.quantity != null ? `${productData.quantity} g` : "—";
  } else {
    detailsEl.style.display = "none";
  }
}

function resetResult() {
  document.getElementById("resultSection").classList.add("hidden");
  document.getElementById("resetBtn").classList.add("hidden");
  setStatus("", "");
}

function setStatus(msgHTML, color) {
  const el = document.getElementById("statusMsg");
  // Using innerHTML so we can inject the <span> spinner
  el.innerHTML = msgHTML;
  el.style.color = color;
}

function resetPage() {
  selectedFile = null;
  uploadLabelText.textContent = "📂 Click to choose a QR image";
  fileInput.value = "";
  resetResult();
  if (cameraRunning) stopCamera();
}
