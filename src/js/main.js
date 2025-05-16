// Import ProductData module
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { getLocalStorage } from "./utils.mjs";

function updateCartCount() {
  const cart = getLocalStorage("so-cart");
  const count = Array.isArray(cart) ? cart.length : 0;
  const cartCountElem = document.getElementById("cart-count");
  if (cartCountElem) {
    cartCountElem.textContent = count > 0 ? count : "";
    cartCountElem.style.background = "#8A470C";
    cartCountElem.style.color = "#fff";
    cartCountElem.style.display = count > 0 ? "inline-block" : "none";
  }
}

// Create an instance of ProductData
const productData = new ProductData("tents");
// Get the element where we'll render the product list
const listElement = document.querySelector(".product-list");
// Create an instance of ProductList and initialize it
const productList = new ProductList("tents", productData, listElement);
productList.init();
// Call updateCartCount after DOM is loaded
window.addEventListener("DOMContentLoaded", updateCartCount);
