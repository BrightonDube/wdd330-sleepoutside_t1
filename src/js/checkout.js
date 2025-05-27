import { loadHeaderFooter, updateCartCount, getLocalStorage } from './utils.mjs';

// Initialize the checkout page
async function initCheckout() {
  try {
    // Set the order date to today
    document.getElementById('orderDate').value = new Date().toISOString();
    
    // Load header and footer first
    await loadHeaderFooter();
    
    // Update cart count
    await updateCartCount();
    
    // Populate order summary
    populateOrderSummary();
    
    // Add event listener to form submission
    document.querySelector('form[name="checkout"]').addEventListener('submit', handleSubmit);
  } catch (e) {
    console.error('Error initializing checkout page:', e);
  }
}

// Handle form submission
function handleSubmit(e) {
  e.preventDefault();
  
  // Here you would normally process the order
  // For now, we'll just show an alert
  alert('Order submitted successfully!');
  
  // Clear the cart and redirect to confirmation page
  // localStorage.removeItem('so-cart');
  // window.location.href = '../success/index.html';
}

// Populate the order summary from cart items
function populateOrderSummary() {
  const cart = getLocalStorage('so-cart');
  
  if (cart && Array.isArray(cart) && cart.length > 0) {
    // Calculate totals
    let subtotal = 0;
    let itemCount = 0;
    
    cart.forEach(item => {
      subtotal += item.ListPrice;
      itemCount++;
    });
    
    // Calculate tax and shipping
    const taxRate = 0.06; // 6% tax rate
    const tax = subtotal * taxRate;
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const orderTotal = subtotal + tax + shipping;
    
    // Format currency values
    const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
    
    // Update order summary
    document.getElementById('num-items').textContent = itemCount;
    document.getElementById('cartTotal').textContent = formatCurrency(subtotal);
    document.getElementById('tax').textContent = formatCurrency(tax);
    document.getElementById('shipping').textContent = formatCurrency(shipping);
    document.getElementById('orderTotal').textContent = formatCurrency(orderTotal);
  } else {
    // Handle empty cart
    const emptyValues = ['num-items', 'cartTotal', 'tax', 'shipping', 'orderTotal'];
    emptyValues.forEach(id => {
      document.getElementById(id).textContent = id === 'num-items' ? '0' : '$0.00';
    });
    
    // Disable checkout button if cart is empty
    document.getElementById('checkoutSubmit').disabled = true;
    document.getElementById('checkoutSubmit').textContent = 'Cart Empty';
  }
}

// Initialize the page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initCheckout);