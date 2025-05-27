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
  }

  calculateItemSummary() {
    // Calculate the total of all items in the cart
    const summaryElement = document.querySelector(
      this.outputSelector + ' #cartTotal'
    );
    const itemNumElement = document.querySelector(
      this.outputSelector + ' #num-items'
    );

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
      itemNumElement.innerText = itemCount;
      
      // Set item total
      summaryElement.innerText = `$${this.itemTotal.toFixed(2)}`;
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

    // Display the totals
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    // Once the totals are all calculated, display them in the order summary
    const tax = document.querySelector(`${this.outputSelector} #tax`);
    const shipping = document.querySelector(`${this.outputSelector} #shipping`);
    const orderTotal = document.querySelector(`${this.outputSelector} #orderTotal`);

    tax.innerText = `$${this.tax.toFixed(2)}`;
    shipping.innerText = `$${this.shipping.toFixed(2)}`;
    orderTotal.innerText = `$${this.orderTotal.toFixed(2)}`;
  }

  // Method to handle zip code entry
  calculateOrderTotalFromZip(zip) {
    // In a real implementation, we might make an API call to get tax rates based on zip
    // For now, we'll use our flat 6% tax rate
    this.calculateOrderTotal();
    
    // Could add ZIP validation here if needed
    return true;
  }
}
