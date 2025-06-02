import ExternalServices from './ExternalServices.mjs';
import ProductList from './ProductList.mjs';
import { loadHeaderFooter, getParam } from './utils.mjs';

// Initialize the page when DOM is loaded
window.addEventListener('DOMContentLoaded', async () => {
  // Load header and footer
  await loadHeaderFooter();
  
  // Get the category from the URL parameter
  const category = getParam('category');
  
  // Set the page title with the category name if available
  if (category) {
    document.querySelector('.top-products').textContent = 
      `Top Products: ${category.charAt(0).toUpperCase()}${category.slice(1)}`;
  }
  
  // First create an instance of the ExternalServices class
  const dataSource = new ExternalServices();
  
  // Then get the element you want the product list to render in
  const listElement = document.querySelector('.product-list');
  
  // Then create an instance of the ProductList class and send it the correct information
  const myList = new ProductList(category, dataSource, listElement);
  
  // Finally call the init method to show the products
  myList.init();
  
  
});