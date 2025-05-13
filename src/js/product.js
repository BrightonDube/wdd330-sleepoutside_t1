import { setLocalStorage, getLocalStorage } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

const dataSource = new ProductData("tents");

function addProductToCart(product) {
  // Get the current cart from localStorage
  let cart = getLocalStorage("so-cart");

  // If cart is null or not an array, initialize it as an empty array
  if (!cart || !Array.isArray(cart)) {
    cart = [];
  }

  // Add the product to the cart
  cart.push(product);

  // Save the updated cart back to localStorage
  setLocalStorage("so-cart", cart);
}
// add to cart button event handler
async function addToCartHandler(e) {
  const product = await dataSource.findProductById(e.target.dataset.id);
  addProductToCart(product);
}

// add listener to Add to Cart button
document
  .getElementById("addToCart")
  .addEventListener("click", addToCartHandler);
