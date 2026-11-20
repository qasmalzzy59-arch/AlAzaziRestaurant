"use strict";

/* ============================================================
   مطعم ومخبازة وشواية العزعزي — منطق الموقع
   القائمة · البحث · الفلاتر · السلة · الحجز · واتساب
   ============================================================ */

const CONFIG = {
  NAME: "مطعم ومخبازة وشواية العزعزي",
  WHATSAPP: "967777698379",
  WHATSAPP_DISPLAY: "777698379",
  PHONES: ["736436022", "718533177"],
  ADDRESS: "مأرب - الشبواني - سوق مجمع السلام - جوار موقف سوق القات"
};

const STORAGE_KEYS = {
  CART: "alazazi_cart_v2",
  ORDERS: "alazazi_orders_v2",
  BOOKINGS: "alazazi_bookings_v2"
};

const CATEGORIES = {
  popular: "أطباق شعبية",
  grilled: "شواية ومشويات",
  appetizer: "مقبلات",
  drinks: "مشروبات"
};

/*
  لإضافة صور حقيقية لاحقاً:
  ضع الصورة داخل مجلد images/ بنفس اسم الملف في الخاصية img لكل صنف.
  مثال: images/asid.jpg — وإن لم توجد الصورة يظهر أيقونة الصنف تلقائياً.
*/
const MENU = [
  {
    id: 1,
    name: "عصيد",
    price: 3500,
    cat: "popular",
    icon: "i-bowl",
    img: "images/asid.jpg",
    desc: "عصيد على أصوله يُقدّم ساخناً مع المرق واللحم أو الدجاج حسب اختيارك."
  },
  {
    id: 2,
    name: "روز مضغوط",
    price: 4000,
    cat: "popular",
    icon: "i-rice",
    img: "images/roz-madghout.jpg",
    desc: "روز مضغوط بنكهة البهارات الأصيلة، يُقدّم مع الدجاج أو اللحم."
  },
  {
    id: 3,
    name: "روز عادي",
    price: 3000,
    cat: "popular",
    icon: "i-rice",
    img: "images/roz.jpg",
    desc: "روز أبيض منسّق بطبقة خفيفة من البهارات، مناسب مع جميع الأطباق."
  },
  {
    id: 4,
    name: "فتة موز",
    price: 3500,
    cat: "popular",
    icon: "i-bowl",
    img: "images/fattah-mawz.jpg",
    desc: "فتة الموز الشعبية بمزيجها الأصيل، وجبة دسمة بطعم مميز."
  },
  {
    id: 5,
    name: "فتة عرائسي",
    price: 4000,
    cat: "popular",
    icon: "i-bowl",
    img: "images/fattah-arayes.jpg",
    desc: "فتة العرائسي المحضّرة على الطريقة الشعبية بنكهة غنية."
  },
  {
    id: 6,
    name: "دجاج شوية",
    price: 5000,
    cat: "grilled",
    icon: "i-flame",
    img: "images/chicken-shawiya.jpg",
    desc: "دجاج شوية بتتبيلة خاصة، طري ومشبع بطعم الشواية الأصيل."
  },
  {
    id: 7,
    name: "دجاج مسلوق",
    price: 4500,
    cat: "grilled",
    icon: "i-bowl",
    img: "images/chicken-maslouq.jpg",
    desc: "دجاج مسلوق بطريقة تقليدية مع المرق، خفيف وغني بالطعم."
  },
  {
    id: 8,
    name: "دجاج حنيد",
    price: 5500,
    cat: "grilled",
    icon: "i-flame",
    img: "images/chicken-haneed.jpg",
    desc: "دجاج حنيد مشوي ببطء على الطريقة التقليدية، طعم أصيل لا يُنسى."
  },
  {
    id: 9,
    name: "دجاج فحم",
    price: 6000,
    cat: "grilled",
    icon: "i-flame",
    img: "images/chicken-faham.jpg",
    desc: "دجاج فحم مشوي على الجمر، برائحة الشواية وطعم لا يُقاوم."
  },
  {
    id: 10,
    name: "سحاوق جبن",
    price: 1500,
    cat: "appetizer",
    icon: "i-chili",
    img: "images/sahawiq-cheese.jpg",
    desc: "سحاوق بالجبن الطازج، مقبلات حارة بنكهة متوازنة."
  },
  {
    id: 11,
    name: "سحاوق عادي",
    price: 1000,
    cat: "appetizer",
    icon: "i-chili",
    img: "images/sahawiq.jpg",
    desc: "سحاوق تقليدي بالطماطم والفلفل، مناسب مع جميع الأطباق."
  },
  {
    id: 12,
    name: "المشروبات الغازية",
    price: 500,
    cat: "drinks",
    icon: "i-cup",
    img: "images/soft-drinks.jpg",
    desc: "مشروب غازي مبرّد يُقدّم مع وجبتك."
  }
];

