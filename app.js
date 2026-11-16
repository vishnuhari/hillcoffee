/**
 * The Hills Coffee Co. - Interactive Application Logic
 * Handles Coffee Finder Quiz, Cart management, WhatsApp integration & UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initFilterTabs();
  initCoffeeFinder();
  initCart();
  initBrewLinks();
});

// ==========================================
// 1. Mobile Menu Handling
// ==========================================
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  const links = document.querySelectorAll('.mobile-link');

  if (!menuBtn || !drawer) return;

  menuBtn.addEventListener('click', () => {
    drawer.classList.toggle('open');
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
    });
  });
}

// ==========================================
// 2. Taste Filter Tabs (All / Black / Milk / Blend)
// ==========================================
function initFilterTabs() {
  const tabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.product-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.3s ease-out';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ==========================================
// 3. WhatsApp Interactive Coffee Helper
// ==========================================
function initCoffeeFinder() {
  const options = document.querySelectorAll('.quiz-opt-btn');
  const recContainer = document.getElementById('waRecommendation');
  const sendWhatsAppBtn = document.getElementById('sendWhatsAppBtn');
  const userBrewerInput = document.getElementById('userBrewer');
  const userAreaInput = document.getElementById('userArea');

  let selectedCoffee = 'Idukki Arabica';
  let selectedNumber = '1';

  const coffeeDetails = {
    arabica: {
      num: '1',
      name: 'Idukki Arabica (250g)',
      color: '#1B3A2B',
      tag: '📧 The Meeting Survivor • Zen Pour-Over',
      desc: 'Smooth and aromatic with delicate chocolate & spice notes. Grown under shade with pepper and cardamom. The ultimate companion for surviving 60-minute slide decks.',
      price: 460
    },
    robusta: {
      num: '2',
      name: 'Idukki Robusta (250g)',
      color: '#162E44',
      tag: '⏰ The Snooze Nemesis • Turbo Caffeine',
      desc: 'GI-tagged Kerala champion with 2x natural caffeine. Bold, velvety crema, thick mouthfeel. Defibrillates your sleepy soul in two sips.',
      price: 420
    },
    blend: {
      num: '3',
      name: 'Idukki Blend (250g)',
      color: '#B58B5C',
      tag: '🐢 The Late-Friend Companion • All-Rounder',
      desc: 'The harmonious union of Arabica and Robusta. Never gets bitter as it cools down, keeping your blood pressure chill while waiting on that friend.',
      price: 440
    },
    trio: {
      num: '4',
      name: 'Trio Tasting Pack (3 x 250g)',
      color: '#7B2CBF',
      tag: '🛌 Weekend Bed Cocoon • All 3 Single Origins',
      desc: 'Why pick one when you have 48 hours in bed? Arabica for morning reading, Robusta for midday fuel, and Blend for the afternoon movie.',
      price: 1320
    }
  };

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(b => b.classList.remove('selected'));
      opt.classList.add('selected');

      const matchKey = opt.getAttribute('data-match');
      const data = coffeeDetails[matchKey];
      if (!data) return;

      selectedCoffee = data.name;
      selectedNumber = data.num;

      // Render recommendation card
      recContainer.innerHTML = `
        <div class="recommendation-card" style="border-left: 4px solid ${data.color}">
          <span class="rec-badge">${data.tag}</span>
          <h4 class="rec-title">${data.name} &mdash; ₹${data.price}</h4>
          <p class="rec-desc">${data.desc}</p>
          <div class="rec-actions">
            <button class="btn btn-primary" onclick="quickAddRecommendation('${data.name}', ${data.price})">
              Add to Bag (₹${data.price})
            </button>
            <a href="#collection" class="btn btn-outline" style="border-color: ${data.color}">
              View Collection
            </a>
          </div>
        </div>
      `;
    });
  });

  // Default selection is option 1
  if (options.length > 0) {
    options[0].click();
  }

  // Generate Direct WhatsApp Chat Link
  sendWhatsAppBtn.addEventListener('click', () => {
    const brewer = userBrewerInput.value.trim() || 'Not specified';
    const area = userAreaInput.value.trim() || 'India';

    const message = `Hello The Hills Coffee Co! ☕👋\n\nLife happens! I used your online helper to find my coffee match:\n• Selected Crisis / Choice: Option ${selectedNumber} (${selectedCoffee})\n• My Brewer: ${brewer}\n• Delivery City/Area: ${area}\n\nPlease share how I can order a freshly roasted batch.`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919074576756?text=${encodedMsg}`;

    window.open(whatsappUrl, '_blank');
  });
}

// Quick add helper for recommendation card & scenarios
window.quickAddRecommendation = function(productName, price) {
  let grind = 'Medium All-Rounder';
  if (productName.includes('Arabica')) grind = 'Pour Over / Chemex';
  if (productName.includes('Robusta')) grind = 'South Indian Filter';
  if (productName.includes('Trio')) grind = 'All-Rounder Sampler';

  addToCart(productName, price, grind);
};

window.quickAddTrio = function() {
  addToCart('Trio Tasting Pack (3 x 250g)', 1320, 'All-Rounder Sampler');
};

window.filterByProduct = function(productId) {
  const targetCard = document.querySelector(`.product-card[data-id="${productId}"]`);
  const collectionSection = document.getElementById('collection');
  if (collectionSection) {
    collectionSection.scrollIntoView({ behavior: 'smooth' });
  }
  if (targetCard) {
    setTimeout(() => {
      targetCard.classList.add('card-highlight-pulse');
      setTimeout(() => {
        targetCard.classList.remove('card-highlight-pulse');
      }, 2500);
    }, 500);
  }
};

// ==========================================
// 4. Shopping Bag & Checkout Logic
// ==========================================
let cart = [];

function initCart() {
  const triggerBtn = document.getElementById('cartTriggerBtn');
  const closeBtn = document.getElementById('cartCloseBtn');
  const backdrop = document.getElementById('cartBackdrop');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const addButtons = document.querySelectorAll('.add-to-cart-btn');

  triggerBtn.addEventListener('click', openCart);
  closeBtn.addEventListener('click', closeCart);
  backdrop.addEventListener('click', closeCart);

  addButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-product');
      const price = parseInt(btn.getAttribute('data-price'), 10);
      const selectId = btn.getAttribute('data-select');
      const selectElem = document.getElementById(selectId);
      const grind = selectElem ? selectElem.value : 'Whole Bean';

      addToCart(name, price, grind);
    });
  });

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your coffee bag is lonely! Pick some beans.');
      return;
    }

    let itemsSummary = cart.map(item => `• ${item.name} (${item.grind}) x ${item.quantity} = ₹${item.price * item.quantity}`).join('\n');
    let total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    let message = `Hello The Hills Coffee Co! ☕\n\nLife happens, coffee helps! I'd like to place an order from your website:\n\n${itemsSummary}\n\n*Total Amount:* ₹${total}\n\nPlease confirm availability and payment details. Thank you!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919074576756?text=${encoded}`, '_blank');
  });
}

function addToCart(name, price, grind) {
  const existingIndex = cart.findIndex(item => item.name === name && item.grind === grind);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      id: Date.now() + Math.random(),
      name,
      price,
      grind,
      quantity: 1
    });
  }

  updateCartUI();

  let funToast = `☕ Added ${name} to your bag!`;
  if (name.includes('Arabica')) {
    funToast = `☕ Meeting survivor! Added ${name} to your bag.`;
  } else if (name.includes('Robusta')) {
    funToast = `⚡ Snooze nemesis engaged! Added ${name} to your bag.`;
  } else if (name.includes('Blend')) {
    funToast = `✨ Late-friend patience unlocked! Added ${name} to your bag.`;
  } else if (name.includes('Trio')) {
    funToast = `🛌 Bed-bound weekend secured! Added Trio Pack to your bag.`;
  }
  showToast(funToast);
  openCart();
}

function updateCartUI() {
  const cartList = document.getElementById('cartList');
  const emptyMsg = document.getElementById('emptyCartMessage');
  const cartTotal = document.getElementById('cartTotal');
  const cartCount = document.getElementById('cartCount');

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  cartCount.textContent = totalItems;
  cartTotal.textContent = `₹${totalPrice}`;

  if (cart.length === 0) {
    emptyMsg.style.display = 'flex';
    cartList.innerHTML = '';
  } else {
    emptyMsg.style.display = 'none';
    cartList.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-grind">Grind: ${item.grind}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateQty(${item.id}, -1)">&minus;</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="updateQty(${item.id}, 1)">&#43;</button>
          </div>
        </div>
        <div class="cart-item-price">₹${item.price * item.quantity}</div>
      </div>
    `).join('');
  }
}

window.updateQty = function(id, change) {
  const index = cart.findIndex(item => item.id === id);
  if (index > -1) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    updateCartUI();
  }
};

window.openCart = function() {
  const drawer = document.getElementById('cartDrawer');
  if (drawer) {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
  }
};

window.closeCart = function() {
  const drawer = document.getElementById('cartDrawer');
  if (drawer) {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }
};

// ==========================================
// 5. Brew Info Buttons & Navigation
// ==========================================
function initBrewLinks() {
  const brewButtons = document.querySelectorAll('.quick-brew-btn');

  brewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      const brewSection = document.getElementById('brew-guide');

      if (brewSection) {
        brewSection.scrollIntoView({ behavior: 'smooth' });

        // Highlight matching method card
        setTimeout(() => {
          const methodCards = document.querySelectorAll('.brew-method-card');
          methodCards.forEach(c => c.style.outline = 'none');

          let cardIndex = 0;
          if (target === 'robusta') cardIndex = 0; // Filter
          if (target === 'arabica') cardIndex = 1; // Pour over
          if (target === 'blend') cardIndex = 2;   // French press

          if (methodCards[cardIndex]) {
            methodCards[cardIndex].style.outline = '3px solid #E2BC7A';
            setTimeout(() => {
              methodCards[cardIndex].style.outline = 'none';
            }, 2500);
          }
        }, 500);
      }
    });
  });
}

// ==========================================
// 6. Toast Notification Helper
// ==========================================
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
