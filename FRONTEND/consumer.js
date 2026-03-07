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
  setStatus("Starting camera... 📷", "#aaa");

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
      setStatus("❌ Could not access camera: " + err, "#ff6b6b");
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

  setStatus("Reading QR code from image... 🔍", "#aaa");

  try {
    const scanner = new Html5Qrcode("reader"); // uses a hidden element
    const decodedText = await scanner.scanFile(selectedFile, false);
    await verifyProduct(decodedText);
  } catch (err) {
    setStatus("❌ Could not read QR code from image. Try a clearer photo.", "#ff6b6b");
  }
});

// ─── Verify API Call ──────────────────────────────────────────
async function verifyProduct(productId) {
  setStatus(`Verifying "${productId}" on blockchain... ⏳`, "#aaa");

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

  resultSection.classList.remove("hidden");
  document.getElementById("resetBtn").classList.remove("hidden");

  statusEl.textContent = message;
  statusEl.style.color = isValid ? "#00c9a7" : "#ff6b6b";

  const detailsEl = document.getElementById("productDetails");
  if (isValid && productData) {
    detailsEl.style.display = "block";
    document.getElementById("productName").textContent = productData.productName || "—";
    document.getElementById("productBrand").textContent = productData.brand || "—";
    document.getElementById("productCategory").textContent = productData.category || "—";
    document.getElementById("productQuantity").textContent = productData.quantity ?? "—";
  } else {
    detailsEl.style.display = "none";
  }
}

function resetResult() {
  document.getElementById("resultSection").classList.add("hidden");
  document.getElementById("resetBtn").classList.add("hidden");
  setStatus("", "");
}

function setStatus(msg, color) {
  const el = document.getElementById("statusMsg");
  el.textContent = msg;
  el.style.color = color;
}

function resetPage() {
  selectedFile = null;
  uploadLabelText.textContent = "📂 Click to choose a QR image";
  fileInput.value = "";
  resetResult();
  if (cameraRunning) stopCamera();
}
