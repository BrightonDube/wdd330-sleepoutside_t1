// Import ProductData module
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter, getParam, getLocalStorage, setLocalStorage, updateCartCount } from "./utils.mjs";

// Function to get random products - moved from main.js
async function getRandomProducts(count = 4) {
  try {
    // Try to get products from localStorage first
    let allProducts = getLocalStorage('allProducts');
    
    // If not in localStorage, fetch from API
    if (!allProducts) {
      const productData = new ProductData();
      const categories = ['tents', 'backpacks', 'sleeping-bags', 'hammocks'];
      const productsPromises = categories.map(category => productData.getData(category));
      const productsByCategory = await Promise.all(productsPromises);
      
      // Flatten the array of arrays into a single array of products
      allProducts = [].concat(...productsByCategory);
      
      // Store in localStorage for future use
      setLocalStorage('allProducts', allProducts);
    }
    
    // Shuffle array and get first 'count' items
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error getting random products:', error);
    return [];
  }
}

// Get the category from the URL query parameter
const category = getParam('category');

// Initialize the product listing page
function initProductListing() {
  if (category) {
    // Set the page title with the category name
    document.querySelector(".top-products").textContent = `Top Products: ${category.charAt(0).toUpperCase()}${category.slice(1)}`;
    
    // Create an instance of ProductData
    const productData = new ProductData();
    
    // Get the element where we'll render the product list
    const listElement = document.querySelector(".product-list");
    
    if (listElement) {
      // Create an instance of ProductList and initialize it
      const productList = new ProductList(category, productData, listElement);
      productList.init();
    }
  } else {
    console.error('No category specified in URL');
    document.querySelector(".top-products").textContent = 'All Products';
  }
}

// Initialize the page when DOM is loaded
window.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load header and footer first
    await loadHeaderFooter();
    
    // Initialize the product listing
    initProductListing();
    
    // Update cart count
    await updateCartCount();
  } catch (e) {
    console.error('Error initializing product listing page:', e);
  }
});