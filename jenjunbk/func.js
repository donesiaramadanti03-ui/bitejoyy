import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Data Menu dengan 4 Kategori Baru (Tanpa emoji ganda)
const menuData = [
    {
        category: "CLASSIC",
        icon: "🤍",
        items: [
            { id: "c1", name: "Sugar Joy", price: 6000, desc: "Donat fluffy + gula halus", img: "img/sugarjoy.jpeg" },
            { id: "c2", name: "Choco Mess", price: 6000, desc: "Chocholate Glaze+ Messes coklat", img: "img/chocomess.jpeg" },
            { id: "c3", name: "Cheese Melt", price: 6000, desc: "Cheese glaze + parutan keju + strawberry jam", img: "img/Cheese melt.jpeg" },
        ]
    },
    {
        category: "CHOCO LOVERS",
        icon: "🍫",
        items: [
            { id: "cl1", name: "Chocho Love", price: 7000, desc: "Chocolate glaze + Monde Bisc", img: "img/chocolove.jpeg" },
            { id: "cl2", name: "Choco Biskoff", price: 7000, desc: "Chocolate glaze + lotus biskoff.", img: "img/chocobiskoff.jpeg" },
            { id: "cl3", name: "Choco Almond", price: 7000, desc: "Chocolate glaze + almond.", img: "img/chocoalmond.jpeg" }
        ]
    },
    {
        category: "SWEET & PRETTY",
        icon: "🍓",
        items: [
            { id: "sp1", name: "Pink Berry", price: 7000, desc: "Vanilla glaze, strawberry jam, fresh strawberry, dan biscuit crumb.", img: "img/pinkberry.jpeg" },
            { id: "sp2", name: "Pink Snow", price: 7000, desc: "Strawberry glaze dengan marshmallow pink. A sweet little cloud.", img: "img/pinksnow.jpeg" },
            { id: "sp3", name: "Matcha Queen Bliss", price: 7000, desc: "Matcha glaze, queen Matcha, dan matcha crumb untuk matcha lovers.", img: "img/matchabliss.jpeg" },
            { id: "sp4", name: "Tiramisu Berry", price: 7000, desc: "Tiramisu glaze bertemu strawberry. Creamy dengan sentuhan fruity.", img: "img/tiramisuberry.jpeg"},
            { id: "sp5", name: "Lotus Sweet", price: 7000, desc: "Lotus spread dan biskuit Lotus. Karamel hangat di setiap gigitan.", img: "img/lotussweet.jpeg" },
            { id: "sp6", name: "Sweeet Pink", price: 7000, desc: "Strawberry glaze dengan meses warna-warni", img: "img/sweetpink.jpeg" }
        ]
    },
    {
        category: "JOY BOMB",
        icon: "💥",
        items: [
            { id: "jb1", name: "Choco Lava Bomb", price: 8000, desc: "Donat lembut berisi creamy choco milk filling yang melimpah.", img: "img/chocolavabomb.jpeg" },
            { id: "jb2", name: "Strawberry Cream Bomb", price: 8000, desc: "Strawberry cream dan strawberry. Soft outside, fruity inside.", img: "img/Strawberrycreambomb.jpeg" },
            { id: "jb3", name: "Milk Cream Bomb", price: 8000, desc: "Creamy milk filling dengan taburan milk powder yang lembut.", img: "img/milkbomb.jpeg" },
            { id: "jb4", name: "Matcha Cream Bomb", price: 8000, desc: "Matcha cream filling dengan strawberry bits. Loaded with joy.", img: "img/matchacreambomb.jpeg" },
        ]
    }
];

let cart = {};
let currentView = 'home';
let selectedRating = 0;
let allReviewsData = [];
let showAllReviewsFlag = false;
let activeTabId = 'all';

document.addEventListener('DOMContentLoaded', () => {
    renderCategoryTabs();
    renderMenu();
    updateCartUI();
    initScrollHeader();
    loadReviews();
    setDefaultDate();
});

function setDefaultDate() {
    const dateInput = document.getElementById('buyer-date');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
    }
}

