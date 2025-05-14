import { getParam } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import { renderProductDetails, addProductToCart } from "./ProductDetails.mjs";

const dataSource = new ProductData("tents");
const productId = getParam("product");

// Fetch the product data and render it
dataSource.findProductById(productId).then((product) => {
  if (product) {
    renderProductDetails(product);
    
    // Add event listener to Add to Cart button
    document.getElementById("addToCart").addEventListener("click", () => {
      addProductToCart(product);
    });
  } else {
    document.querySelector("#product-detail").innerHTML = 
      `<p>Product not found. Please check the URL and try again.</p>`;
  }
}).catch(err => console.error("Error loading product:", err));
