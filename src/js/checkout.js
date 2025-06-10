import { loadHeaderFooter, updateCartCount, getLocalStorage, alertMessage } from './utils.mjs';
import CheckoutProcess from './CheckoutProcess.mjs';
import ExternalServices from './ExternalServices.mjs';

// Create an instance of ExternalServices for order submission
const externalServices = new ExternalServices();

// Create an instance of CheckoutProcess
let checkout;

// Form validation functions
const validators = {
  required: (value) => (value && value.trim() !== '') || 'This field is required',
  minLength: (min) => (value) => 
    (value && value.length >= min) || `Must be at least ${min} characters`,
  maxLength: (max) => (value) => 
    (!value || value.length <= max) || `Must be ${max} characters or less`,
  email: (value) => 
    !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Invalid email format',
  zipCode: (value) => 
    !value || /^\d{5}(-\d{4})?$/.test(value) || 'Invalid ZIP code format',
  cardNumber: (value) => {
    if (!value) return 'Card number is required';
    // Remove all non-digit characters
    const cleanValue = value.replace(/\D/g, '');
    // Check if it's a valid credit card number using Luhn algorithm
    if (!/^\d{13,19}$/.test(cleanValue)) return 'Invalid card number';
    
    // Luhn algorithm implementation
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleanValue.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanValue.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return (sum % 10 === 0) || 'Invalid card number';
  },
  expirationDate: (value) => {
    if (!value) return 'Expiration date is required';
    const [month, year] = value.split('/').map(num => parseInt(num));
    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
      return 'Invalid expiration date';
    }
    
    // Add current century to 2-digit year
    const fullYear = year < 100 ? 2000 + year : year;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() is 0-indexed
    
    if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
      return 'Card has expired';
    }
    
    return true;
  },
  cvv: (value) => 
    !value || /^\d{3,4}$/.test(value) || 'CVV must be 3 or 4 digits',
  state: (value) => 
    !value || value.length === 2 || 'Use 2-letter state code'
};

// Field configurations with validation rules
const formFields = {
  fname: [validators.required, validators.maxLength(50)],
  lname: [validators.required, validators.maxLength(50)],
  street: [validators.required, validators.maxLength(100)],
  city: [validators.required, validators.maxLength(50)],
  state: [validators.required, validators.state],
  zip: [validators.required, validators.zipCode],
  cardNumber: [validators.required, validators.cardNumber],
  expiration: [validators.required, validators.expirationDate],
  code: [validators.required, validators.cvv]
};

// Initialize the checkout page
async function initCheckout() {
  try {
    // Set the order date to today
    document.getElementById("orderDate").value = new Date().toISOString();

    // Load header and footer first
    await loadHeaderFooter();

    // Update cart count
    await updateCartCount();

    // Initialize the checkout process
    checkout = new CheckoutProcess("so-cart", ".checkout-summary");
    checkout.init();

    // Prefill form with test data (development only)
    if (import.meta.env.MODE === 'development') {
      fillTestData();
    }
    
    // Setup form validation
    setupFormValidation();
    
    // Add event listeners for real-time validation
    setupEventListeners();
    
  } catch (e) {
    console.error('Error initializing checkout page:', e);
    showError('Error initializing checkout. Please refresh the page and try again.');
  }
}

// Set up form validation
function setupFormValidation() {
  const form = document.forms['checkout'];
  if (!form) return;

  // Add event listeners to all form fields
  Object.keys(formFields).forEach(fieldName => {
    const input = form[fieldName];
    if (input) {
      // Add validation on blur
      input.addEventListener('blur', () => validateField(input));
      // Clear error on input
      input.addEventListener('input', () => {
        if (input.nextElementSibling && input.nextElementSibling.classList.contains('error-message')) {
          input.nextElementSibling.remove();
          input.classList.remove('error');
        }
      });
    }
  });

  // Special handling for expiration date formatting
  const expirationInput = form['expiration'];
  if (expirationInput) {
    expirationInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }

  // Special handling for card number formatting
  const cardNumberInput = form['cardNumber'];
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      // Add space after every 4 digits
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
      e.target.value = value.trim();
    });
  }
}