const MENU_BY_ID = new Map(MENU.map((dish) => [dish.id, dish]));

const state = {
  cart: [],
  filter: "all",
  search: ""
};

const $ = (selector, root = document) => root.querySelector(selector);
const $all = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function safeRead(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value === null ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    /* التخزين المحلي قد يكون معطلاً — نتجاهل بهدوء */
  }
}

function sanitizeCart(raw) {
  if (!Array.isArray(raw)) return [];
  const clean = new Map();
  for (const entry of raw) {
    const id = Number(entry && entry.id);
    const qty = Math.floor(Number(entry && entry.qty));
    if (!MENU_BY_ID.has(id) || !Number.isFinite(qty) || qty < 1) continue;
    clean.set(id, (clean.get(id) || 0) + qty);
  }
  return Array.from(clean, ([id, qty]) => ({ id, qty }));
}

function fmt(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("en-US")} ر.ي`;
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function iconMarkup(iconId, extraClass = "") {
  const cls = extraClass ? `icon ${extraClass}` : "icon";
  return `<svg class="${cls}" aria-hidden="true"><use href="#${iconId}"></use></svg>`;
}

/* ---------------- السلة ---------------- */

function cartQuantity(id) {
  const entry = state.cart.find((item) => item.id === id);
  return entry ? entry.qty : 0;
}

function updateCartTotals() {
  state.subtotal = state.cart.reduce((sum, entry) => {
    const dish = MENU_BY_ID.get(entry.id);
    return dish ? sum + dish.price * entry.qty : sum;
  }, 0);
  state.total = state.subtotal;
}

function persistCart() {
  safeWrite(STORAGE_KEYS.CART, state.cart);
}

function updateBadges() {
  const count = state.cart.reduce((sum, entry) => sum + entry.qty, 0);
  for (const badge of $all(".cart-badge")) {
    badge.textContent = count > 0 ? String(count) : "";
  }
}

function addToCart(id, amount = 1) {
  const dish = MENU_BY_ID.get(id);
  if (!dish) return;
  const entry = state.cart.find((item) => item.id === id);
  if (entry) {
    entry.qty = Math.min(99, entry.qty + amount);
  } else {
    state.cart.push({ id, qty: 1 });
  }
  persistCart();
  updateCartTotals();
  renderCart();
  updateBadges();
  syncCardQuantity(id);
  showToast(`أُضيف «${dish.name}» إلى السلة`);
}

function changeQuantity(id, delta) {
  const entry = state.cart.find((item) => item.id === id);
  if (!entry) {
    if (delta > 0) addToCart(id, delta);
    return;
  }
  entry.qty = Math.min(99, entry.qty + delta);
  if (entry.qty < 1) {
    state.cart = state.cart.filter((item) => item.id !== id);
  }
  persistCart();
  updateCartTotals();
  renderCart();
  updateBadges();
  syncCardQuantity(id);
}

function removeFromCart(id) {
  const dish = MENU_BY_ID.get(id);
  state.cart = state.cart.filter((item) => item.id !== id);
  persistCart();
  updateCartTotals();
  renderCart();
  updateBadges();
  syncCardQuantity(id);
  if (dish) showToast(`أُزيل «${dish.name}» من السلة`);
}

function clearCart() {
  state.cart = [];
  persistCart();
  updateCartTotals();
  renderCart();
  updateBadges();
  for (const dish of MENU) syncCardQuantity(dish.id);
  showToast("تم إفراغ السلة");
}

function syncCardQuantity(id) {
  const qty = cartQuantity(id);
  for (const card of $all(`.dish-card[data-id="${id}"]`)) {
    const number = $(".qty-num", card);
    const minus = $(".qty-minus", card);
    if (number) number.textContent = String(qty);
    if (minus) minus.disabled = qty <= 0;
  }
}

function renderCart() {
  const items = $("#cartItems");
  const totalValue = $("#cartTotalValue");
  const checkout = $("#cartCheckout");
  const clearBtn = $("#cartClear");
  if (!items || !totalValue || !checkout || !clearBtn) return;

  if (state.cart.length === 0) {
    items.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-icon">${iconMarkup("i-cart")}</span>
        <strong>سلتك فارغة</strong>
        <p>أضف أطباقك المفضلة من القائمة.</p>
        <button type="button" class="btn btn-primary btn-sm" id="goToMenuBtn">تصفح القائمة</button>
      </div>`;
    const goToMenu = $("#goToMenuBtn");
    if (goToMenu) {
      goToMenu.addEventListener("click", () => {
        closeCart();
        scrollToSection("menu");
      });
    }
    checkout.disabled = true;
    clearBtn.disabled = true;
  } else {
    const fragment = document.createDocumentFragment();
    for (const entry of state.cart) {
      const dish = MENU_BY_ID.get(entry.id);
      if (!dish) continue;
      const row = document.createElement("div");
      row.className = "cart-item";
      row.dataset.id = String(dish.id);
      row.innerHTML = `
        <span class="cart-item-img">${iconMarkup(dish.icon)}</span>
        <div class="cart-item-info">
          <strong>${dish.name}</strong>
          <span class="cart-item-price">${fmt(dish.price * entry.qty)}</span>
        </div>
        <div class="cart-item-actions">
          <span class="qty-box">
            <button type="button" class="qty-btn qty-minus" aria-label="إنقاص العدد">${iconMarkup("i-minus")}</button>
            <span class="qty-num">${entry.qty}</span>
            <button type="button" class="qty-btn qty-plus" aria-label="زيادة العدد">${iconMarkup("i-plus")}</button>
          </span>
          <button type="button" class="cart-item-remove" aria-label="حذف ${dish.name}">${iconMarkup("i-trash")}</button>
        </div>`;
      $(".qty-plus", row).addEventListener("click", () => changeQuantity(dish.id, 1));
      $(".qty-minus", row).addEventListener("click", () => changeQuantity(dish.id, -1));
      $(".cart-item-remove", row).addEventListener("click", () => removeFromCart(dish.id));
      fragment.appendChild(row);
    }
    items.replaceChildren(fragment);
    checkout.disabled = false;
    clearBtn.disabled = false;
  }

  totalValue.textContent = fmt(state.total);
  updateOrderModalTotals();
}

