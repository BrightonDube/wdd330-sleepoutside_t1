import { loadHeaderFooter, updateCartCount, getLocalStorage } from './utils.mjs';
import CheckoutService from './CheckoutService.mjs';

// Get the base URL from environment variables
const baseURL = import.meta.env.VITE_SERVER_URL;

// Create an instance of the CheckoutService
const checkoutService = new CheckoutService(baseURL);

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
async function handleSubmit(e) {
  e.preventDefault();
  
  // Show loading state
  const submitButton = document.getElementById('checkoutSubmit');
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Processing...';
  
  try {
    // Get form data
    const form = e.target;
    const formData = new FormData(form);
    const order = {
      firstName: formData.get('fname'),
      lastName: formData.get('lname'),
      street: formData.get('street'),
      city: formData.get('city'),
      state: formData.get('state'),
      zip: formData.get('zip'),
      cardNumber: formData.get('cardNumber'),
      expiration: formData.get('expiration'),
      code: formData.get('code'),
      orderDate: formData.get('orderDate'),
      orderTotal: document.getElementById('orderTotal').textContent,
      tax: document.getElementById('tax').textContent,
      shipping: document.getElementById('shipping').textContent,
      subtotal: document.getElementById('cartTotal').textContent
    };
    
    // Create status message area if it doesn't exist
    let statusMessageArea = document.querySelector('.checkout-status');
    if (!statusMessageArea) {
      statusMessageArea = document.createElement('div');
      statusMessageArea.className = 'checkout-status';
      form.appendChild(statusMessageArea);
    }
    
    // Update status
    statusMessageArea.innerHTML = '<p class="status-message processing">Validating order with server...</p>';
    
    // First validate the order with server-side validation
    const validationResult = await checkoutService.validateOrder(order);
    
    if (validationResult.success) {
      // If validation passed, place the order
      statusMessageArea.innerHTML = '<p class="status-message processing">Order validated! Processing payment...</p>';
      
      const orderResult = await checkoutService.placeOrder(order);
      
      if (orderResult.success) {
        // Order was successful
        statusMessageArea.innerHTML = `<p class="status-message success">Order placed successfully! Order ID: ${orderResult.orderId}</p>`;
        
        // Clear the cart
        localStorage.removeItem('so-cart');
        
        // Redirect to success page after a short delay
        setTimeout(() => {
          window.location.href = `../success/index.html?order=${orderResult.orderId}`;
        }, 2000);
      }
    }
  } catch (error) {
    console.error('Checkout error:', error);
    
    // Show error message
    const statusMessageArea = document.querySelector('.checkout-status') || document.createElement('div');
    statusMessageArea.className = 'checkout-status';
    
    if (error.serverTotal && error.clientTotal) {
      // This is a validation error with total mismatch
      statusMessageArea.innerHTML = `
        <p class="status-message error">
          <strong>Error:</strong> ${error.message}<br>
          Server calculated: $${error.serverTotal}<br>
          Your total: $${error.clientTotal}
        </p>`;
    } else {
      // General error
      statusMessageArea.innerHTML = `<p class="status-message error"><strong>Error:</strong> ${error.message || 'An unexpected error occurred'}</p>`;
    }
    
    // Add to form if not already there
    if (!statusMessageArea.parentNode) {
      document.querySelector('form[name="checkout"]').appendChild(statusMessageArea);
    }
    
    // Reset button
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
}

// Populate the order summary from cart items
function populateOrderSummary() {
  const cart = getLocalStorage('so-cart');
  
  if (cart && Array.isArray(cart) && cart.length > 0) {
    // Calculate totals
    let subtotal = 0;
    let itemCount = cart.length;
    
    cart.forEach(item => {
      // Use FinalPrice for calculation if available, fallback to ListPrice
      const itemPrice = item.FinalPrice || item.ListPrice;
      subtotal += itemPrice;
    });
    
    // Calculate tax: 6% of subtotal
    const taxRate = 0.06;
    const tax = subtotal * taxRate;
    
    // Calculate shipping: $10 for first item + $2 for each additional item
    let shipping = 10; // Base shipping for first item
    if (itemCount > 1) {
      shipping += (itemCount - 1) * 2; // Add $2 for each additional item
    }
    
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