// Set up event listeners
function setupEventListeners() {
  const form = document.forms['checkout'];
  if (!form) return;

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

  // Add form submission handler
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (validateForm()) {
      handleSubmit(event);
    }
  });
}

// Validate a single form field
function validateField(input) {
  const fieldName = input.name || input.id;
  const value = input.value.trim();
  const validations = formFields[fieldName] || [];
  
  // Clear any existing error messages
  const existingError = input.nextElementSibling;
  if (existingError && existingError.classList.contains('error-message')) {
    existingError.remove();
  }
  
  // Skip validation for empty optional fields
  if (!validations.includes(validators.required) && !value) {
    input.classList.remove('error');
    return true;
  }
  
  // Run all validations
  for (const validate of validations) {
    const result = validate(value);
    if (result !== true) {
      showFieldError(input, result);
      return false;
    }
  }
  
  input.classList.remove('error');
  return true;
}

// Validate the entire form
function validateForm() {
  const form = document.forms['checkout'];
  if (!form) return false;
  
  let isValid = true;
  
  // Validate all fields
  Object.keys(formFields).forEach(fieldName => {
    const input = form[fieldName];
    if (input) {
      if (!validateField(input)) {
        isValid = false;
      }
    }
  });
  
  // Check if cart is empty
  const cart = getLocalStorage('so-cart') || [];
  if (cart.length === 0) {
    showError('Your cart is empty. Please add items before checking out.');
    return false;
  }
  
  return isValid;
}