window.switchView = function(viewName) {
    currentView = viewName;
    const viewHome = document.getElementById('view-home');
    const viewMenu = document.getElementById('view-menu');
    const menuSubnav = document.getElementById('menu-subnav');

    if (viewName === 'home') {
        viewHome.classList.remove('hidden');
        viewMenu.classList.add('hidden');
        menuSubnav.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewName === 'menu') {
        viewHome.classList.add('hidden');
        viewMenu.classList.remove('hidden');
        menuSubnav.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function initScrollHeader() {
    window.addEventListener('scroll', () => {
        const header = document.getElementById('sticky-header');
        if (window.scrollY > 30) {
            header.classList.add('shadow-md');
        } else {
            header.classList.remove('shadow-md');
        }
    });
}

// Render Tab Kategori dengan Animasi Membal (Bouncy)
function renderCategoryTabs() {
    const tabsContainer = document.getElementById('category-tabs');
    if (!tabsContainer) return;
    
    const isAllActive = activeTabId === 'all' ? 'tab-btn-active' : 'tab-btn-inactive';
    
    let html = `
        <button id="tab-btn-all" onclick="scrollToCategory('all')" 
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex-shrink-0 active:scale-90 ${isAllActive}">
            Semua
        </button>
    `;

    menuData.forEach((cat, idx) => {
        const catId = `cat-${idx}`;
        const isActive = activeTabId === catId ? 'tab-btn-active' : 'tab-btn-inactive';
        
        html += `
            <button id="tab-btn-${catId}" onclick="scrollToCategory('${catId}')" 
                class="px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 flex-shrink-0 active:scale-90 ${isActive}">
                ${cat.icon} ${cat.category}
            </button>
        `;
    });

    tabsContainer.innerHTML = html;
}

window.scrollToCategory = function(id) {
    activeTabId = id;
    renderCategoryTabs();

    if (id === 'all') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        const el = document.getElementById(id);
        if (el) {
            const yOffset = -100;
            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }
}

function renderMenu() {
    const container = document.getElementById('menu-container');
    if (!container) return;

    let html = '';
    menuData.forEach((cat, idx) => {
        html += `
            <div id="cat-${idx}" class="space-y-3 pt-2">
                <h3 class="font-rounded font-extrabold text-lg text-[#582C35] flex items-center space-x-2 border-b border-[#FFE2E8] pb-1.5">
                    <span>${cat.icon}</span>
                    <span>${cat.category}</span>
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        `;

        cat.items.forEach(item => {
            const qty = cart[item.id] ? cart[item.id].qty : 0;
            html += `
                <div class="bg-white p-3.5 rounded-2xl border border-[#FFE2E8] shadow-[0_8px_25px_rgba(225,29,72,0.05)] flex space-x-3 items-center transition hover:border-[#E11D48]">
                    <img src="${item.img}" alt="${item.name}" class="w-20 h-20 object-cover rounded-xl bg-[#FFF0F3] flex-shrink-0" onerror="this.src='https://placehold.co/100x100/FFF0F3/E11D48?text=JJ'">
                    <div class="flex-grow min-w-0">
                        <h4 class="font-rounded font-extrabold text-sm text-[#582C35] truncate">${item.name}</h4>
                        <p class="text-[11px] text-[#582C35]/80 line-clamp-2 leading-snug mt-0.5">${item.desc}</p>
                        <div class="flex items-center justify-between mt-2">
                            <span class="font-rounded font-extrabold text-sm text-[#E11D48]">Rp ${item.price.toLocaleString('id-ID')}</span>
                            <div class="flex items-center space-x-1.5">
            `;

            if (qty > 0) {
                html += `
                    <button onclick="updateQty('${item.id}', -1)" class="w-7 h-7 bg-[#FFF0F3] hover:bg-[#FFE2E8] text-[#582C35] rounded-lg font-bold text-xs flex items-center justify-center transition active:scale-90">-</button>
                    <span class="font-rounded font-bold text-xs w-5 text-center text-[#582C35]">${qty}</span>
                    <button onclick="updateQty('${item.id}', 1)" class="w-7 h-7 bg-[#E11D48] hover:bg-[#C0153B] text-white rounded-lg font-bold text-xs flex items-center justify-center transition active:scale-90">+</button>
                `;
            } else {
                html += `
                    <button onclick="addItem('${item.id}', '${cat.category}', '${item.name}', ${item.price})" class="bg-[#FFF0F3] hover:bg-[#E11D48] hover:text-white text-[#E11D48] border border-[#FFE2E8] px-3 py-1.5 rounded-xl font-rounded font-bold text-xs flex items-center space-x-1 transition active:scale-95">
                        <i class="fa-solid fa-plus text-[10px]"></i>
                        <span>Tambah</span>
                    </button>
                `;
            }

            html += `
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
    });

    container.innerHTML = html;
}

window.addItem = function(id, category, name, price) {
    if (!cart[id]) {
        cart[id] = { id, category, name, price, qty: 1 };
    } else {
        cart[id].qty += 1;
    }
    updateCartUI();
    renderMenu();
}

window.updateQty = function(id, change) {
    if (cart[id]) {
        cart[id].qty += change;
        if (cart[id].qty <= 0) {
            delete cart[id];
        }
    }
    updateCartUI();
    renderMenu();
}

function updateCartUI() {
    let totalItems = 0;
    let totalPrice = 0;

    Object.values(cart).forEach(item => {
        totalItems += item.qty;
        totalPrice += item.price * item.qty;
    });

    const badge = document.getElementById('cart-badge');
    const totalItemsSpan = document.getElementById('cart-total-items');
    const totalPriceSpan = document.getElementById('cart-total-price');
    const grandTotalSpan = document.getElementById('cart-grand-total');
    const floatingBar = document.getElementById('floating-cart-bar');

    if (badge) {
        if (totalItems > 0) {
            badge.innerText = totalItems;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    if (totalItemsSpan) totalItemsSpan.innerText = `${totalItems}`;
    if (totalPriceSpan) totalPriceSpan.innerText = `Rp ${totalPrice.toLocaleString('id-ID')}`;
    if (grandTotalSpan) grandTotalSpan.innerText = `Rp ${totalPrice.toLocaleString('id-ID')}`;

    if (floatingBar) {
        if (totalItems > 0) {
            floatingBar.classList.remove('translate-y-full');
        } else {
            floatingBar.classList.add('translate-y-full');
        }
    }

    renderCartItemsList();
}

function renderCartItemsList() {
    const listContainer = document.getElementById('cart-items-list');
    if (!listContainer) return;

    const items = Object.values(cart);
    if (items.length === 0) {
        listContainer.innerHTML = `<p class="text-xs text-[#582C35] text-center py-6">Keranjang pesanan masih kosong.</p>`;
        return;
    }

    let html = '';
    items.forEach(item => {
        html += `
            <div class="flex items-center justify-between bg-[#FFF0F3] p-2.5 rounded-xl border border-[#FFE2E8]">
                <div class="pr-2">
                    <h5 class="font-rounded font-bold text-xs text-[#582C35]">${item.name}</h5>
                    <span class="text-[11px] text-[#E11D48] font-bold">Rp ${(item.price * item.qty).toLocaleString('id-ID')}</span>
                </div>
                <div class="flex items-center space-x-2 flex-shrink-0">
                    <button onclick="updateQty('${item.id}', -1)" class="w-6 h-6 bg-white border border-[#FFE2E8] text-[#582C35] rounded-md font-bold text-xs flex items-center justify-center">-</button>
                    <span class="font-rounded font-bold text-xs w-4 text-center text-[#582C35]">${item.qty}</span>
                    <button onclick="updateQty('${item.id}', 1)" class="w-6 h-6 bg-[#E11D48] text-white rounded-md font-bold text-xs flex items-center justify-center">+</button>
                </div>
            </div>
        `;
    });
    listContainer.innerHTML = html;
}

window.toggleCartDrawer = function(show) {
    const drawer = document.getElementById('cart-drawer');
    const content = document.getElementById('cart-drawer-content');
    if (!drawer || !content) return;

    if (show) {
        drawer.classList.remove('hidden');
        setTimeout(() => {
            drawer.classList.remove('opacity-0');
            content.classList.remove('translate-y-full');
        }, 10);
    } else {
        drawer.classList.add('opacity-0');
        content.classList.add('translate-y-full');
        setTimeout(() => {
            drawer.classList.add('hidden');
        }, 300);
    }
}

window.openCheckoutOrCart = function() {
    const itemsCount = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
    if (itemsCount === 0) {
        switchView('menu');
        showNotification("Pemberitahuan", "Silakan pilih menu favorit Anda terlebih dahulu.");
    } else {
        toggleCartDrawer(true);
    }
}

window.checkoutToWhatsApp = function() {
    const name = document.getElementById('buyer-name').value.trim();
    const city = document.getElementById('buyer-city').value.trim();
    const date = document.getElementById('buyer-date').value;
    const note = document.getElementById('buyer-note').value.trim();

    if (!name || !city || !date) {
        showNotification("Data Belum Lengkap", "Harap isi Nama, Kota Tujuan, dan Tanggal Pengiriman/PO terlebih dahulu.");
        return;
    }

    const items = Object.values(cart);
    if (items.length === 0) {
        showNotification("Keranjang Kosong", "Belum ada produk yang dipilih.");
        return;
    }

    let message = `Halo Bite Joy, saya ingin memesan:\n\n`;
    let totalPrice = 0;

    items.forEach((item, idx) => {
        const subtotal = item.price * item.qty;
        totalPrice += subtotal;
        message += `${idx + 1}. ${item.name} (${item.qty}x) - Rp ${subtotal.toLocaleString('id-ID')}\n`;
    });

    message += `\n*Total Belanja:* Rp ${totalPrice.toLocaleString('id-ID')}`;
    message += `\n\n*Data Pemesan:*`;
    message += `\n- Nama: ${name}`;
    message += `\n- Kota Tujuan: ${city}`;
    message += `\n- Tanggal Kirim/PO: ${date}`;
    if (note) message += `\n- Catatan: ${note}`;
    message += `\n\nMohon konfirmasi ketersediaan dan total pembayarannya ya. Terima kasih!`;

    const waNumber = "6289502942403";
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${waNumber}?text=${encoded}`, '_blank');
}

function showNotification(title, message) {
    const modal = document.getElementById('notification-modal');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');

    if (modal && titleEl && msgEl) {
        titleEl.innerText = title;
        msgEl.innerText = message;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

window.closeNotification = function() {
    const modal = document.getElementById('notification-modal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
}

window.setRating = function(val) {
    selectedRating = val;
    document.getElementById('review-rating-val').value = val;
    const stars = document.querySelectorAll('#star-rating-picker i');
    const label = document.getElementById('rating-text-label');

    stars.forEach((star, idx) => {
        if (idx < val) {
            star.classList.remove('text-slate-300');
            star.classList.add('text-amber-400');
        } else {
            star.classList.remove('text-amber-400');
            star.classList.add('text-slate-300');
        }
    });

    const labels = ["", "Kurang", "Cukup", "Puas", "Sangat Puas", "Luar Biasa!"];
    if (label) label.innerText = `(${labels[val]})`;
}

window.updateCharCount = function() {
    const comment = document.getElementById('review-comment');
    const counter = document.getElementById('char-count');
    if (comment && counter) {
        counter.innerText = `${comment.value.length} / 300`;
    }
}

// Memuat ulasan dari Firebase Firestore
async function loadReviews() {
    const statusContainer = document.getElementById('reviews-status-container');
    if (statusContainer) statusContainer.classList.remove('hidden');

    try {
        if (!window.db) {
            setTimeout(loadReviews, 500);
            return;
        }

        const q = query(collection(window.db, "reviews"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        allReviewsData = [];
        querySnapshot.forEach((doc) => {
            allReviewsData.push(doc.data());
        });

        renderReviewsList();
    } catch (error) {
        console.error("Gagal memuat ulasan: ", error);
        if (statusContainer) statusContainer.classList.add('hidden');
    }
}

function renderReviewsList() {
    const grid = document.getElementById('reviews-grid');
    const statusContainer = document.getElementById('reviews-status-container');
    const countText = document.getElementById('reviews-count-text');
    const avgText = document.getElementById('reviews-avg-text');
    const starsContainer = document.getElementById('reviews-stars-container');
    const toggleBtn = document.getElementById('toggle-all-reviews-btn');

    if (statusContainer) statusContainer.classList.add('hidden');

    if (allReviewsData.length === 0) {
        if (countText) countText.innerText = "(Belum ada ulasan)";
        if (avgText) avgText.classList.add('hidden');
        if (starsContainer) starsContainer.classList.add('hidden');
        if (toggleBtn) toggleBtn.classList.add('hidden');
        if (grid) {
            grid.innerHTML = `
                <div class="col-span-1 sm:col-span-2 text-center py-6 bg-white rounded-2xl border border-[#FFE2E8] text-xs text-[#582C35]/60">
                    Belum ada ulasan. Jadilah yang pertama memberikan ulasan!
                </div>
            `;
        }
        return;
    }

    const totalRating = allReviewsData.reduce((acc, curr) => acc + curr.rating, 0);
    const avgRating = (totalRating / allReviewsData.length).toFixed(1);

    if (countText) countText.innerText = `(${allReviewsData.length} ulasan)`;
    if (avgText) {
        avgText.innerText = avgRating;
        avgText.classList.remove('hidden');
    }
    if (starsContainer) starsContainer.classList.remove('hidden');
    if (toggleBtn) {
        if (allReviewsData.length > 2) {
            toggleBtn.classList.remove('hidden');
            toggleBtn.innerText = showAllReviewsFlag ? "Tampilkan lebih sedikit" : `Lihat semua (${allReviewsData.length})`;
        } else {
            toggleBtn.classList.add('hidden');
        }
    }

    if (!grid) return;

    const displayData = showAllReviewsFlag ? allReviewsData : allReviewsData.slice(0, 2);
    let html = '';

    displayData.forEach((rev) => {
        html += `
            <div class="bg-white p-4 rounded-2xl border border-[#FFE2E8] shadow-[0_6px_20px_rgba(225,29,72,0.05)] space-y-2">
                <div class="flex items-center justify-between">
                    <h5 class="font-rounded font-bold text-xs text-[#582C35]">${rev.name}</h5>
                    <span class="text-[10px] text-[#582C35]/70">${rev.date}</span>
                </div>
                <div class="text-amber-400 text-[10px]">
                    ${'<i class="fa-solid fa-star"></i>'.repeat(rev.rating)}
                </div>
                <p class="text-xs text-[#582C35] leading-snug">${rev.comment}</p>
                ${rev.img ? `<img src="${rev.img}" alt="Foto ulasan" class="w-full h-32 object-cover rounded-xl mt-2 border border-[#FFE2E8]">` : ''}
            </div>
        `;
    });

    grid.innerHTML = html;
}

window.toggleAllReviews = function() {
    showAllReviewsFlag = !showAllReviewsFlag;
    const toggleBtn = document.getElementById('toggle-all-reviews-btn');
    if (toggleBtn) {
        toggleBtn.innerText = showAllReviewsFlag ? "Tampilkan lebih sedikit" : `Lihat semua (${allReviewsData.length})`;
    }
    renderReviewsList();
}

window.submitReview = async function(event) {
    event.preventDefault();
    const hpWebsite = document.getElementById('hp-website').value;
    if (hpWebsite) return;

    const name = document.getElementById('review-name').value.trim();
    const rating = parseInt(document.getElementById('review-rating-val').value);
    const comment = document.getElementById('review-comment').value.trim();
    const imageInput = document.getElementById('review-image');

    if (!name || rating === 0 || !comment) {
        showNotification("Belum Lengkap", "Harap isi nama, berikan rating bintang, dan tulis komentar ulasan Anda.");
        return;
    }

    const submitBtn = document.getElementById('review-submit-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Mengirim...";
    }

    const saveToFirebase = async (imageData = null) => {
        try {
            const today = new Date();
            const dateStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

            const newReview = {
                name: name,
                rating: rating,
                comment: comment,
                img: imageData,
                date: dateStr,
                createdAt: new Date()
            };

            await addDoc(collection(window.db, "reviews"), newReview);

            document.getElementById('review-form').reset();
            selectedRating = 0;
            document.getElementById('review-rating-val').value = '0';
            setRating(0);
            updateCharCount();

            showAllReviewsFlag = true;
            await loadReviews();

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "Kirim Ulasan";
            }

            showNotification("Terima Kasih!", "Ulasan Anda berhasil dikirim dan tersimpan di database.");
        } catch (error) {
            console.error("Gagal mengirim ulasan: ", error);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "Kirim Ulasan";
            }
            showNotification("Gagal", "Terjadi kesalahan saat mengirim ulasan.");
        }
    };

    if (imageInput && imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            saveToFirebase(e.target.result);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        saveToFirebase(null);
    }
}

// Fungsi untuk menambahkan Paket Spesial langsung ke keranjang
window.addPackageToCart = function(packageName, packagePrice) {
    const packageId = 'pkg-' + packageName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    if (!cart[packageId]) {
        cart[packageId] = {
            id: packageId,
            category: "PAKET SPESIAL",
            name: packageName,
            price: packagePrice,
            qty: 1
        };
    } else {
        cart[packageId].qty += 1;
    }
    
    updateCartUI();
    showNotification("Berhasil Ditambahkan!", `${packageName} telah ditambahkan ke keranjang pesanan.`);
}