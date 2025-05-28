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
  
  // Handle empty cart gracefully
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    // Show empty cart message
    productListElement.innerHTML = `<li class="empty-cart-message">Your cart is empty</li>`;
    cartTotalElement.innerHTML = `<p>Total: $0.00</p>`;
    return; // Exit function early
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
  const newItem = `<li class="cart-card divider">
    <div class="cart-card__main">
      <a href="#" class="cart-card__image">
        <img
          src="${item.Image || item.Images?.PrimaryMedium}"
          alt="${item.Name}"
        />
      </a>
      <div>
        <a href="#">
          <h2 class="card__name">${item.Name}</h2>
        </a>
        <p class="cart-card__color">${item.Colors[0].ColorName}</p>
        <p class="cart-card__quantity">qty: 1</p>
        <p class="cart-card__price">$${item.FinalPrice}</p>
      </div>
    </div>
    <button class="remove-from-cart" data-id="${item.Id}" title="Remove from cart">
      <img src="/images/bin.svg" alt="Remove" />
    </button>
  </li>`;
  return newItem;
}

// Initialize the cart page
async function initCart() {
  try {
    // Load header and footer first
    await loadHeaderFooter();
    
    // Then update cart count (badge will now exist in DOM)
    await updateCartCount();
    
    // Finally render the cart contents
    renderCartContents();
  } catch (e) {
    console.error('Error initializing cart:', e);
  }
}

// Start initialization when DOM is loaded
window.addEventListener('DOMContentLoaded', initCart);
