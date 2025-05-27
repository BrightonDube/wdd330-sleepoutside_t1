// ExternalServices.mjs - Handles all external API calls including products and checkout

// Base URL from environment variable
const baseURL = import.meta.env.VITE_SERVER_URL || 'http://wdd330-backend.onrender.com/';

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

  // Submit an order to the server
  async submitOrder(order) {
    try {
      console.log('Submitting order:', JSON.stringify(order, null, 2));
      
      const response = await fetch(`${baseURL}checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Server responded with error:', responseData);
        throw new Error(responseData.message || 'Order submission failed');
      }
      
      return responseData;
    } catch (err) {
      console.error('Error submitting order:', err);
      throw new Error(`Order submission failed: ${err.message}`);
    }
  }
}