/* ---------------- القائمة ---------------- */

function renderDishCard(dish) {
  const card = document.createElement("article");
  card.className = "dish-card";
  card.dataset.id = String(dish.id);
  card.dataset.cat = dish.cat;
  const qty = cartQuantity(dish.id);
  const category = CATEGORIES[dish.cat] || "";
  const photo = dish.img
    ? `<img class="dish-photo" src="${dish.img}" alt="${dish.name}" loading="lazy" decoding="async" style="opacity:0" onload="this.style.opacity='1'" onerror="this.remove()">`
    : "";

  card.innerHTML = `
    <div class="dish-media">
      <span class="dish-fallback">${iconMarkup(dish.icon, "icon-lg")}</span>
      ${photo}
      <span class="dish-cat">${category}</span>
    </div>
    <div class="dish-body">
      <div class="dish-head">
        <h3 class="dish-name">${dish.name}</h3>
        <span class="dish-price">${fmt(dish.price)}</span>
      </div>
      <p class="dish-desc">${dish.desc || ""}</p>
      <div class="dish-footer">
        <span class="qty-box">
          <button type="button" class="qty-btn qty-minus" aria-label="إنقاص عدد ${dish.name}" ${qty <= 0 ? "disabled" : ""}>${iconMarkup("i-minus")}</button>
          <span class="qty-num">${qty}</span>
          <button type="button" class="qty-btn qty-plus" aria-label="زيادة عدد ${dish.name}">${iconMarkup("i-plus")}</button>
        </span>
        <button type="button" class="dish-add-btn">${iconMarkup("i-plus")} إضافة للسلة</button>
      </div>
    </div>`;

  $(".qty-plus", card).addEventListener("click", () => changeQuantity(dish.id, 1));
  $(".qty-minus", card).addEventListener("click", () => changeQuantity(dish.id, -1));
  $(".dish-add-btn", card).addEventListener("click", () => addToCart(dish.id));
  return card;
}