// Show error message for a specific field
function showFieldError(input, message) {
  // Remove any existing error message
  const existingError = input.nextElementSibling;
  if (existingError && existingError.classList.contains('error-message')) {
    existingError.remove();
  }
  
  // Add error class to input
  input.classList.add('error');
  
  // Create and insert error message
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  errorElement.style.color = '#dc3545';
  errorElement.style.fontSize = '0.875rem';
  errorElement.style.marginTop = '0.25rem';
  
  input.insertAdjacentElement('afterend', errorElement);
  
  // Scroll to the first error
  if (window.scrollY > input.offsetTop - 100) {
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  
  // Focus the field with error
  input.focus();
}

// Show a general error message
function showError(message, isSuccess = false) {
  // Remove any existing messages
  const existingMessages = document.querySelectorAll('.alert-message');
  existingMessages.forEach(msg => msg.remove());
  
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.className = `alert-message ${isSuccess ? 'success' : 'error'}`;
  messageElement.textContent = message;
  
  // Style the message
  messageElement.style.padding = '1rem';
  messageElement.style.margin = '1rem 0';
  messageElement.style.borderRadius = '0.25rem';
  messageElement.style.fontWeight = '500';
  
  if (isSuccess) {
    messageElement.style.backgroundColor = '#d4edda';
    messageElement.style.color = '#155724';
    messageElement.style.border = '1px solid #c3e6cb';
  } else {
    messageElement.style.backgroundColor = '#f8d7da';
    messageElement.style.color = '#721c24';
    messageElement.style.border = '1px solid #f5c6cb';
  }
  
  // Insert the message at the top of the form
  const form = document.querySelector('.checkout-form');
  if (form) {
    form.insertBefore(messageElement, form.firstChild);
  } else {
    document.querySelector('main').insertBefore(messageElement, document.querySelector('main').firstChild);
  }
  
  // Auto-hide success messages after 5 seconds
  if (isSuccess) {
    setTimeout(() => {
      messageElement.style.transition = 'opacity 1s';
      messageElement.style.opacity = '0';
      setTimeout(() => messageElement.remove(), 1000);
    }, 5000);
  }
}

// Handle form submission
async function handleSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton ? submitButton.textContent : '';
  
  // First, check HTML5 validation
  if (!form.checkValidity()) {
    // Trigger browser's built-in validation UI
    form.reportValidity();
    
    // Add visual feedback for invalid fields
    const invalidFields = form.querySelectorAll(':invalid');
    invalidFields.forEach(field => {
      field.classList.add('invalid');
      // Add event listener to remove invalid class when user starts typing
      const onInput = () => {
        field.classList.remove('invalid');
        field.removeEventListener('input', onInput);
      };
      field.addEventListener('input', onInput, { once: true });
    });
    
    // Focus the first invalid field
    if (invalidFields.length > 0) {
      invalidFields[0].focus();
    }
    
    return; // Stop the submission
  }
  
  // If we get here, HTML5 validation passed
  // Show processing message
  alertMessage('Processing your order...', false);
  
  // Disable submit button to prevent double submission
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';
    submitButton.classList.add('processing');
  }

  try {
    // Make sure the final calculations are done
    checkout.calculateOrderTotal();

    // Prepare and validate the order using CheckoutProcess methods
    const order = await checkout.checkout(form);

    // Log the order data for debugging
    console.log("Order data being submitted:", order);

    // Additional validations if needed
    if (!order.items || order.items.length === 0) {
      throw { 
        name: 'ValidationError',
        message: 'Your cart is empty',
        details: 'Cannot proceed with checkout: no items in cart'
      };
    }

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Submit the order using ExternalServices
    console.log("Submitting order to server...");
    const result = await externalServices.submitOrder(order);

    // Log the result for debugging
    console.log('Server response:', result);

    // Clear the cart
    localStorage.removeItem('so-cart');
    
    // Update cart count in header
    updateCartCount();
    
    // Log successful order details
    console.log('Order successful. Order ID:', result.orderId);
    
    // Redirect to success page with order details
    window.location.href = `success.html?order=${result.orderId}`;
    return; // Exit the function to prevent further execution

  } catch (error) {
    console.error('Error submitting order:', error);

    // Determine user-friendly error message based on error type
    let errorMessage = 'There was a problem submitting your order. Please try again.';
    let fieldToFocus = null;

    // Handle different types of errors
    if (error.name === 'ValidationError' || error.name === 'servicesError' || error.name === 'parseError') {
      // This is our custom error format
      if (error.details) {
        if (typeof error.details === 'string') {
          errorMessage = error.details;
        } else if (error.details.cardNumber) {
          errorMessage = `Card number error: ${error.details.cardNumber}`;
          fieldToFocus = 'cardNumber';
        } else if (error.details.message) {
          errorMessage = error.details.message;
        } else if (typeof error.details === 'object') {
          // Convert object details to a readable string
          errorMessage = Object.entries(error.details)
            .filter(([key]) => key !== 'name' && key !== 'message' && key !== 'status')
            .map(([key, value]) => {
              if (typeof value === 'string') return value;
              if (Array.isArray(value)) return value.join(', ');
              return `${key}: ${JSON.stringify(value)}`;
            })
            .filter(Boolean)
            .join('; ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // If we have a field to focus on
      if (error.field) {
        fieldToFocus = error.field;
      }
    } else if (error.message) {
      // Handle standard Error objects
      if (error.message.includes('network') || error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Invalid order data. Please check your information and try again.';
      } else if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage = 'Authentication error. Please log in and try again.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later or contact support.';
      } else {
        errorMessage = error.message;
      }
    }
    
    // Show error message to user using our new alert system
    alertMessage(errorMessage, true);
    
    // Scroll to and focus the problematic field if known
    if (fieldToFocus) {
      const field = document.getElementById(fieldToFocus);
      if (field) {
        field.focus();
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
    // Re-enable submit button
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      submitButton.classList.remove('processing');
    }

    // Log the error details for debugging
    console.error('Order submission failed with error:', error);
    if (error.details) {
      console.error('Error details:', error.details);
    }
  }
}

// Empty cart handling moved to CheckoutProcess class

// Prefill form with test data (for development only)
function fillTestData() {
  const testData = {
    fname: "Test",
    lname: "User",
    street: "123 Test St",
    city: "Testville",
    state: "UT",
    zip: "84604",
    cardNumber: "1234123412341234", // Test card number
    expiration: "12/30", // Future date
    code: "123", // 3-digit CVV
  };

  // Fill in the form fields
  Object.entries(testData).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.value = value;
      // Trigger blur event to validate the field
      element.dispatchEvent(new Event('blur'));
    }
  });

  console.log("Form prefilled with test data");
}

// Initialize the page when DOM is fully loaded
document.addEventListener("DOMContentLoaded", initCheckout);
