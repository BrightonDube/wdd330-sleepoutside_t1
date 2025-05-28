// ExternalServices.mjs - Handles all external API calls including products and checkout

// Base URL from environment variable or fallback to the correct endpoint
const baseURL = import.meta.env.VITE_SERVER_URL || 'https://wdd330-backend.onrender.com/';

export default class ExternalServices {
  constructor() {}

  // Convert response to JSON
  async convertToJson(res) {
    const jsonResponse = await res.json();
    if (res.ok) {
      return jsonResponse;
    } else {
      throw { name: 'servicesError', message: jsonResponse };
    }
  }

  // Get products by category
  async getProductsByCategory(category) {
    try {
      const response = await fetch(`${baseURL}products/search/${category}`);
      const data = await this.convertToJson(response);
      return data.Result;
    } catch (err) {
      console.error('Error getting products by category:', err);
      throw err;
    }
  }

  // Search products by query
  async searchProducts(query) {
    try {
      const response = await fetch(`${baseURL}products/search?q=${encodeURIComponent(query)}`);
      const data = await this.convertToJson(response);
      return data.Result || [];
    } catch (err) {
      console.error('Error searching products:', err);
      throw err;
    }
  }

  // Get product by ID
  async getProductById(id) {
    try {
      const response = await fetch(`${baseURL}product/${id}`);
      const data = await this.convertToJson(response);
      return data.Result;
    } catch (err) {
      console.error(`Error getting product with ID ${id}:`, err);
      throw err;
    }
  }
  
  // Get all product categories
  async getCategories() {
    try {
      const response = await fetch(`${baseURL}categories`);
      const data = await this.convertToJson(response);
      return data.Result;
    } catch (err) {
      console.error('Error getting categories:', err);
      throw err;
    }
  }

  // Submit an order to the server
  async submitOrder(order) {
    try {
      // Log the order data being sent (without full card number for security)
      const orderForLog = { ...order };
      if (orderForLog.cardNumber) {
        orderForLog.cardNumber = `${order.cardNumber.substring(0, 4)}...${order.cardNumber.slice(-4)}`;
      }
      console.log('Submitting order:', orderForLog);
      
      // Make sure we're using the correct endpoint
      const checkoutUrl = `${baseURL}checkout`;
      console.log('Sending request to:', checkoutUrl);
      
      const response = await fetch(checkoutUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order) // The order object is already properly formatted
      });
      
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        console.error('Failed to parse server response as JSON');
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        console.error('Server responded with error status:', response.status);
        console.error('Error details:', responseData);
        
        // Create a more detailed error message
        let errorMessage = 'Order submission failed';
        if (responseData && responseData.cardNumber) {
          errorMessage = `Card number error: ${responseData.cardNumber}`;
        } else if (responseData && typeof responseData === 'object') {
          errorMessage = Object.entries(responseData)
            .map(([key, value]) => `${key}: ${value}`)
            .join('; ');
        }
        
        const error = new Error(errorMessage);
        error.response = responseData;
        error.status = response.status;
        throw error;
      }
      
      return responseData;
    } catch (err) {
      console.error('Error submitting order:', err);
      throw new Error(`Order submission failed: ${err.message}`);
    }
  }
}
