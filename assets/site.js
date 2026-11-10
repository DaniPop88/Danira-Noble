(function () {
  'use strict';

  var CATALOG = {
    1: { name: "Rice 5kg", price: 350, stock: 10, img: "01-rice-5kg" },
    2: { name: "Laundry Detergent 1L", price: 89, stock: 8, img: "02-laundry-detergent-1l" },
    3: { name: "Instant Noodles 5-Pack", price: 52.5, stock: 15, img: "03-instant-noodles-5-pack" },
    4: { name: "Sardines (Can)", price: 24, stock: 7, img: "04-sardines-can" },
    5: { name: "Bath Soap (Pack of 3)", price: 63, stock: 12, img: "05-bath-soap-pack-of-3" },
    6: { name: "Notebook (100 pages)", price: 25, stock: 5, img: "06-notebook-100-pages" },
    7: { name: "Cooking Oil 1L", price: 98, stock: 6, img: "07-cooking-oil-1l" },
    8: { name: "Biscuits Assorted Pack", price: 49, stock: 9, img: "08-biscuits-assorted-pack" },
    9: { name: "Face Mask (10pcs)", price: 38, stock: 10, img: "09-face-mask-10pcs" },
    10: { name: "Shampoo 200ml", price: 45, stock: 8, img: "10-shampoo-200ml" },
    11: { name: "Ballpen (Box of 12)", price: 68, stock: 14, img: "11-ballpen-box-of-12" },
    12: { name: "Dishwashing Liquid 500ml", price: 36, stock: 7, img: "12-dishwashing-liquid-500ml" },
    13: { name: "Powdered Juice (10 sachets)", price: 57, stock: 11, img: "13-powdered-juice-10-sachets" },
    14: { name: "T-Shirt (Assorted)", price: 120, stock: 13, img: "14-t-shirt-assorted" },
    15: { name: "Plastic Storage Box", price: 180, stock: 6, img: "15-plastic-storage-box" }
  };
  var CART_KEY = 'checkoutCart';
  var ORDER_EMAIL = 'support@daniranoble.online';

  function $(id) { return document.getElementById(id); }
  function num(n) {
    var c = Math.round(n * 100);
    return c % 100 === 0 ? (c / 100).toLocaleString('en-PH') : (c / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function peso(n) { return '₱' + num(n); }
  function priceHTML(n) { return '<span class="cur">₱</span>' + num(n); }
  function icon(name) { return '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"></use></svg>'; }

  function readCart() {
    try {
      var items = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      if (!Array.isArray(items)) return [];
      return items.filter(function (i) { return CATALOG[i.id] && i.qty > 0; }).map(function (i) {
        return { id: i.id, qty: Math.min(Math.floor(i.qty), CATALOG[i.id].stock) };
      });
    } catch (e) { return []; }
  }
  var cart = readCart();
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* works for this page view */ }
  }
  function line(id) { return cart.filter(function (i) { return i.id === id; })[0]; }
  function cartQty() { return cart.reduce(function (t, i) { return t + i.qty; }, 0); }
  function cartTotal() { return cart.reduce(function (t, i) { return t + i.qty * CATALOG[i.id].price; }, 0); }

  function setQty(id, qty) {
    var item = line(id);
    qty = Math.min(qty, CATALOG[id].stock);
    if (qty <= 0) cart = cart.filter(function (i) { return i.id !== id; });
    else if (item) item.qty = qty;
    else cart.push({ id: id, qty: qty });
    saveCart();
    render();
  }

  /* Menu */
  var navList = $('nav-list');
  var navToggle = $('nav-toggle');
  function closeNav() {
    if (!navList || !navList.classList.contains('open')) return;
    navList.classList.remove('open');
    document.body.style.overflow = '';
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.focus();
  }
  if (navList && navToggle) {
    navToggle.addEventListener('click', function () {
      navList.classList.add('open');
      document.body.style.overflow = 'hidden';
      navToggle.setAttribute('aria-expanded', 'true');
      $('nav-close').focus();
    });
    $('nav-close').addEventListener('click', closeNav);
    navList.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
  }

  /* Cart */
  var sidebar = $('cart-sidebar');
  var overlay = $('cart-overlay');
  var cartBtn = $('cart-btn');
  function openCart() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    sidebar.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    $('cart-close-btn').focus();
  }
  function closeCart() {
    if (!sidebar.classList.contains('open')) return;
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    sidebar.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    cartBtn.focus();
  }
  function renderCart() {
    document.querySelectorAll('.cart-count').forEach(function (el) { el.textContent = cartQty(); });
    if (!sidebar) return;
    var box = $('cart-items');
    box.innerHTML = '';
    $('cart-foot').hidden = !cart.length;
    if (!cart.length) {
      box.innerHTML = '<div class="cart-empty"><p>Your cart is empty.</p><a class="btn" href="#shop" id="cart-empty-shop">See the products</a></div>';
      $('cart-empty-shop').addEventListener('click', closeCart);
      return;
    }
    cart.forEach(function (item) {
      var p = CATALOG[item.id];
      var row = document.createElement('div');
      row.className = 'cart-item';
      row.dataset.id = item.id;
      row.innerHTML =
        '<img src="image/site/products/' + p.img + '-thumb.webp" alt="" width="72" height="72">' +
        '<div><h3>' + p.name + '</h3>' +
        '<div class="cart-item-row"><span class="qty">' +
        '<button type="button" data-a="dec" aria-label="Remove one ' + p.name + '">' + icon('minus') + '</button>' +
        '<output aria-label="Quantity">' + item.qty + '</output>' +
        '<button type="button" data-a="inc" aria-label="Add one more ' + p.name + '"' + (item.qty >= p.stock ? ' disabled' : '') + '>' + icon('plus') + '</button>' +
        '</span><span class="cart-item-sub">' + peso(p.price * item.qty) + '</span></div>' +
        '<button type="button" class="cart-remove" data-a="rm">Remove</button></div>';
      row.querySelector('[data-a=dec]').addEventListener('click', function () { setQty(item.id, item.qty - 1); focusLine(item.id, 'dec'); });
      row.querySelector('[data-a=inc]').addEventListener('click', function () { setQty(item.id, item.qty + 1); focusLine(item.id, 'inc'); });
      row.querySelector('[data-a=rm]').addEventListener('click', function () { setQty(item.id, 0); $('cart-close-btn').focus(); });
      box.appendChild(row);
    });
    $('cart-total').innerHTML = priceHTML(cartTotal());
  }
  function focusLine(id, action) {
    var row = document.querySelector('.cart-item[data-id="' + id + '"]');
    var btn = row && row.querySelector('[data-a=' + action + ']');
    if (btn && !btn.disabled) btn.focus(); else $('cart-close-btn').focus();
  }
  if (sidebar) {
    sidebar.setAttribute('aria-hidden', 'true');
    cartBtn.addEventListener('click', openCart);
    $('cart-close-btn').addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);
    sidebar.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = sidebar.querySelectorAll('a[href], button:not([disabled])');
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    $('checkout-btn').addEventListener('click', function () {
      saveCart();
      window.location.href = 'order-summary.html';
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (sidebar) closeCart();
    closeNav();
  });

  /* Products */
  function renderProducts() {
    document.querySelectorAll('.product-card').forEach(function (card) {
      var id = Number(card.dataset.id);
      var item = line(id);
      card.classList.toggle('in-cart', !!item);
      card.querySelector('.product-add').hidden = !!item;
      var stepper = card.querySelector('.stepper');
      stepper.hidden = !item;
      if (item) {
        stepper.querySelector('output').textContent = item.qty;
        stepper.querySelector('[data-a=inc]').disabled = item.qty >= CATALOG[id].stock;
      }
    });
  }
  function note(id) {
    if (cartBtn) { cartBtn.classList.remove('pop'); void cartBtn.offsetWidth; cartBtn.classList.add('pop'); }
    if (window.danSprint) window.danSprint();
    var live = $('cart-live');
    if (live) live.textContent = CATALOG[id].name + ' updated. ' + cartQty() + ' items in your cart.';
  }
  document.querySelectorAll('.product-card').forEach(function (card) {
    var id = Number(card.dataset.id);
    var add = card.querySelector('.product-add');
    var stepper = card.querySelector('.stepper');
    add.addEventListener('click', function () {
      setQty(id, 1); note(id);
      stepper.querySelector('[data-a=inc]').focus();
    });
    stepper.querySelector('[data-a=inc]').addEventListener('click', function () {
      setQty(id, line(id).qty + 1); note(id);
    });
    stepper.querySelector('[data-a=dec]').addEventListener('click', function () {
      setQty(id, line(id).qty - 1); note(id);
      if (line(id)) stepper.querySelector('[data-a=dec]').focus(); else add.focus();
    });
  });

  /* Order page */
  function renderOrder() {
    var body = $('summary-cart-body');
    if (!body || !$('order-sent').hidden) return;
    if (!cart.length) {
      $('order-layout').hidden = true;
      $('order-empty').hidden = false;
      return;
    }
    body.innerHTML = '';
    cart.forEach(function (item) {
      var p = CATALOG[item.id];
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + p.name + '<small>' + item.qty + ' × ' + peso(p.price) + '</small></td><td>' + peso(p.price * item.qty) + '</td>';
      body.appendChild(tr);
    });
    $('summary-cart-total').innerHTML = priceHTML(cartTotal());
  }
  var MESSAGES = {
    'customer-name': 'Please enter your full name.',
    'customer-contact': 'Enter a mobile number like 09171234567 or +639171234567.',
    'customer-address': 'Please enter your delivery address.',
    'customer-payment': 'Please choose how you would like to pay.'
  };
  function checkField(id) {
    var el = $(id);
    var ok = el.value.trim() !== '' && el.checkValidity();
    $(id + '-error').textContent = ok ? '' : MESSAGES[id];
    if (ok) el.removeAttribute('aria-invalid'); else el.setAttribute('aria-invalid', 'true');
    return ok;
  }
  function orderText() {
    var lines = ['New order from daniranoble.online', ''];
    cart.forEach(function (i) {
      var p = CATALOG[i.id];
      lines.push(i.qty + ' x ' + p.name + ' - PHP ' + num(p.price * i.qty));
    });
    lines.push('', 'Total: PHP ' + num(cartTotal()), '');
    lines.push('Name: ' + $('customer-name').value.trim(), 'Mobile: ' + $('customer-contact').value.trim());
    var email = $('customer-email').value.trim();
    if (email) lines.push('Email: ' + email);
    lines.push('Address: ' + $('customer-address').value.trim(), 'Payment: ' + $('customer-payment').value);
    var notes = $('customer-notes').value.trim();
    if (notes) lines.push('Notes: ' + notes);
    return lines.join('\n');
  }
  var form = $('checkout-form');
  if (form) {
    form.noValidate = true;
    Object.keys(MESSAGES).forEach(function (id) {
      function recheck() { if ($(id).hasAttribute('aria-invalid')) checkField(id); }
      $(id).addEventListener('input', recheck);
      $(id).addEventListener('change', recheck);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(MESSAGES).forEach(function (id) {
        if (!checkField(id) && !firstBad) firstBad = $(id);
      });
      if (firstBad) { firstBad.focus(); return; }
      var text = orderText();
      var href = 'mailto:' + ORDER_EMAIL + '?subject=' + encodeURIComponent('New order: ' + $('customer-name').value.trim()) + '&body=' + encodeURIComponent(text);
      $('sent-email').href = href;
      $('sent-text').textContent = text;
      $('order-layout').hidden = true;
      $('order-intro').hidden = true;
      $('order-sent').hidden = false;
      $('order-sent-title').focus();
      window.scrollTo(0, 0);
      window.location.href = href;
    });
    $('sent-copy-btn').addEventListener('click', function () {
      var btn = this;
      var text = $('sent-text').textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () { btn.textContent = 'Copied'; }, function () { btn.textContent = 'Select the text below to copy'; });
      } else { btn.textContent = 'Select the text below to copy'; }
    });
  }

  /* The track: the runner moves with scroll progress; laps light up as you pass each section */
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var track = document.querySelector('.track'), runner = document.querySelector('.runner');
  var laps = Array.prototype.slice.call(document.querySelectorAll('.lap'));
  var secs = laps.map(function (a) { return document.getElementById(a.dataset.lap); });
  var ticking = false;
  function paintTrack() {
    ticking = false;
    var max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    if (track) track.style.setProperty('--p', p.toFixed(4));
    var cur = 0;
    secs.forEach(function (s, k) { if (s && s.getBoundingClientRect().top <= innerHeight * .45) cur = k; });
    laps.forEach(function (a, k) {
      a.classList.toggle('passed', k <= cur);
      if (k === cur) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(paintTrack); } }, { passive: true });
  addEventListener('resize', paintTrack);
  paintTrack();
  /* Each add: the runner dashes and a +1 pops at the scoreboard */
  window.danSprint = function () {
    if (still || !runner) return;
    runner.classList.remove('dash'); void runner.offsetWidth; runner.classList.add('dash');
    var b = $('cart-btn'); if (!b) return;
    var t = document.createElement('span'); t.className = 'plus-one'; t.textContent = '+1'; t.setAttribute('aria-hidden', 'true');
    b.appendChild(t); setTimeout(function () { t.remove(); }, 900);
  };

  function render() {
    renderCart();
    renderProducts();
    renderOrder();
  }
  document.querySelectorAll('.footer-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  render();
})();