function normalizeSearch(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\u064B-\u0652]/g, "");
}

function renderMenu() {
  const grid = $("#menuGrid");
  const empty = $("#menuEmpty");
  if (!grid) return;
  const keywords = normalizeSearch(state.search);
  const fragment = document.createDocumentFragment();
  let count = 0;

  for (const [key, label] of Object.entries(CATEGORIES)) {
    if (state.filter !== "all" && state.filter !== key) continue;
    const dishes = MENU.filter((dish) => {
      if (dish.cat !== key) return false;
      if (!keywords) return true;
      const haystack = normalizeSearch(`${dish.name} ${dish.desc || ""} ${label}`);
      return haystack.includes(keywords);
    });
    if (dishes.length === 0) continue;

    const heading = document.createElement("h3");
    heading.className = "filter-heading";
    heading.textContent = label;
    fragment.appendChild(heading);

    for (const dish of dishes) {
      fragment.appendChild(renderDishCard(dish));
      count += 1;
    }
  }

  grid.replaceChildren(fragment);
  if (empty) empty.hidden = count > 0;
}

function setupMenuHandlers() {
  const search = $("#menuSearch");
  if (search) {
    search.addEventListener("input", (event) => {
      state.search = event.target.value;
      renderMenu();
    });
  }

  for (const button of $all(".filter-btn")) {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter || "all";
      for (const item of $all(".filter-btn")) {
        item.classList.toggle("active", item === button);
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      }
      renderMenu();
    });
  }
}

/* ---------------- واتساب والطلب ---------------- */

function buildWhatsAppUrl(message) {
  return `https://api.whatsapp.com/send?phone=${encodeURIComponent(CONFIG.WHATSAPP)}&text=${encodeURIComponent(message)}`;
}

function buildOrderSummaryHtml() {
  if (state.cart.length === 0) {
    return `<div class="order-summary-empty">السلة فارغة — أضف أطباقك أولاً.</div>`;
  }
  const rows = state.cart.map((entry) => {
    const dish = MENU_BY_ID.get(entry.id);
    if (!dish) return "";
    return `<div class="order-summary-row"><strong>${dish.name} × ${entry.qty}</strong><span>${fmt(dish.price * entry.qty)}</span></div>`;
  }).join("");
  return `${rows}<div class="order-summary-row total"><strong>الإجمالي</strong><span>${fmt(state.total)}</span></div>`;
}

function buildOrderMessage(data) {
  const lines = [];
  lines.push("─── طلب جديد ───");
  lines.push(CONFIG.NAME);
  lines.push(`الاسم: ${data.name}`);
  lines.push(`الجوال: ${data.phone}`);
  lines.push(`العنوان / الموقع: ${data.address}`);
  lines.push(`طريقة الاستلام: ${data.delivery === "delivery" ? "توصيل" : "داخل المطعم (استلام مباشر)"}`);
  lines.push("الأصناف:");
  for (const entry of state.cart) {
    const dish = MENU_BY_ID.get(entry.id);
    if (!dish) continue;
    lines.push(`• ${dish.name} × ${entry.qty} — ${fmt(dish.price * entry.qty)}`);
  }
  lines.push(`الإجمالي: ${fmt(state.total)} (بدون ضريبة)`);
  return lines.join("\n");
}

function updateOrderModalTotals() {
  const modal = $("#orderModal");
  if (!modal || modal.getAttribute("aria-hidden") !== "false") return;
  const total = $("#modalTotal");
  const summary = $("#orderSummary");
  if (total) total.textContent = fmt(state.total);
  if (summary) summary.innerHTML = buildOrderSummaryHtml();
}

