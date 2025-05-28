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
    document.forms['checkout'].addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent the default form submission
      handleSubmit(event);
    });
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
async function handleSubmit(event) {
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton ? submitButton.textContent : '';
  
  // Show processing message
  const statusMessageArea = document.getElementById('status-message') || document.createElement('div');
  statusMessageArea.className = 'status-message';
  statusMessageArea.innerHTML = '<p class="processing">Processing your order...</p>';
  
  // Add status message area to form if not already there
  if (!statusMessageArea.parentNode) {
    form.appendChild(statusMessageArea);
  }
  
  // Disable submit button to prevent double submission
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';
  }
  
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
    console.log('Submitting order to server...');
    const result = await externalServices.submitOrder(order);
    
    // Log the result for debugging
    console.log('Server response:', result);
    
    // Order was successful
    statusMessageArea.innerHTML = `
      <p class="success">
        Order submitted successfully! Order ID: ${result.orderId}
      </p>
    `;
    
    // Clear the cart
    localStorage.removeItem('so-cart');
    
    // Log successful order details
    console.log('Order successful. Order ID:', result.orderId);
    
    // Redirect to order confirmation page after a short delay
    setTimeout(() => {
      window.location.href = `/checkout/confirmation.html?order=${result.orderId}`;
    }, 2000);
    
  } catch (error) {
    console.error('Error submitting order:', error);
    
    // Determine user-friendly error message
    let errorMessage = 'There was a problem submitting your order. Please try again.';
    
    if (error.message.includes('network')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.message.includes('400')) {
      errorMessage = 'Invalid order data. Please check your information and try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Show error message to user
    statusMessageArea.innerHTML = `
      <p class="error">
        <strong>Error:</strong> ${errorMessage}
      </p>`;
    
    // Re-enable submit button
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
    
    // Log the error details for debugging
    console.error('Order submission failed with error:', error);
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
    'fname': 'Test',
    'lname': 'User',
    'street': '123 Test St',
    'city': 'Testville',
    'state': 'UT',
    'zip': '84604',
    'cardNumber': '1234123412341234', // Test card number
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