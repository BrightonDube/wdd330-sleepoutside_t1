import { setLocalStorage, getParam } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

const dataSource = new ProductData("tents");

const productId = getParam("product");

// Fetch and log the product data
dataSource.findProductById(productId).then(product => {
  console.log(product);
});
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const product = urlParams.get("product");

function addProductToCart(productItem) {
  setLocalStorage("so-cart", productItem);
}
// add to cart button event handler
async function addToCartHandler(e) {
  const productItem = await dataSource.findProductById(e.target.dataset.id);
  addProductToCart(productItem);
}

// add listener to Add to Cart button
document
  .getElementById("addToCart")
  .addEventListener("click", addToCartHandler);
