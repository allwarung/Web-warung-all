// --- LOCAL STORAGE SYSTEM ---
// Load data dari localStorage
function loadItems() {
    const saved = localStorage.getItem("items");
    return saved ? JSON.parse(saved) : null;
}

function saveItems() {
    localStorage.setItem("items", JSON.stringify(items));
}

function loadCart() {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// --- DATA BARANG AWAL ---
let items = loadItems() || [
    { id: 1, kategori: "Tukang Somay", nama: "Tepung Sagu 1kg", harga: 8000 },
    { id: 2, kategori: "Tukang somay", nama: "Tepung sagu 1/2kg", harga: 4000 },
    { id: 3, kategori: "Minuman", nama: "Tepung sagu 1/4kg", harga: 2000 },
    { id: 4, kategori: "Obat", nama: "Minyak Kayu Putih", harga: 8000 },
    { id: 5, kategori: "Tukang Somay", nama: "Daun Bawang", harga: 5000 },
    { id: 6, kategori: "Minuman", nama: "Teh Kotak", harga: 3500 }
];

// buat next id biar tidak bentrok
let nextItemId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;

// --- Variabel State ---
let cart = loadCart(); // Keranjang belanja terbaca dari localStorage


// --- Fungsi Format Mata Uang ---
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};


// SEARCH DAN DISPLAY (tidak berubah)
window.searchItems = () => {
    const query = document.getElementById('search-input').value.toLowerCase();
    
    document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.nav-button[data-category="Semua"]').classList.add('active');

    document.getElementById('product-display').classList.remove('hidden');
    document.getElementById('admin-panel').classList.add('hidden');

    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    document.getElementById('current-category-title').textContent = `Hasil Pencarian untuk: "${query}"`;

    const filteredItems = items.filter(item => 
        item.nama.toLowerCase().includes(query)
    );

    if (filteredItems.length === 0) {
        productList.innerHTML = '<p>Barang tidak ditemukan.</p>';
        return;
    }

    filteredItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <h4>${item.nama}</h4>
            <p>${formatRupiah(item.harga)}</p>
            <button class="add-to-cart-btn" data-id="${item.id}">Add to Cart</button>
        `;
        productList.appendChild(card);
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.dataset.id);
            addItemToCart(itemId);
        });
    });
};


const displayProducts = (category = 'Semua', searchOverride = false) => {
    if (document.getElementById('search-input').value && !searchOverride) {
        searchItems();
        return;
    }

    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    document.getElementById('product-display').classList.remove('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
    
    const titleElement = document.getElementById('current-category-title');
    titleElement.textContent = category === 'Semua' ? 'Semua Produk' : `Kategori: ${category}`;

    const filteredItems = category === 'Semua' ? items : items.filter(item => item.kategori === category);

    filteredItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <h4>${item.nama}</h4>
            <p>${formatRupiah(item.harga)}</p>
            <button class="add-to-cart-btn" data-id="${item.id}">Add to Cart</button>
        `;
        productList.appendChild(card);
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.dataset.id);
            addItemToCart(itemId);
        });
    });
};


// --- KERANJANG DENGAN LOCALSTORAGE ---
const updateCartTotal = () => {
    const total = cart.reduce((sum, item) => sum + (item.harga * item.qty), 0);
    document.getElementById('cart-total-price').textContent = formatRupiah(total);
    saveCart();
};

const renderCart = () => {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';

    cart.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'cart-item';
        listItem.innerHTML = `
            <div class="cart-item-info">
                <span>${item.nama}</span>
                <span style="font-size:0.9em;">${formatRupiah(item.harga)} x ${item.qty}</span>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
                <button class="remove-btn" data-id="${item.id}">X</button>
            </div>
        `;
        cartItemsContainer.appendChild(listItem);
    });

    updateCartTotal();
    addCartControlListeners();
};

const addItemToCart = (itemId) => {
    const existingItem = cart.find(item => item.id === itemId);
    const product = items.find(item => item.id === itemId);

    if (!product) return; 

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    renderCart();
    saveCart();
};