function openOrderModal() {
  if (state.cart.length === 0) {
    showToast("أضف أطباقك إلى السلة أولاً");
    openCart();
    return;
  }
  const modal = $("#orderModal");
  const formBox = $("#modalFormBox");
  const successBox = $("#orderSuccessBox");
  const total = $("#modalTotal");
  const summary = $("#orderSummary");
  if (!modal || !formBox || !successBox) return;

  successBox.classList.remove("show");
  formBox.classList.remove("hidden");
  closeCart();
  if (total) total.textContent = fmt(state.total);
  if (summary) summary.innerHTML = buildOrderSummaryHtml();
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  setTimeout(() => {
    const nameInput = $("#modalName");
    if (nameInput) nameInput.focus();
  }, 120);
}

function closeOrderModal() {
  const modal = $("#orderModal");
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function handleOrderSubmit(event) {
  event.preventDefault();
  const name = ($("#modalName")?.value || "").trim();
  const phone = ($("#modalPhone")?.value || "").trim();
  const address = ($("#modalAddress")?.value || "").trim();
  const delivery = $("#modalDelivery")?.value || "pickup";

  if (!name) {
    showToast("من فضلك أدخل الاسم");
    $("#modalName")?.focus();
    return;
  }
  if (!/^\d{8,15}$/.test(phone)) {
    showToast("أدخل رقم جوال صحيح (أرقام فقط)");
    $("#modalPhone")?.focus();
    return;
  }
  if (!address) {
    showToast("أدخل العنوان أو اكتب: داخل المطعم");
    $("#modalAddress")?.focus();
    return;
  }
  if (state.cart.length === 0) {
    showToast("السلة فارغة");
    return;
  }

  const url = buildWhatsAppUrl(buildOrderMessage({ name, phone, address, delivery }));
  closeOrderModal();
  window.open(url, "_blank", "noopener,noreferrer");
  showToast("جارٍ فتح واتساب لإرسال الطلب…");
}

function handleConfirmOrder() {
  if (state.cart.length === 0) {
    showToast("السلة فارغة");
    return;
  }
  const name = ($("#modalName")?.value || "").trim();
  const phone = ($("#modalPhone")?.value || "").trim();
  if (!name) {
    showToast("من فضلك أدخل الاسم");
    $("#modalName")?.focus();
    return;
  }
  if (!/^\d{8,15}$/.test(phone)) {
    showToast("أدخل رقم جوال صحيح (أرقام فقط)");
    $("#modalPhone")?.focus();
    return;
  }
  const orders = safeRead(STORAGE_KEYS.ORDERS, []);
  const list = Array.isArray(orders) ? orders : [];
  const orderNumber = `ORD-${String(list.length + 1).padStart(4, "0")}`;
  const order = {
    number: orderNumber,
    date: new Date().toISOString(),
    name,
    phone,
    address: ($("#modalAddress")?.value || "").trim() || CONFIG.ADDRESS,
    delivery: $("#modalDelivery")?.value || "pickup",
    items: state.cart.map((entry) => {
      const dish = MENU_BY_ID.get(entry.id);
      return { id: entry.id, name: dish?.name || "", price: dish?.price || 0, qty: entry.qty };
    }),
    total: state.total
  };

  safeWrite(STORAGE_KEYS.ORDERS, [...list, order]);

  const note = $("#orderSuccessNote");
  if (note) {
    note.textContent = `تم استلام طلبك، وسنتواصل معك لتأكيده. رقم الطلب: ${orderNumber}`;
  }
  $("#orderSuccessBox")?.classList.add("show");
  $("#modalFormBox")?.classList.add("hidden");

  state.cart = [];
  persistCart();
  updateCartTotals();
  renderCart();
  updateBadges();
  for (const dish of MENU) syncCardQuantity(dish.id);
  showToast(`تم تأكيد الطلب — رقم الطلب: ${orderNumber}`);
}

/* ---------------- الحجز ---------------- */

function pad2(value) {
  return String(value).padStart(2, "0");
}

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

function buildBookingMessage(data) {
  return [
    "─── طلب حجز طاولة ───",
    CONFIG.NAME,
    `الاسم: ${data.name}`,
    `الجوال: ${data.phone}`,
    `التاريخ: ${data.date}`,
    `الوقت: ${data.time}`,
    `عدد الأشخاص: ${data.guests}`,
    data.note ? `ملاحظة: ${data.note}` : "",
    `الموقع: ${CONFIG.ADDRESS}`
  ].filter(Boolean).join("\n");
}

function setupReservation() {
  const form = $("#reservationForm");
  const dateInput = $("#rDate");
  const timeInput = $("#rTime");
  const errorBox = $("#reservationError");
  const successBox = $("#reservationSuccess");
  if (!form || !dateInput || !timeInput) return;

  dateInput.min = todayString();

  function populateTimes() {
    const selectedDate = dateInput.value;
    timeInput.innerHTML = `<option value="" selected disabled>اختر الوقت</option>`;
    let minutes = 12 * 60;

    if (selectedDate === todayString()) {
      const now = new Date();
      minutes = Math.ceil((now.getHours() * 60 + now.getMinutes() + 30) / 30) * 30;
    }

    const options = [];
    for (; minutes < 23 * 60 + 30; minutes += 30) {
      const option = document.createElement("option");
      option.value = `${pad2(Math.floor(minutes / 60) % 24)}:${pad2(minutes % 60)}`;
      option.textContent = option.value;
      options.push(option);
    }
    for (const option of options) timeInput.appendChild(option);
    if (options.length > 0) {
      timeInput.value = options[0].value;
    } else {
      const none = document.createElement("option");
      none.value = "";
      none.disabled = true;
      none.selected = true;
      none.textContent = "لا توجد أوقات متاحة اليوم، اختر يوماً آخر";
      timeInput.appendChild(none);
    }
    return options.length;
  }

  function setDefaultDate() {
    dateInput.value = todayString();
    if (populateTimes() > 0) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = `${tomorrow.getFullYear()}-${pad2(tomorrow.getMonth() + 1)}-${pad2(tomorrow.getDate())}`;
    populateTimes();
  }

  setDefaultDate();
  dateInput.addEventListener("change", populateTimes);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (errorBox) {
      errorBox.textContent = "";
      errorBox.style.display = "none";
    }

    const data = {
      name: $("#rName")?.value.trim() || "",
      phone: $("#rPhone")?.value.trim() || "",
      date: dateInput.value,
      time: timeInput.value,
      guests: $("#rGuests")?.value || "",
      note: $("#rNote")?.value.trim() || ""
    };

    const fail = (message) => {
      if (errorBox) {
        errorBox.textContent = message;
        errorBox.style.display = "block";
        errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      showToast(message);
    };

    if (!data.name) return fail("ادخل الاسم الكامل");
    if (!/^\d{8,15}$/.test(data.phone)) return fail("ادخل رقم جوال صحيح (أرقام فقط)");
    if (!data.date) return fail("اختر التاريخ");
    if (!data.time) return fail("اختر الوقت");
    if (!data.guests) return fail("اختر عدد الأشخاص");

    const bookings = safeRead(STORAGE_KEYS.BOOKINGS, []);
    const list = Array.isArray(bookings) ? bookings : [];
    safeWrite(STORAGE_KEYS.BOOKINGS, [...list, { ...data, created: new Date().toISOString() }]);

    if (successBox) successBox.style.display = "block";
    form.reset();
    dateInput.min = todayString();
    setDefaultDate();

    showToast("تم تسجيل طلب الحجز بنجاح");
    form.scrollIntoView({ behavior: "smooth", block: "center" });

    window.open(buildWhatsAppUrl(buildBookingMessage(data)), "_blank", "noopener,noreferrer");
  });
}

