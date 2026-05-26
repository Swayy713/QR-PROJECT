const API_BASE = "https://qr-project-pq9l.onrender.com/api";

const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const pageTitle = document.getElementById("pageTitle");
const messageEl = document.getElementById("message");

function switchTab(tab) {
    showMessage("", "");
    if (tab === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        pageTitle.textContent = "Manufacturer Sign In";
    } else {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        pageTitle.textContent = "Manufacturer Registration";
    }
}

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.style.color =
        type === "success" ? "#00c9a7" :
        type === "error"   ? "#ff6b6b" :
                             "#aaaaaa";
}

document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
        showMessage("❌ Please fill in all fields.", "error");
        return;
    }

    try {
        const btn = document.getElementById("loginBtn");
        btn.disabled = true;
        btn.innerHTML = 'Signing in...';
        
        const res = await fetch(`${API_BASE}/loginUser`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        btn.disabled = false;
        btn.innerHTML = 'Sign In';

        if (!data.success) {
            throw new Error(data.message);
        }

        // Save user to storage
        localStorage.setItem("user", JSON.stringify(data.data));
        window.location.href = "dashboard.html";

    } catch (err) {
        showMessage(`❌ ${err.message}`, "error");
        document.getElementById("loginBtn").disabled = false;
        document.getElementById("loginBtn").innerHTML = 'Sign In';
    }
});

document.getElementById("regBtn").addEventListener("click", async () => {
    const userName = document.getElementById("regUsername").value.trim();
    const fullName = document.getElementById("regFullName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    if (!userName || !fullName || !email || !password) {
        showMessage("❌ Please fill in all fields.", "error");
        return;
    }

    try {
        const btn = document.getElementById("regBtn");
        btn.disabled = true;
        btn.innerHTML = 'Registering...';

        const res = await fetch(`${API_BASE}/registerUser`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userName, fullName, email, password })
        });

        const data = await res.json();
        btn.disabled = false;
        btn.innerHTML = 'Create Account';

        if (!data.success) {
            throw new Error(data.message);
        }

        // Automatically log them in after registration by saving their user details
        localStorage.setItem("user", JSON.stringify(data.data));
        window.location.href = "dashboard.html";

    } catch (err) {
        showMessage(`❌ ${err.message}`, "error");
        document.getElementById("regBtn").disabled = false;
        document.getElementById("regBtn").innerHTML = 'Create Account';
    }
});
