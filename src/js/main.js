// Import needed modules for the home page
import ExternalServices from "./ExternalServices.mjs";
import { loadHeaderFooter, updateCartCount, getLocalStorage, setLocalStorage } from "./utils.mjs";
import Alert from './alert.js';

// Function to get random products
async function getRandomProducts(count = 4) {
  try {
    // Try to get products from localStorage first
    let allProducts = getLocalStorage('allProducts');
    
    // If not in localStorage, fetch from API
    if (!allProducts || !Array.isArray(allProducts) || allProducts.length === 0) {
      console.log('No products found in localStorage, fetching from API...');
      const externalServices = new ExternalServices();
      const categories = ['tents', 'backpacks', 'sleeping-bags', 'hammocks'];
      
      try {
        // Fetch each category with individual error handling
        const productsByCategory = [];
        for (const category of categories) {
          try {
            const products = await externalServices.getProductsByCategory(category);
            if (products && products.length > 0) {
              productsByCategory.push(products);
            }
          } catch (categoryError) {
            console.warn(`Error fetching ${category}:`, categoryError);
          }
        }
        
        // Flatten the array of arrays into a single array of products
        allProducts = [].concat(...productsByCategory);
        
        // Only store in localStorage if we got products
        if (allProducts && allProducts.length > 0) {
          console.log(`Storing ${allProducts.length} products in localStorage`);
          setLocalStorage('allProducts', allProducts);
        } else {
          console.warn('No products received from API');
          return []; // Return empty array if no products
        }
      } catch (fetchError) {
        console.error('Error fetching products from API:', fetchError);
        return []; // Return empty array on fetch error
      }
    }
    
    // Check if allProducts is valid
    if (!allProducts || !Array.isArray(allProducts) || allProducts.length === 0) {
      console.warn('No valid products available');
      return [];
    }
    
    // Shuffle array and get first 'count' items
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error getting random products:', error);
    return [];
  }
}

// Function to display featured products
async function displayFeaturedProducts() {
  const featuredContainer = document.getElementById('featuredProducts');
  if (!featuredContainer) return;

  const products = await getRandomProducts(4);
  
  if (products.length === 0) {
    featuredContainer.innerHTML = '<p>No featured products available at the moment.</p>';
    return;
  }

  const productCards = products.map(product => `
    <div class="featured-card">
      <a href="/product_pages/index.html?product=${product.Id}">
        <img src="${product.Images.PrimaryMedium}" alt="${product.Name}">
        <div class="info">
          <h3>${product.Name}</h3>
          <p class="price">$${product.FinalPrice.toFixed(2)}</p>
        </div>
      </a>
    </div>
  `).join('');

  featuredContainer.innerHTML = productCards;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize alert system
  const alert = new Alert();
  await alert.init();
  
  // Load header and footer
  try {
    await loadHeaderFooter();
    await updateCartCount();
  } catch (e) {
    console.error('Error loading header/footer:', e);
  }
  
  // Initialize featured products section
  await displayFeaturedProducts();
});
