import { getLocalStorage } from './utils.mjs';

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
  }

  init() {
    this.list = getLocalStorage(this.key);
    this.calculateItemSummary();
    // Calculate the full order total after loading items
    this.calculateOrderTotal();
  }

  calculateItemSummary() {
    // Calculate the total of all items in the cart
    const summaryElement = document.getElementById('cartTotal');
    const itemNumElement = document.getElementById('num-items');

    if (!summaryElement || !itemNumElement) {
      console.error('Could not find required elements in the DOM');
      return;
    }

    // Calculate item count and subtotal
    let itemCount = 0;
    this.itemTotal = 0;

    if (this.list && Array.isArray(this.list) && this.list.length > 0) {
      itemCount = this.list.length;
      
      // Sum up the prices of all items
      this.list.forEach((item) => {
        // Use FinalPrice if available, otherwise ListPrice
        const price = item.FinalPrice || item.ListPrice;
        this.itemTotal += price;
      });
      
      // Set item count
      itemNumElement.textContent = itemCount;
      
      // Set item total
      summaryElement.textContent = `$${this.itemTotal.toFixed(2)}`;
    } else {
      // Handle empty cart
      this.handleEmptyCart();
    }
  }

  handleEmptyCart() {
    // Display zero values for all summary fields
    const emptyValues = ['num-items', 'cartTotal', 'tax', 'shipping', 'orderTotal'];
    emptyValues.forEach(id => {
      const element = document.querySelector(`${this.outputSelector} #${id}`);
      if (element) {
        element.innerText = id === 'num-items' ? '0' : '$0.00';
      }
    });
    
    // Disable checkout button if cart is empty
    const submitButton = document.getElementById('checkoutSubmit');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Cart Empty';
    }
  }

  calculateOrderTotal() {
    // Calculate the tax and shipping amounts
    // Tax: 6% of subtotal
    this.tax = this.itemTotal * 0.06;

    // Shipping: $10 for first item + $2 for each additional item
    if (this.list && Array.isArray(this.list) && this.list.length > 0) {
      this.shipping = 10; // Base shipping for first item
      if (this.list.length > 1) {
        this.shipping += (this.list.length - 1) * 2; // Add $2 for each additional item
      }
    } else {
      this.shipping = 0;
    }

    // Calculate order total
    this.orderTotal = this.itemTotal + this.tax + this.shipping;

    // Get the DOM elements
    const taxElement = document.getElementById('tax');
    const shippingElement = document.getElementById('shipping');
    const orderTotalElement = document.getElementById('orderTotal');
    
    // Update the UI if elements exist
    if (taxElement && shippingElement && orderTotalElement) {
      taxElement.textContent = `$${this.tax.toFixed(2)}`;
      shippingElement.textContent = `$${this.shipping.toFixed(2)}`;
      orderTotalElement.textContent = `$${this.orderTotal.toFixed(2)}`;
    } else {
      console.error('Could not find one or more required elements in the DOM');
    }
  }

  // Method to handle zip code entry
  calculateOrderTotalFromZip(zip) {
    // In a real implementation, we might make an API call to get tax rates based on zip
    // For now, we'll use our flat 6% tax rate
    console.log(`Zip code entered: ${zip}`);
    this.calculateOrderTotal();
    
    // Show a message to the user (optional)
    const zipMessage = document.getElementById('zip-message');
    if (zipMessage) {
      zipMessage.textContent = `Using default tax rate for zip code ${zip}`;
      setTimeout(() => {
        zipMessage.textContent = '';
      }, 3000);
    }
    // Could add ZIP validation here if needed
    return true;
  }

  // Convert cart items to the simplified format required for checkout
  packageItems(items) {
    return items.map(item => ({
      id: item.Id,
      name: item.Name,
      price: parseFloat(item.FinalPrice || item.ListPrice).toFixed(2),
      quantity: parseInt(item.quantity || 1, 10)
    }));
  }

  // Helper function to convert form data to JSON
  formDataToJSON(formElement) {
    const formData = new FormData(formElement);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    return data;
  }

  // Process the checkout form and submit the order
  async checkout(form) {
    // Get form data as JSON
    const formData = this.formDataToJSON(form);
    
    // Prepare the order object
    const order = {
      ...formData,
      orderDate: new Date().toISOString(),
      items: this.packageItems(this.list),
      orderTotal: this.orderTotal.toFixed(2),
      shipping: parseFloat(this.shipping).toFixed(2),
      tax: this.tax.toFixed(2)
    };
    
    // Clean up the card number (remove any non-digit characters)
    if (order.cardNumber) {
      order.cardNumber = order.cardNumber.replace(/\D/g, '');
    }
    
    // Clean up the expiration date (remove any non-digit or slash characters)
    if (order.expiration) {
      order.expiration = order.expiration.replace(/[^\d/]/g, '');
    }
    
    // Clean up the CVV (remove any non-digit characters)
    if (order.code) {
      order.code = order.code.replace(/\D/g, '');
    }
    
    return order;
  }
}