/* ---------------- الواجهة والتنقل ---------------- */

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openCart() {
  const drawer = $("#cartDrawer");
  const overlay = $("#cartOverlay");
  if (!drawer || !overlay) return;
  closeMobileNav();
  renderCart();
  updateBadges();
  drawer.classList.add("open");
  overlay.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
  setTimeout(() => $("#cartClose")?.focus(), 120);
}

function closeCart() {
  const drawer = $("#cartDrawer");
  const overlay = $("#cartOverlay");
  if (!drawer || !overlay) return;
  drawer.classList.remove("open");
  overlay.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}

function setupCartHandlers() {
  $("#cartToggleBtn")?.addEventListener("click", openCart);
  $("#cartToggleMobile")?.addEventListener("click", openCart);
  $("#cartClose")?.addEventListener("click", closeCart);
  $("#cartOverlay")?.addEventListener("click", closeCart);
  $("#cartClear")?.addEventListener("click", clearCart);
  $("#cartCheckout")?.addEventListener("click", openOrderModal);
  $("#heroOrderBtn")?.addEventListener("click", openCart);
  $("#quickOrderBtn")?.addEventListener("click", openCart);

  $("#orderModalClose")?.addEventListener("click", closeOrderModal);
  $("#orderModalBackdrop")?.addEventListener("click", closeOrderModal);
  $("#orderSuccessClose")?.addEventListener("click", closeOrderModal);
  $("#orderForm")?.addEventListener("submit", handleOrderSubmit);
  $("#orderConfirmBtn")?.addEventListener("click", handleConfirmOrder);

  $("#footerTopLink")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  $("#backToTop")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  $("#whatsappCta")?.addEventListener("click", () => {
    const message = `أرغب في التواصل مع ${CONFIG.NAME} — ${CONFIG.ADDRESS}. كيف يمكنكم مساعدتي؟`;
    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const modal = $("#orderModal");
    if (modal && modal.getAttribute("aria-hidden") === "false") {
      closeOrderModal();
      return;
    }
    const drawer = $("#cartDrawer");
    if (drawer && drawer.classList.contains("open")) {
      closeCart();
      return;
    }
    closeMobileNav();
  });
}

