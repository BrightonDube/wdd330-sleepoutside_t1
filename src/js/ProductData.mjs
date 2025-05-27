// It calls an API
// Provide a fallback URL if the environment variable is not set
const baseURL = import.meta.env.VITE_SERVER_URL || 'https://wdd330-backend.onrender.com/'

function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error(`Bad Response: ${res.status} ${res.statusText}`);
  }
}

export default class ProductData {
  constructor() {
  }
  async getData(category) {
    try {
      console.log(`Fetching data for category: ${category} from ${baseURL}products/search/${category}`);
      const response = await fetch(`${baseURL}products/search/${category}`);
      const data = await convertToJson(response);
      console.log(`Received ${data.Result ? data.Result.length : 0} products for ${category}`);
      return data.Result || [];
    } catch (error) {
      console.error(`Error getting data for ${category}:`, error);
      return [];
    }
  }
  async findProductById(id) {
    try {
      console.log(`Fetching product with ID: ${id} from ${baseURL}product/${id}`);
      const response = await fetch(`${baseURL}product/${id}`);
      const data = await convertToJson(response);
      return data.Result;
    } catch (error) {
      console.error(`Error finding product with ID ${id}:`, error);
      return null;
    }
  }
}
