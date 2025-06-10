import {
  getLocalStorage,
  setLocalStorage,
  loadHeaderFooter,
  updateCartCount,
} from "./utils.mjs";
loadHeaderFooter();

// New addToCart method
function addToCart(product) {
  let cart = getLocalStorage("so-cart") || [];
  
  // Check if the product is already in the cart by Id
  const existingItem = cart.find(item => item.Id === product.Id);
  
  if (existingItem) {
    // Increment quantity if item exists
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    // Add new item with quantity 1
    product.quantity = 1;
    cart.push(product);
  }
  
  // Save updated cart to LocalStorage
  setLocalStorage("so-cart", cart);
  
  // Update cart display and count
  renderCartContents();
  updateCartCount();
}

function calculateItemTotal(price, quantity) {
  return (price * quantity).toFixed(2);
}

function totalPrice(cartList) {
  let subtotal = 0;
  let itemCount = 0;
  
  cartList.forEach(item => {
    const quantity = item.quantity || 1;
    subtotal += (parseFloat(item.ListPrice) * quantity);
    itemCount += quantity;
  });
  
  // Calculate tax (assuming 8% tax rate)
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  // Update the display
  const cartTotalElement = document.querySelector(".cart-total");
  if (cartTotalElement) {
    cartTotalElement.innerHTML = `
      <div class="price-row">
        <span>Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'items'}):</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      <div class="price-row">
        <span>Tax (${(taxRate * 100)}%):</span>
        <span>$${tax.toFixed(2)}</span>
      </div>
      <div class="price-row total">
        <strong>Total:</strong>
        <strong>$${total.toFixed(2)}</strong>
      </div>
    `;
  }
  
  // Update cart count in header
  updateCartCount();
  
  return total.toFixed(2);
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
    
    // Add event listeners to all cart controls
    document.querySelectorAll(".cart-card").forEach(card => {
      const id = card.getAttribute("data-id");
      
      // Remove button
      const removeBtn = card.querySelector(".remove-from-cart");
      if (removeBtn) {
        removeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          removeFromCart(id);
        });
      }
      
      // Quantity controls
      const minusBtn = card.querySelector(".quantity-btn.minus");
      const plusBtn = card.querySelector(".quantity-btn.plus");
      const quantityInput = card.querySelector(".quantity-input");
      
      if (minusBtn) {
        minusBtn.addEventListener("click", () => {
          const currentQty = parseInt(quantityInput.value) || 1;
          if (currentQty > 1) {
            quantityInput.value = currentQty - 1;
            updateCartItemQuantity(id, currentQty - 1);
          }
        });
      }
      
      if (plusBtn) {
        plusBtn.addEventListener("click", () => {
          const currentQty = parseInt(quantityInput.value) || 1;
          quantityInput.value = currentQty + 1;
          updateCartItemQuantity(id, currentQty + 1);
        });
      }
      
      if (quantityInput) {
        quantityInput.addEventListener("change", (e) => {
          let newQty = parseInt(e.target.value) || 1;
          if (newQty < 1) newQty = 1;
          if (newQty > 99) newQty = 99;
          e.target.value = newQty;
          updateCartItemQuantity(id, newQty);
        });
        
        // Prevent non-numeric input
        quantityInput.addEventListener("keypress", (e) => {
          if (e.key === 'e' || e.key === '+' || e.key === '-') {
            e.preventDefault();
          }
        });
      }
    });
  } catch (error) {
    console.error("Error rendering cart contents:", error);
    productListElement.innerHTML = `<li class="empty-cart-message">There was a problem displaying your cart</li>`;
    cartTotalElement.innerHTML = `<p>Total: $0.00</p>`;
  }
}

function updateCartItemQuantity(itemId, newQuantity) {
  const cartItems = getLocalStorage("so-cart") || [];
  const itemIndex = cartItems.findIndex(item => item.Id === itemId);
  
  if (itemIndex > -1) {
    if (newQuantity < 1) {
      // If quantity is less than 1, remove the item
      cartItems.splice(itemIndex, 1);
    } else {
      // Update the quantity
      cartItems[itemIndex].quantity = newQuantity;
    }
    
    setLocalStorage("so-cart", cartItems);
    renderCartContents();
    updateCartCount(); // Update the cart count in the header
    return true;
  }
  return false;
}

function cartItemTemplate(item) {
  const quantity = item.quantity || 1;
  const itemPrice = parseFloat(item.FinalPrice || item.ListPrice);
  const itemTotal = (itemPrice * quantity).toFixed(2);
  
  const newItem = `
    <li class="cart-card" data-id="${item.Id}">
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
        
        <div class="quantity-controls">
          <button class="quantity-btn minus" data-id="${item.Id}" aria-label="Decrease quantity">-</button>
          <input 
            type="number" 
            class="quantity-input" 
            value="${quantity}" 
            min="1" 
            max="99"
            data-id="${item.Id}"
            aria-label="Quantity"
          >
          <button class="quantity-btn plus" data-id="${item.Id}" aria-label="Increase quantity">+</button>
        </div>
        
        <div class="price-details">
          <span class="price-per-item">$${itemPrice.toFixed(2)} each</span>
          <span class="price-total">$${itemTotal} total</span>
        </div>
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

// Export addToCart for use in other modules
export { addToCart };