const updateItemQuantity = (itemId, action) => {
    const itemIndex = cart.findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
        if (action === 'increase') {
            cart[itemIndex].qty += 1;
        } else if (action === 'decrease') {
            cart[itemIndex].qty -= 1;
            if (cart[itemIndex].qty <= 0) {
                cart.splice(itemIndex, 1);
            }
        }
    }
    renderCart();
    saveCart();
};

const removeItemFromCart = (itemId) => {
    cart = cart.filter(item => item.id !== itemId);
    renderCart();
    saveCart();
};

const addCartControlListeners = () => {
    document.querySelectorAll('.qty-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.dataset.id);
            const action = e.target.dataset.action;
            updateItemQuantity(itemId, action);
        });
    });
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.dataset.id);
            removeItemFromCart(itemId);
        });
    });
};


// --- ADMIN PANEL (EDIT & HAPUS BARANG) ---
const renderEditItems = () => {
    const editListContainer = document.getElementById('edit-item-list');
    editListContainer.innerHTML = '';

    items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'edit-item-row';
        row.innerHTML = `
            <div class="edit-item-info">
                ${item.kategori} | ID:${item.id}
            </div>
            <div class="edit-item-controls">
                
                <input type="text" id="name-${item.id}" value="${item.nama}" placeholder="Nama Barang">
                <button class="btn-edit-name" onclick="saveNewName(${item.id})">Ubah Nama</button>

                <input type="number" id="price-${item.id}" value="${item.harga}" min="100" placeholder="Harga">
                <button class="btn-edit-price" onclick="saveNewPrice(${item.id})">Ubah Harga</button>
                
                <button class="btn-delete" onclick="deleteItem(${item.id})">Hapus</button>
            </div>
        `;
        editListContainer.appendChild(row);
    });
};

window.saveNewPrice = (itemId) => {
    const priceInput = document.getElementById(`price-${itemId}`);
    const newPrice = parseInt(priceInput.value);

    if (isNaN(newPrice) || newPrice <= 0) {
        alert("Harga tidak valid!");
        return;
    }

    const itemIndex = items.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        items[itemIndex].harga = newPrice;
        saveItems();
        
        alert(`Harga ${items[itemIndex].nama} berhasil diubah!`);
        renderEditItems(); 
    }
};

window.saveNewName = (itemId) => {
    const nameInput = document.getElementById(`name-${itemId}`);
    const newName = nameInput.value.trim();

    if (newName === "") {
        alert("Nama barang tidak boleh kosong!");
        return;
    }

    const itemIndex = items.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        items[itemIndex].nama = newName;
        saveItems();

        alert(`Nama barang berhasil diubah!`);
        renderEditItems(); 
    }
};

window.deleteItem = (itemId) => {
    if (confirm("Yakin hapus barang ini?")) {
        items = items.filter(item => item.id !== itemId);
        cart = cart.filter(item => item.id !== itemId);

        saveItems();
        saveCart();

        alert("Barang dihapus!");
        renderEditItems();
        renderCart();
    }
};


// --- TAMBAH ITEM BARU ---
const handleAddItem = (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('item-name');
    const priceInput = document.getElementById('item-price');
    const categorySelect = document.getElementById('item-category');

    const newItem = {
        id: nextItemId++,
        kategori: categorySelect.value,
        nama: nameInput.value,
        harga: parseInt(priceInput.value)
    };

    items.push(newItem);
    saveItems();

    alert(`Barang "${newItem.nama}" ditambahkan!`);

    e.target.reset();
    renderEditItems();
};


// --- INISIALISASI ---
document.addEventListener('DOMContentLoaded', () => {
    displayProducts('Semua');
    renderCart();

    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const category = e.target.dataset.category;

            document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            document.getElementById('search-input').value = ''; 

            if (category === 'Admin') {
                document.getElementById('product-display').classList.add('hidden');
                document.getElementById('admin-panel').classList.remove('hidden');
                renderEditItems();
            } else {
                displayProducts(category, true);
            }
        });
    });

    document.getElementById('add-item-form').addEventListener('submit', handleAddItem);
});
