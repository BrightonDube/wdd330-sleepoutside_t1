import { loadHeaderFooter, updateCartCount } from './utils.mjs';
import CheckoutProcess from './CheckoutProcess.mjs';
import ProductData from './ProductData.mjs';

// Create an instance of ProductData for order submission
const productData = new ProductData();

// Create an instance of CheckoutProcess
let checkout;

// Initialize the checkout page
async function initCheckout() {
  try {
    // Set the order date to today
    document.getElementById('orderDate').value = new Date().toISOString();
    
    // Load header and footer first
    await loadHeaderFooter();
    
    // Update cart count
    await updateCartCount();
    
    // Initialize the checkout process
    checkout = new CheckoutProcess('so-cart', '.order-summary');
    checkout.init();
    
    // Add event listener to zip code field to calculate full order total
    const zipInput = document.getElementById('zip');
    if (zipInput) {
      zipInput.addEventListener('blur', function() {
        const zipCode = this.value;
        if (zipCode && zipCode.length >= 5) {
          checkout.calculateOrderTotalFromZip(zipCode);
        }
      });
    }
    
    // Add event listener to form submission
    const form = document.querySelector('form[name="checkout"]');
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
  } catch (e) {
    console.error('Error initializing checkout page:', e);
    // Show error message to user
    const errorContainer = document.querySelector('.error-message') || document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.innerHTML = 'Error initializing checkout. Please refresh the page and try again.';
    document.querySelector('main').prepend(errorContainer);
  }
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();
  
  // Show loading state
  const submitButton = document.getElementById('checkoutSubmit');
  if (!submitButton) return;
  
  const form = e.target;
  const statusMessageArea = document.querySelector('.checkout-status') || document.createElement('div');
  statusMessageArea.className = 'checkout-status';
  
  // Add status message area to form if not already there
  if (!statusMessageArea.parentNode) {
    form.appendChild(statusMessageArea);
  }
  
  // Set initial loading state
  submitButton.disabled = true;
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = 'Processing...';
  statusMessageArea.innerHTML = '<p class="status-message processing">Processing your order...</p>';
  
  try {
    // Get form data
    const formData = new FormData(form);
    
    // Make sure the final calculations are done
    checkout.calculateOrderTotal();
    
    // Prepare order data
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
      orderTotal: checkout.orderTotal.toFixed(2),
      tax: checkout.tax.toFixed(2),
      shipping: checkout.shipping.toFixed(2),
      subtotal: checkout.itemTotal.toFixed(2),
      items: checkout.items.map(item => ({
        id: item.Id,
        name: item.Name,
        price: item.FinalPrice,
        quantity: item.quantity
      }))
    };
    
    // Submit the order
    statusMessageArea.innerHTML = '<p class="status-message processing">Submitting your order...</p>';
    
    // Submit the order using ProductData
    const result = await productData.submitOrder(order);
    
    // Order was successful
    statusMessageArea.innerHTML = `
      <p class="status-message success">
        Order placed successfully! Order ID: ${result.orderId}
      </p>`;
    
    // Clear the cart
    localStorage.removeItem('so-cart');
    
    // Redirect to success page after a short delay
    setTimeout(() => {
      window.location.href = `../success/index.html?order=${result.orderId}`;
    }, 2000);
    
  } catch (error) {
    console.error('Checkout error:', error);
    
    // Show error message
    let errorMessage = 'An unexpected error occurred while processing your order.';
    
    if (error.message.includes('Failed to submit order')) {
      errorMessage = 'There was a problem submitting your order. Please try again.';
    } else if (error.message.includes('network')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    }
    
    statusMessageArea.innerHTML = `
      <p class="status-message error">
        <strong>Error:</strong> ${errorMessage}
      </p>`;
    
    // Reset button
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
}

// Empty cart handling moved to CheckoutProcess class

// Initialize the page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initCheckout);