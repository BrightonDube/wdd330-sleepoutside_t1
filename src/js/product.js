import { getParam, loadHeaderFooter, updateCartCount } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";

window.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load header and footer first
    await loadHeaderFooter();
    
    // Get the product ID from the URL
    const productID = getParam("product");
    
    // Initialize the data source
    const dataSource = new ProductData();
    
    // Create and initialize the product details
    const product = new ProductDetails(productID, dataSource);
    await product.init();
    
    // Update cart count after everything is loaded
    await updateCartCount();
  } catch (e) {
    console.error('Error initializing product page:', e);
    document.querySelector("#product-detail").innerHTML = `<p>Error loading product. Please try again later.</p>`;
  }
});