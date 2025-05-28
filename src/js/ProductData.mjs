const baseURL = import.meta.env.VITE_SERVER_URL;

function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error(`Bad Response: ${res.status} ${res.statusText}`);
  }
}

export default class ExternalServices {
  constructor() {
    // Empty constructor - no category or path needed
  }
  
  /**
   * Fetches product data for a specific category
   * @param {string} category - The category of products to fetch
   * @returns {Promise<Array>} - Array of products in the category
   */
  async getProductsByCategory(category) {
    const response = await fetch(`${baseURL}products/search/${category}`);
    const data = await convertToJson(response);
    return data.Result;
  }

  /**
   * Finds a product by its ID
   * @param {string} id - The ID of the product to find
   * @returns {Promise<Object|null>} - The product object or null if not found
   */
  async findProductById(id) {
    try {
      console.log(`Fetching product with ID: ${id} from ${baseURL}product/${id}`);
      const response = await fetch(`${baseURL}product/${id}`);
      const data = await convertToJson(response);
      console.log('Product data structure:', data.Result);
      return data.Result;
    } catch (error) {
      console.error(`Error finding product with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Submits an order to the server
   * @param {Object} order - The order data to submit
   * @returns {Promise<Object>} - The server response
   * @throws {Error} - If the order submission fails
   */
  async submitOrder(order) {
    try {
      const response = await fetch(`${baseURL}checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting order:', error);
      throw error; // Re-throw to allow calling code to handle the error
    }
  }
}
