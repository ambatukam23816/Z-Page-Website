let products = JSON.parse(localStorage.getItem('marketProducts')) || [
    {
        id: 1,
        name: "Sony WH-1000XM5 Headphones",
        category: "tech",
        price: "$398",
        image: "https://picsum.photos/id/1015/600/600",
        description: "Premium noise-cancelling wireless headphones.",
        link: "https://your-affiliate-link-1.com"
    },
    {
        id: 2,
        name: "Minimalist Leather Wallet",
        category: "fashion",
        price: "$49",
        image: "https://picsum.photos/id/201/600/600",
        description: "Slim RFID-blocking premium leather wallet.",
        link: "https://your-affiliate-link-2.com"
    }
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Save products
function saveProducts() {
    localStorage.setItem('marketProducts', JSON.stringify(products));
}

// Render Products
function renderProducts(filteredProducts = products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <span class="category">${product.category.toUpperCase()}</span>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="price">${product.price}</div>
                <div class="card-buttons">
                    <button onclick="addToCart(${product.id}); event.stopImmediatePropagation()">Add to Cart</button>
                    <button onclick="viewProduct(${product.id}); event.stopImmediatePropagation()" style="background:#1e2937; color:white;">Quick View</button>
                </div>
            </div>
        `;
        card.addEventListener('click', () => viewProduct(product.id));
        grid.appendChild(card);
    });
}

// View Product in Modal
function viewProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('modalImage').src = product.image;
    document.getElementById('modalCategory').textContent = product.category.toUpperCase();
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalDescription').textContent = product.description;
    document.getElementById('modalPrice').textContent = product.price;
    document.getElementById('modalBuyBtn').href = product.link;

    document.getElementById('productModal').style.display = 'flex';
}

// Add to Cart
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`${product.name} added to cart`);
}

function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.length;
}

// Admin Functions
function toggleAdmin() {
    const panel = document.getElementById('adminPanel');
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    if (panel.style.display === 'flex') renderAdminProducts();
}

function renderAdminProducts() {
    const container = document.getElementById('adminProductsList');
    container.innerHTML = '';

    products.forEach((product, index) => {
        const div = document.createElement('div');
        div.className = 'admin-product-item';
        div.innerHTML = `
            <div>
                <strong>${product.name}</strong><br>
                <small>${product.price} • ${product.category}</small>
            </div>
            <div>
                <button onclick="editProduct(${product.id})" style="margin-right:8px">Edit</button>
                <button onclick="deleteProduct(${product.id})" style="background:#ef4444">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

let editingId = null;

document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const newProduct = {
        id: editingId || Date.now(),
        name: document.getElementById('formName').value,
        category: document.getElementById('formCategory').value.toLowerCase(),
        price: document.getElementById('formPrice').value,
        image: document.getElementById('formImage').value,
        description: document.getElementById('formDescription').value,
        link: document.getElementById('formLink').value
    };

    if (editingId) {
        products = products.map(p => p.id === editingId ? newProduct : p);
        editingId = null;
    } else {
        products.push(newProduct);
    }

    saveProducts();
    renderProducts();
    renderAdminProducts();
    this.reset();
    showToast(editingId ? "Product updated!" : "Product added successfully!");
});

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingId = id;
    document.getElementById('formName').value = product.name;
    document.getElementById('formCategory').value = product.category;
    document.getElementById('formPrice').value = product.price;
    document.getElementById('formImage').value = product.image;
    document.getElementById('formDescription').value = product.description;
    document.getElementById('formLink').value = product.link;
    
    toggleAdmin(); // Open admin if closed
}

function deleteProduct(id) {
    if (confirm("Delete this product?")) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        renderProducts();
        renderAdminProducts();
    }
}

// Export & Import
function exportProducts() {
    const dataStr = JSON.stringify(products, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'market-products-backup.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importProducts(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            products = imported;
            saveProducts();
            renderProducts();
            renderAdminProducts();
            showToast("Products imported successfully!");
        } catch(err) {
            alert("Invalid JSON file");
        }
    };
    reader.readAsText(file);
}

// Toast
function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed; bottom:30px; right:30px; background:#1e2937; color:white; padding:16px 24px; border-radius:50px; z-index:4000;`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Search & Categories
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
    );
    renderProducts(filtered);
});

// Modal Close
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('productModal').style.display = 'none';
});

document.getElementById('productModal').addEventListener('click', (e) => {
    if (e.target.id === 'productModal') document.getElementById('productModal').style.display = 'none';
});

document.getElementById('cartBtn').addEventListener('click', () => {
    alert(`Cart contains ${cart.length} items. (You can expand this later)`);
});

// Initialize
window.onload = () => {
    renderProducts();
    updateCartCount();
};