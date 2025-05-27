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
    
    // Prepare order data in the exact format expected by the server
    const order = {
      orderDate: formData.get('orderDate'),
      fname: formData.get('fname'),
      lname: formData.get('lname'),
      street: formData.get('street'),
      city: formData.get('city'),
      state: formData.get('state'),
      zip: formData.get('zip'),
      cardNumber: formData.get('cardNumber'),
      expiration: formData.get('expiration'),
      code: formData.get('code'),
      items: checkout.list.map(item => ({
        id: item.Id,
        name: item.Name,
        price: parseFloat(item.FinalPrice || item.ListPrice).toFixed(2),
        quantity: parseInt(item.quantity || 1, 10)
      })),
      orderTotal: parseFloat(checkout.orderTotal).toFixed(2),
      shipping: parseFloat(checkout.shipping).toFixed(2),
      tax: parseFloat(checkout.tax).toFixed(2)
    };
    
    // Log the order data for debugging
    console.log('Order data being submitted:', JSON.stringify(order, null, 2));
    
    // Validate required fields
    const requiredFields = ['fname', 'lname', 'street', 'city', 'state', 'zip', 'cardNumber', 'expiration', 'code'];
    const missingFields = requiredFields.filter(field => !order[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Validate items
    if (!order.items || order.items.length === 0) {
      throw new Error('Cannot submit an empty order');
    }
    
    // Validate numbers are actually numbers
    const numericFields = ['orderTotal', 'shipping', 'tax'];
    const invalidNumbers = numericFields.filter(field => isNaN(parseFloat(order[field])));
    
    if (invalidNumbers.length > 0) {
      throw new Error(`Invalid number values in: ${invalidNumbers.join(', ')}`);
    }
    
    // Validate credit card number (basic Luhn check)
    const validateCreditCard = (cardNumber) => {
      // Remove all non-digit characters
      const cleanNumber = cardNumber.replace(/\D/g, '');
      
      // Check if it's all digits and has a valid length (13-19 digits)
      if (!/^\d{13,19}$/.test(cleanNumber)) {
        return false;
      }
      
      // Luhn algorithm check
      let sum = 0;
      let shouldDouble = false;
      
      for (let i = cleanNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanNumber.charAt(i), 10);
        
        if (shouldDouble) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
        
        sum += digit;
        shouldDouble = !shouldDouble;
      }
      
      return sum % 10 === 0;
    };
    
    // Validate expiration date (MM/YY format)
    const validateExpiration = (exp) => {
      if (!/^\d{2}\/\d{2}$/.test(exp)) {
        return false;
      }
      
      const [month, year] = exp.split('/').map(Number);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100; // Last 2 digits of current year
      const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed
      
      // Check if month is valid (1-12)
      if (month < 1 || month > 12) {
        return false;
      }
      
      // Check if the card is expired
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return false;
      }
      
      return true;
    };
    
    // Validate CVV (3 or 4 digits)
    const validateCVV = (cvv) => /^\d{3,4}$/.test(cvv);
    
    // Run validations
    if (!validateCreditCard(order.cardNumber)) {
      throw new Error('Please enter a valid credit card number');
    }
    
    if (!validateExpiration(order.expiration)) {
      throw new Error('Please enter a valid expiration date (MM/YY)');
    }
    
    if (!validateCVV(order.code)) {
      throw new Error('Please enter a valid 3 or 4-digit security code');
    }
    
    // Validate zip code (basic US zip code validation)
    if (!/^\d{5}(-\d{4})?$/.test(order.zip)) {
      throw new Error('Please enter a valid US zip code (e.g., 12345 or 12345-6789)');
    }
    
    // Validate state (2-letter US state code)
    if (!/^[A-Za-z]{2}$/.test(order.state)) {
      throw new Error('Please enter a valid 2-letter state code');
    }
    
    // Submit the order
    statusMessageArea.innerHTML = '<p class="status-message processing">Submitting your order...</p>';
    
    // Submit the order using ExternalServices
    const result = await externalServices.submitOrder(order);
    
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

// Initialize the page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initCheckout);