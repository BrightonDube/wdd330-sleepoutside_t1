// ExternalServices.mjs - Handles all external API calls including products and checkout

// Base URL from environment variable or fallback to the correct endpoint
const baseURL = import.meta.env.VITE_SERVER_URL || 'https://wdd330-backend.onrender.com/';

// Local fallback categories in case API is not available
const FALLBACK_CATEGORIES = [
  { Id: '1', Name: 'Tents' },
  { Id: '2', Name: 'Backpacks' },
  { Id: '3', Name: 'Sleeping Bags' },
  { Id: '4', Name: 'Hiking Gear' },
  { Id: '5', Name: 'Camping Accessories' }
];

// Local fallback products in case API is not available
const FALLBACK_PRODUCTS = {
  '1': [
    { Id: '1', Name: 'Tent 1', Brand: { Name: 'Brand A' }, FinalPrice: 199.99, SuggestedRetailPrice: 249.99 },
    { Id: '2', Name: 'Tent 2', Brand: { Name: 'Brand B' }, FinalPrice: 299.99, SuggestedRetailPrice: 299.99 }
  ],
  '2': [
    { Id: '3', Name: 'Backpack 1', Brand: { Name: 'Brand C' }, FinalPrice: 89.99, SuggestedRetailPrice: 99.99 },
    { Id: '4', Name: 'Backpack 2', Brand: { Name: 'Brand D' }, FinalPrice: 129.99, SuggestedRetailPrice: 149.99 }
  ]
};

export default class ExternalServices {
  constructor() {}

  // Convert response to JSON and handle errors
  async convertToJson(res) {
    try {
      // First, get the response text to ensure we can parse it as JSON
      const responseText = await res.text();
      let jsonResponse;
      
      try {
        // Try to parse the response as JSON
        jsonResponse = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        // If parsing fails, throw an error with the response text
        throw { 
          name: 'parseError', 
          message: 'Failed to parse server response',
          details: responseText,
          status: res.status
        };
      }
      
      if (res.ok) {
        return jsonResponse;
      } else {
        // If server sent error details in the response, use those
        const error = { 
          name: 'servicesError',
          message: jsonResponse.message || 'Bad Request',
          details: jsonResponse.details || jsonResponse,
          status: res.status,
          response: jsonResponse
        };
        throw error;
      }
    } catch (err) {
      // If we can't parse the response as JSON, throw a more helpful error
      if (err.name === 'SyntaxError' || err instanceof SyntaxError) {
        throw { 
          name: 'parseError',
          message: `Invalid response from server (${res.status} ${res.statusText})`,
          details: err.message,
          status: res.status
        };
      }
      // If it's already our custom error, just re-throw it
      if (err.name === 'servicesError' || err.name === 'parseError') {
        throw err;
      }
      // Otherwise, wrap it in our custom error format
      throw { 
        name: 'servicesError',
        message: err.message || 'An unknown error occurred',
        details: err,
        status: err.status || 500
      };
    }
  }

  // Get products by category
  async getProductsByCategory(category) {
    try {
      const response = await fetch(`${baseURL}products/search/${category}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Authentication required for products, using fallback data');
          return FALLBACK_PRODUCTS[category] || [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await this.convertToJson(response);
      return data.Result || [];
    } catch (err) {
      console.error('Error getting products by category, using fallback data:', err);
      return FALLBACK_PRODUCTS[category] || [];
    }
  }

  // Search products by query
  async searchProducts(query) {
    try {
      const response = await fetch(`${baseURL}products/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/json',
          // Include any required authentication headers here
          // For example, if using Bearer token:
          // 'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN || ''}`
        }
      });
      
      if (!response.ok) {
        // If we get a 401, throw a specific error that we can catch in the ProductList
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await this.convertToJson(response);
      return data.Result || [];
    } catch (err) {
      console.error('Error searching products:', err);
      // Re-throw with a specific error that we can check for in the ProductList
      if (err.message === 'Authentication required') {
        throw new Error('Authentication required');
      }
      throw err;
    }
  }

  // Get product by ID
  async getProductById(id) {
    try {
      const response = await fetch(`${baseURL}product/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Authentication required for product details, using fallback data');
          // Try to find the product in our fallback data
          for (const category in FALLBACK_PRODUCTS) {
            const product = FALLBACK_PRODUCTS[category].find(p => p.Id === id);
            if (product) return product;
          }
          throw new Error('Product not found in fallback data');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await this.convertToJson(response);
      return data.Result;
    } catch (err) {
      console.error(`Error getting product with ID ${id}, using fallback data:`, err);
      // Try to find the product in our fallback data
      for (const category in FALLBACK_PRODUCTS) {
        const product = FALLBACK_PRODUCTS[category].find(p => p.Id === id);
        if (product) return product;
      }
      throw err;
    }
  }
  
  // Get all product categories
  async getCategories() {
    try {
      const response = await fetch(`${baseURL}categories`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Authentication required for categories, using fallback data');
          return FALLBACK_CATEGORIES;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await this.convertToJson(response);
      return data.Result || FALLBACK_CATEGORIES;
    } catch (err) {
      console.error('Error getting categories, using fallback data:', err);
      return FALLBACK_CATEGORIES;
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
      
      // Use our convertToJson method which handles errors consistently
      const responseData = await this.convertToJson(response);
      
      // If we get here, the request was successful
      console.log('Order submitted successfully:', responseData);
      return responseData;
      
    } catch (err) {
      console.error('Error submitting order:', err);
      
      // If it's already our custom error format, just re-throw it
      if (err.name === 'servicesError' || err.name === 'parseError') {
        throw err;
      }
      
      // Otherwise, wrap it in our custom error format
      throw { 
        name: 'servicesError',
        message: err.message || 'Order submission failed',
        details: err.details || err,
        status: err.status || 500
      };
    }
  }
}
