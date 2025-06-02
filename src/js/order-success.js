// Get the order details from sessionStorage
const order = JSON.parse(sessionStorage.getItem('lastOrder'));

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format date
const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Update the order details on the page
const updateOrderDetails = () => {
  if (!order) {
    window.location.href = '/index.html';
    return;
  }

  // Generate a random order number
  const orderNumber = document.getElementById('orderNumber');
  if (orderNumber) {
    orderNumber.textContent = `SO-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  // Update order items
  const orderItems = document.getElementById('orderItems');
  if (orderItems && order.items) {
    orderItems.innerHTML = order.items.map(item => `
      <div class="order-item">
        <span class="item-name">${item.name}</span>
        <span class="item-quantity">x${item.quantity}</span>
        <span class="item-price">${formatCurrency(item.price * item.quantity)}</span>
      </div>
    `).join('');
  }

  // Update totals
  const updateElement = (id, value) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = formatCurrency(parseFloat(value));
    }
  };

  updateElement('subtotal', order.subtotal || order.itemTotal);
  updateElement('shipping', order.shipping);
  updateElement('tax', order.tax);
  updateElement('orderTotal', order.orderTotal);

  // Update shipping address if available
  const shippingAddress = document.getElementById('shippingAddress');
  if (shippingAddress && order.street) {
    shippingAddress.innerHTML = `
      <p><strong>${order.fname} ${order.lname}</strong></p>
      <p>${order.street}</p>
      <p>${order.city}, ${order.state} ${order.zip}</p>
      <p>${order.email || ''}</p>
    `;
  }

  // Update order date
  const orderDate = document.getElementById('orderDate');
  if (orderDate) {
    orderDate.textContent = formatDate(order.orderDate);
  }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  updateOrderDetails();
  
  // Clear the order from session storage after displaying
  sessionStorage.removeItem('lastOrder');
  
  // Update cart count in header
  const updateCartCount = () => {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      cartCount.textContent = '0';
    }
  };
  
  updateCartCount();
});
