// Data
const catalog = document.getElementById("catalog");
const search = document.getElementById("search");
const filter = document.getElementById("filter");
const urutkan = document.getElementById("urutkan");
const more = document.getElementById("more");
let products = [];
let hasilProduk = [];
let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];
let index = 0;
let produkDipilih;

// Login
const nama = localStorage.getItem("username");
if (!nama) {
    window.location.href = "login.html";
}
document.getElementById("welcome").textContent = nama;
document.getElementById("logout").addEventListener("click", function() {
    localStorage.removeItem("username");
    window.location.href = "login.html";
});

// Tampilkan Produk
function tampilkanProduk(data) {
    data.forEach(function(p) {
        catalog.innerHTML += `
        <div class="product-card" data-id="${p.id}">
            <img src="${p.thumbnail}">
            <h3>${p.title}</h3>
            <p>Harga: $${p.price}</p>
            <p>Rating: ${p.rating}</p>
            <p>Diskon: ${p.discountPercentage}%</p>
            <p>Kategori: ${p.category}</p>
            <button class="tambah">Tambah ke Keranjang</button>
        </div>`;
    });
}

// Load More
function loadProduk() {
    const data = hasilProduk.slice(index, index + 20);
    tampilkanProduk(data);
    index += 20;
    if (index >= hasilProduk.length) {
        more.style.display = "none";
    } else {
        more.style.display = "block";
    }
}

// Debounce
function debounce(fungsi, delay) {
    let timer;
    return function() {
        clearTimeout(timer);
        timer = setTimeout(fungsi, delay);
    };
}

// Search, Filter, Sort
function prosesProduk() {
    const keyword = search.value.toLowerCase();
    hasilProduk = products.filter(function(p) {
        return p.title.toLowerCase().includes(keyword) ||
            p.category.toLowerCase().includes(keyword);
    });
    if (filter.value !== "all") {
        hasilProduk = hasilProduk.filter(function(p) {
            return p.category === filter.value;
        });
    }
    if (urutkan.value === "lowest-price") {
        hasilProduk.sort(function(a, b) {
            return a.price - b.price;
        });
    }
    if (urutkan.value === "highest-price") {
        hasilProduk.sort(function(a, b) {
            return b.price - a.price;
        });
    }
    if (urutkan.value === "highest-rating") {
        hasilProduk.sort(function(a, b) {
            return b.rating - a.rating;
        });
    }
    if (urutkan.value === "lowest-rating") {
        hasilProduk.sort(function(a, b) {
            return a.rating - b.rating;
        });
    }
    catalog.innerHTML = "";
    index = 0;
    loadProduk();
}

// Ambil Produk API
async function ambilProduk() {
    try {
        const response = await fetch("https://dummyjson.com/products");
        if (!response.ok) {
            throw new Error("Gagal mengambil produk");
        }
        const data = await response.json();
        products = data.products;
        hasilProduk = products;
        const kategori = [];
        products.forEach(function(p) {
            if (!kategori.includes(p.category)) {
                kategori.push(p.category);
                const option = document.createElement("option");
                option.value = p.category;
                option.textContent = p.category;
                filter.appendChild(option);
            }
        });
        loadProduk();
    } catch (error) {
        const pesan = document.createElement("p");
        pesan.textContent = error.message;
        catalog.appendChild(pesan);
    }
}
ambilProduk();

// Event Produk
more.addEventListener("click", function() {loadProduk();});
search.addEventListener("input", debounce(prosesProduk, 300));
filter.addEventListener("change", function() {prosesProduk();});
urutkan.addEventListener("change", function() {prosesProduk();});

// Detail dan Tambah Keranjang
catalog.addEventListener("click", function(event) {
    const card = event.target.parentElement;
    if (!card.classList.contains("product-card")) {
        return;
    }
    const id = Number(card.dataset.id);
    const product = products.find(function(p) {
        return p.id === id;
    });
    if (event.target.classList.contains("tambah")) {
        keranjang.push(product);
        simpanKeranjang();
        return;
    }
    produkDipilih = product;
    document.getElementById("popupKeranjang").hidden = true;
    document.getElementById("detailGambar").src = product.thumbnail;
    document.getElementById("detailNama").textContent = product.title;
    document.getElementById("detailHarga").textContent = "$" + product.price;
    document.getElementById("detailStok").textContent = "Stok: " + product.stock;
    document.getElementById("detailBrand").textContent = "Brand: " + product.brand;
    document.getElementById("detailDeskripsi").textContent = product.description;
    document.getElementById("popupDetail").hidden = false;
});

// Keranjang
function simpanKeranjang() {
    localStorage.setItem("keranjang", JSON.stringify(keranjang));
    tampilkanKeranjang();
}
function tampilkanKeranjang() {
    const daftar = document.getElementById("daftarKeranjang");
    let total = 0;
    daftar.innerHTML = "";
    const produk = [];
    keranjang.forEach(function(p) {
        if (!produk.find(function(item) {
            return item.id === p.id;
        })) {
            produk.push(p);
        }
    });
    produk.forEach(function(p) {
        const jumlah = keranjang.filter(function(item) {
            return item.id === p.id;
        }).length;
        total += p.price * jumlah;
        daftar.innerHTML += `
        <div class="item-keranjang">
            <img src="${p.thumbnail}">
            <div>
                <b>${p.title}</b>
                <p>$${p.price}</p>
                <button class="kurang" data-id="${p.id}">-</button>
                ${jumlah}
                <button class="tambahJumlah" data-id="${p.id}">+</button>
                <button class="hapusProduk" data-id="${p.id}">Hapus</button>
            </div>
        </div>`;
    });
    document.getElementById("jumlahKeranjang").textContent = keranjang.length;
    document.getElementById("totalHarga").textContent = total.toFixed(2);
}

// Event Keranjang
document.getElementById("daftarKeranjang").addEventListener("click", function(event) {
    const id = Number(event.target.dataset.id);
    if (event.target.classList.contains("tambahJumlah")) {
        const product = products.find(function(p) {
            return p.id === id;
        });
        keranjang.push(product);
    }
    if (event.target.classList.contains("kurang")) {
        const posisi = keranjang.findIndex(function(p) {
            return p.id === id;
        });
        if (posisi !== -1) {
            keranjang.splice(posisi, 1);
        }
    }
    if (event.target.classList.contains("hapusProduk")) {
        keranjang = keranjang.filter(function(p) {
            return p.id !== id;
        });
    }
    simpanKeranjang();
});

// Popup Keranjang
document.getElementById("tombolKeranjang").addEventListener("click", function() {
    document.getElementById("popupDetail").hidden = true;
    document.getElementById("popupKeranjang").hidden = false;
    tampilkanKeranjang();
});
document.getElementById("tutupKeranjang").addEventListener("click", function() {
    document.getElementById("popupKeranjang").hidden = true;
});

// Popup Detail
document.getElementById("tutupDetail").addEventListener("click", function() {
    document.getElementById("popupDetail").hidden = true;
});
document.getElementById("tambahKeranjang").addEventListener("click", function() {
    keranjang.push(produkDipilih);
    simpanKeranjang();
    document.getElementById("popupDetail").hidden = true;
});

// Hapus Semua
document.getElementById("hapusSemua").addEventListener("click", function() {
    keranjang = [];
    localStorage.removeItem("keranjang");
    tampilkanKeranjang();
});

tampilkanKeranjang();