import { setLocalStorage, getLocalStorage, getParam } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

const dataSource = new ProductData("tents");
const productId = getParam("product");

// Fetch the product data and render it
dataSource.findProductById(productId).then((product) => {
  if (product) {
    // Render product details here if needed
    console.log(product);
  } else {
    console.error("Product not found");
  }
}).catch(err => console.error("Error loading product:", err));

function addProductToCart(productItem) {
  // Get the current cart from localStorage
  let cart = getLocalStorage("so-cart");

  // If cart is null or not an array, initialize it as an empty array
  if (!cart || !Array.isArray(cart)) {
    cart = [];
  }

  // Add the product to the cart
  cart.push(productItem);

  // Save the updated cart back to localStorage
  setLocalStorage("so-cart", cart);
}
// add to cart button event handler
async function addToCartHandler(e) {
  try {
    const productItem = await dataSource.findProductById(e.target.dataset.id);
    addProductToCart(productItem);
  } catch (err) {
    console.error("Error adding to cart:", err);
  }
}

// add listener to Add to Cart button
document
  .getElementById("addToCart")
  .addEventListener("click", addToCartHandler);
