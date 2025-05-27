// Import ProductData module
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter, updateCartCount } from "./utils.mjs";
import Alert from './alert.js';

document.addEventListener('DOMContentLoaded', async () => {
  const alert = new Alert();
  await alert.init();
});

// Create an instance of ProductData
const productData = new ProductData("tents");
// Get the element where we'll render the product list
const listElement = document.querySelector(".product-list");
// Create an instance of ProductList and initialize it
const productList = new ProductList("tents", productData, listElement);

productList.init();
// Call updateCartCount after DOM is loaded, it is async because the header comes from other file, so we need to wait for render it
window.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadHeaderFooter();
    updateCartCount();
  } catch (e) {
    console.log(e);
  }

});
