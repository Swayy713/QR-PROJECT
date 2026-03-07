const API_BASE = "http://localhost:8000/api";

const registerBtn = document.getElementById("registerBtn");
const messageEl = document.getElementById("message");

registerBtn.addEventListener("click", async () => {
  const productId = document.getElementById("productID").value.trim();
  const productName = document.getElementById("productName").value.trim();
  const brand = document.getElementById("brand").value.trim();
  const quantity = parseInt(document.getElementById("quantity").value);
  const category = document.getElementById("category").value.trim();

  if (!productId || !productName || !brand || !category || isNaN(quantity)) {
    showMessage("❌ Please fill in all fields.", "error");
    return;
  }

  // Clear any existing message
  showMessage("", "");
  
  registerBtn.disabled = true;
  // Inject spinner into button
  registerBtn.innerHTML = '<span class="spinner"></span> Registering...';

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        productData: { productName, quantity, brand, category },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    // Redirect to the QR success page — productId is passed via URL param
    window.location.href = `qr-success.html?productId=${encodeURIComponent(productId)}`;

  } catch (err) {
    showMessage(`❌ Error: ${err.message}`, "error");
    registerBtn.disabled = false;
    registerBtn.textContent = "Register on Blockchain";
  }
});

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.style.color =
    type === "success" ? "#00c9a7" :
    type === "error"   ? "#ff6b6b" :
                         "#aaaaaa";
}
