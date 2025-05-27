import { loadHeaderFooter, updateCartCount } from './utils.mjs';
import CheckoutProcess from './CheckoutProcess.mjs';
import ExternalServices from './ExternalServices.mjs';

// Create an instance of ExternalServices for order submission
const externalServices = new ExternalServices();

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
    checkout = new CheckoutProcess('so-cart', '.checkout-summary');
    checkout.init();
    
    // Prefill form with test data (development only)
    fillTestData();
    
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
    // Make sure the final calculations are done
    checkout.calculateOrderTotal();
    
    // Prepare and validate the order using CheckoutProcess methods
    const order = await checkout.checkout(form);
    
    // Log the order data for debugging
    console.log('Order data being submitted:', order);
    
    // Additional validations if needed
    if (!order.items || order.items.length === 0) {
      throw new Error('Cannot submit an empty order');
    }
    
    // Submit the order using ExternalServices
    const result = await externalServices.submitOrder(order);
    
    // Log the result for debugging
    console.log('Order submission result:', result);
    
    // Order was successful
    statusMessageArea.innerHTML = `
      <p class="status-message success">
        Order placed successfully! Order ID: ${result.id}
      </p>`;
    
    // Clear the cart
    localStorage.removeItem('so-cart');
    
    // Redirect to success page after a short delay
    setTimeout(() => {
      window.location.href = `../success/index.html?order=${result.id}`;
    }, 2000);
    
  } catch (error) {
    console.error('Checkout error:', error);
    
    // Show error message with more details
    let errorMessage = 'An unexpected error occurred while processing your order.';
    
    if (error.message.includes('Failed to submit order')) {
      // Try to extract a more specific error message from the response
      try {
        const errorMatch = error.message.match(/\{.*\}/);
        if (errorMatch) {
          const errorObj = JSON.parse(errorMatch[0]);
          errorMessage = errorObj.message || 'There was a problem with your order. Please check your information and try again.';
        } else {
          errorMessage = 'There was a problem submitting your order. Please try again.';
        }
      } catch (e) {
        // If we can't parse the error, use a generic message
        errorMessage = 'There was a problem with your order. Please check your information and try again.';
      }
    } else if (error.message.includes('network')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.message.includes('400')) {
      errorMessage = 'Invalid order data. Please check your information and try again.';
    }
    
    statusMessageArea.innerHTML = `
      <p class="status-message error">
        <strong>Error:</strong> ${errorMessage}
      </p>`;
    
    // Reset button
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    
    // Log the error details for debugging
    console.error('Order submission failed with error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response);
    }
  }
}

// Empty cart handling moved to CheckoutProcess class

// Prefill form with test data (for development only)
function fillTestData() {
  // Only fill if we're in development mode
  if (import.meta.env.MODE !== 'development') return;
  
  const testData = {
    'fname': 'John',
    'lname': 'Doe',
    'street': '123 Main St',
    'city': 'Rexburg',
    'state': 'ID',
    'zip': '83440',
    'cardNumber': '5555555555554444', // Test Mastercard number
    'expiration': '12/30', // Future date
    'code': '123' // 3-digit CVV
  };
  
  // Fill in the form fields
  Object.entries(testData).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.value = value;
    }
  });
  
  console.log('Form prefilled with test data');
}

// Initialize the page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initCheckout);