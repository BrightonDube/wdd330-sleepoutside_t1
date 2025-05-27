import { getLocalStorage } from './utils.mjs';

// Service to handle checkout validation and order processing
export default class CheckoutService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  // Convert response to JSON
  async convertToJson(res) {
    const jsonResponse = await res.json();
    if (res.ok) {
      return jsonResponse;
    } else {
      throw { name: 'servicesError', message: jsonResponse };
    }
  }

  // Validate order details with the server
  async validateOrder(order) {
    try {
      // Get the current cart items from localStorage
      const cartItems = getLocalStorage('so-cart');
      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        throw new Error('No items in cart');
      }

      // Create an order object that includes only necessary information
      // (IDs and quantities, not prices that could be manipulated)
      const orderItems = cartItems.map(item => ({
        id: item.Id,
        name: item.Name,
        quantity: 1 // In a real implementation, we would track quantities
      }));

      // Create the complete order
      const completeOrder = {
        orderItems: orderItems,
        shipping: order.shipping,
        tax: order.tax,
        orderTotal: order.orderTotal,
        orderDate: order.orderDate,
        shipping: {
          firstName: order.firstName,
          lastName: order.lastName,
          street: order.street,
          city: order.city,
          state: order.state,
          zip: order.zip
        },
        payment: {
          cardNumber: order.cardNumber.slice(-4), // Only send last 4 digits for security
          expiration: order.expiration,
          code: '***' // Never send full security code
        }
      };

      // Send to the server for validation
      console.log('Sending order for validation:', completeOrder);
      
      // In a real application, we would make an API call like this:
      // const response = await fetch(`${this.baseURL}orders/validate`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(completeOrder)
      // });
      // return await this.convertToJson(response);

      // Simulate server validation with a Promise
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate server recalculating totals
          let serverSubtotal = 0;
          let serverTax = 0;
          let serverShipping = 0;
          let serverTotal = 0;

          // Pretend server retrieved current prices from database
          orderItems.forEach(item => {
            // In a real server, we would look up current prices in a database
            // This simulates that process
            const itemPrice = Math.floor(Math.random() * 100) + 50; // Random price $50-$150
            serverSubtotal += itemPrice;
          });

          // Calculate tax and shipping as server would
          serverTax = serverSubtotal * 0.06; // 6% tax
          serverShipping = serverSubtotal > 100 ? 0 : 10; // Free shipping over $100
          serverTotal = serverSubtotal + serverTax + serverShipping;

          // Compare with client-provided values
          const clientTotal = parseFloat(order.orderTotal.replace('$', ''));
          
          // Allow small rounding differences (up to 1 cent)
          if (Math.abs(serverTotal - clientTotal) > 0.01) {
            reject({
              success: false,
              message: 'Order validation failed. Total price mismatch.',
              serverTotal: serverTotal.toFixed(2),
              clientTotal: clientTotal.toFixed(2)
            });
          } else {
            resolve({
              success: true,
              orderId: 'ORD-' + Date.now(),
              message: 'Order validated successfully'
            });
          }
        }, 1500); // Simulate network delay
      });
    } catch (err) {
      console.error('Error validating order:', err);
      throw err;
    }
  }

  // Process the order after validation
  async placeOrder(order) {
    try {
      // First validate the order
      const validationResult = await this.validateOrder(order);
      
      if (!validationResult.success) {
        throw new Error(validationResult.message);
      }

      // If validation succeeded, process the order
      console.log('Order validated, processing payment...');
      
      // In a real application, we would make another API call:
      // const response = await fetch(`${this.baseURL}orders`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(order)
      // });
      // return await this.convertToJson(response);

      // Simulate order processing
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            orderId: validationResult.orderId,
            message: 'Order placed successfully'
          });
        }, 1000);
      });
    } catch (err) {
      console.error('Error placing order:', err);
      throw err;
    }
  }
}
