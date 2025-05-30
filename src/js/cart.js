import { getLocalStorage, setLocalStorage, loadHeaderFooter, updateCartCount } from "./utils.mjs";
loadHeaderFooter();
function totalPrice(cartList) {
  let total = 0;
  cartList.forEach(item => {
    total += item.ListPrice;
  });
  // Format the total to 2 decimal places (nearest cent)
  const formattedTotal = total.toFixed(2);
  document.querySelector(".cart-total").innerHTML = `<strong>Total: </strong>$${formattedTotal}`
}

function removeFromCart(id) {
  let cart = getLocalStorage("so-cart");
  if (!cart || !Array.isArray(cart)) return;
  // Remove only the first matching item (in case of duplicates)
  const idx = cart.findIndex((item) => item.Id === id);
  if (idx > -1) {
    cart.splice(idx, 1);
    setLocalStorage("so-cart", cart);
    renderCartContents();
    // updateCartCount will be called by renderCartContents
  }
}

function renderCartContents() {
  // Get cart items from localStorage
  const cartItems = getLocalStorage("so-cart");
  const productListElement = document.querySelector(".product-list");
  const cartTotalElement = document.querySelector(".cart-total");
  const checkoutButton = document.querySelector(".checkout");
  
  // Handle empty cart gracefully
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    // Show empty cart message with animation and continue shopping button
    productListElement.innerHTML = `
      <li class="empty-cart-message">
        <p>Your cart is looking a little empty...</p>
        <p>Ready to find your next adventure?</p>
        <a href="/index.html" class="continue-shopping">Continue Shopping</a>
      </li>`;
    
    // Hide checkout button and update total
    if (checkoutButton) {
      checkoutButton.style.display = 'none';
    }
    if (cartTotalElement) {
      cartTotalElement.innerHTML = '<strong>Subtotal:</strong> $0.00';
    }
    return; // Exit function early
  } else if (checkoutButton) {
    // Make sure checkout button is visible when there are items
    checkoutButton.style.display = 'inline-block';
  }
  
  // If we have items, render them
  try {
    const htmlItems = cartItems.map((item) => cartItemTemplate(item));
    productListElement.innerHTML = htmlItems.join("");
    
    // Calculate and show the total price
    totalPrice(cartItems);
    
    // Add event listeners to all remove buttons
    document.querySelectorAll(".remove-from-cart").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        removeFromCart(id);
        updateCartCount();
      });
    });
  } catch (error) {
    console.error('Error rendering cart contents:', error);
    productListElement.innerHTML = `<li class="empty-cart-message">There was a problem displaying your cart</li>`;
    cartTotalElement.innerHTML = `<p>Total: $0.00</p>`;
  }
}

function cartItemTemplate(item) {
  const newItem = `
    <li class="cart-card">
      <a href="#" class="cart-card__image">
        <img
          src="${item.Image || item.Images?.PrimaryMedium}"
          alt="${item.Name}"
          onerror="this.onerror=null; this.src='/images/placeholder.jpg'"
        />
      </a>
      <div class="cart-card__info">
        <h2 class="card__name">${item.Name}</h2>
        ${item.Colors && item.Colors.length > 0 ? 
          `<p class="cart-card__color">Color: ${item.Colors[0].ColorName}</p>` : ''}
        <p class="cart-card__quantity">Quantity: 1</p>
        <p class="cart-card__price">$${parseFloat(item.FinalPrice || item.ListPrice).toFixed(2)}</p>
      </div>
      <button class="remove-from-cart" data-id="${item.Id}" title="Remove from cart" aria-label="Remove item">
        <img src="/images/bin.svg" alt="Remove" />
      </button>
    </li>`;
  return newItem;
}

// Show loading overlay
function showLoading() {
  const overlay = document.querySelector('.loading-overlay');
  if (overlay) {
    overlay.classList.add('active');
  }
}

// Hide loading overlay
function hideLoading() {
  const overlay = document.querySelector('.loading-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

// Initialize the cart page
async function initCart() {
  showLoading();
  
  try {
    // Load header and footer first
    await loadHeaderFooter();
    
    // Then update cart count (badge will now exist in DOM)
    await updateCartCount();
    
    // Add a small delay to ensure smooth transition
    setTimeout(() => {
      renderCartContents();
      hideLoading();
      
      // Add animation to cart items
      const cartItems = document.querySelectorAll('.cart-card');
      cartItems.forEach((item, index) => {
        item.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s forwards`;
        item.style.opacity = '0';
      });
    }, 300);
  } catch (e) {
    console.error('Error initializing cart:', e);
    hideLoading();
    
    // Show error message to user
    const productListElement = document.querySelector(".product-list");
    if (productListElement) {
      productListElement.innerHTML = `
        <li class="empty-cart-message">
          <p>There was an error loading your cart. Please try again later.</p>
          <a href="/index.html" class="continue-shopping">Continue Shopping</a>
        </li>`;
    }
  }
}

// Start initialization when DOM is loaded
window.addEventListener('DOMContentLoaded', initCart);
