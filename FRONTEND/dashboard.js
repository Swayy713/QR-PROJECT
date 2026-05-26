const API_BASE = "https://qr-project-pq9l.onrender.com/api";
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "auth.html";
}

document.getElementById("welcomeUser").textContent = `Welcome, ${user.fullName}`;
document.getElementById("userEmail").textContent = user.email;

function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

async function loadProducts() {
    const list = document.getElementById("productList");
    try {
        const res = await fetch(`${API_BASE}/all`);
        const data = await res.json();

        if (data.success && data.data && data.data.length > 0) {
            // NOTE: The current backend fetches ALL products in the database.
            // When user-product relations are added to the DB, this will show only current user's products.
            list.innerHTML = data.data.map(p => {
                const isActive = p.product_data.isActive;
                return `
                <div class="product-card">
                    <div class="product-info">
                        <h3>${p.product_data.productName}</h3>
                        <p>ID: <strong>${p.product_id}</strong> • Category: ${p.product_data.category} • Brand: ${p.product_data.brand}</p>
                        <div style="margin-top: 12px; display: flex; gap: 10px; align-items: center;">
                            ${isActive !== false
                                ? `<span class="product-status"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Active Node</span>` 
                                : `<button onclick="activateProductBtn('${p.product_id}')" style="background: #00c9a7; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: 0.3s; box-shadow: 0 4px 10px rgba(0,201,167,0.3);">Activate Now</button>`
                            }
                            <button onclick="window.location.href='qr-success.html?productId=${p.product_id}'" style="background: transparent; color: white; border: 1px solid rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 400; transition: 0.3s;">View QR Data</button>
                        </div>
                    </div>
                </div>
            `}).join('');
        } else {
            list.innerHTML = `<div class="empty-state">No products registered yet. Click "Register New Product" above to start.</div>`;
        }
    } catch (err) {
        list.innerHTML = `<div class="empty-state" style="color:#ff6b6b; border-color: rgba(255, 107, 107, 0.2);">Failed to load products: ${err.message}</div>`;
    }
}

window.activateProductBtn = async function(productId) {
    if(!confirm("Are you sure you want to activate this product? Once activated, consumers can verify it.")) return;
    try {
        const res = await fetch(`${API_BASE}/activate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId })
        });
        const data = await res.json();
        if (data.success) {
            alert("Product activated successfully!");
            loadProducts(); // refresh UI
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert("Activation failed: " + err.message);
    }
}

loadProducts();