function closeMobileNav() {
  const toggle = $("#navToggle");
  const menu = $("#navMenu");
  if (!toggle || !menu) return;
  menu.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "فتح قائمة التنقل");
  document.body.classList.remove("nav-open");
}

function setupNav() {
  const toggle = $("#navToggle");
  const menu = $("#navMenu");
  if (!toggle || !menu) return;

  const openNav = () => {
    menu.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "إغلاق قائمة التنقل");
    document.body.classList.add("nav-open");
  };

  toggle.addEventListener("click", () => {
    if (menu.classList.contains("open")) closeMobileNav();
    else openNav();
  });

  for (const link of $all("a", menu)) {
    link.addEventListener("click", closeMobileNav);
  }

  document.addEventListener("click", (event) => {
    if (!menu.classList.contains("open")) return;
    if (menu.contains(event.target) || toggle.contains(event.target)) return;
    closeMobileNav();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) closeMobileNav();
  });
}

function setupAnchorLinks() {
  for (const link of $all('a[href^="#"]')) {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      if (window.innerWidth <= 960) closeMobileNav();
      if ($("#cartDrawer")?.classList.contains("open")) closeCart();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function setupScrollSpy() {
  const links = $all(".nav-link");
  const sections = links
    .map((link) => ({ link, id: link.getAttribute("href")?.slice(1) || "" }))
    .filter((item) => item.id);
  const backToTop = $("#backToTop");
  let ticking = false;

  function update() {
    const offset = window.scrollY + 140;
    let activeId = sections[0]?.id || "home";
    for (const { id } of sections) {
      const section = document.getElementById(id);
      if (!section) continue;
      if (section.offsetTop <= offset) activeId = id;
    }
    for (const { link, id } of sections) {
      link.classList.toggle("active", id === activeId);
    }
    if (backToTop) backToTop.classList.toggle("show", window.scrollY > 320);
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}

function setupReveal() {
  const elements = $all(".reveal");
  if (elements.length === 0) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    for (const element of elements) element.classList.add("in");
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("in");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08, rootMargin: "0px 0px -50px 0px" });

  for (const element of elements) observer.observe(element);
}

/* ---------------- التشغيل ---------------- */

function init() {
  state.cart = sanitizeCart(safeRead(STORAGE_KEYS.CART, []));
  updateCartTotals();
  renderMenu();
  renderCart();
  updateBadges();

  setupMenuHandlers();
  setupCartHandlers();
  setupNav();
  setupAnchorLinks();
  setupScrollSpy();
  setupReveal();
  setupReservation();

  for (const button of $all(".filter-btn")) {
    button.setAttribute("aria-pressed", button.classList.contains("active") ? "true" : "false");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
