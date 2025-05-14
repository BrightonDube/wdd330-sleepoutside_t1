// Import ProductData module
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

// Create an instance of ProductData
const productData = new ProductData("tents");
// Get the element where we'll render the product list
const listElement = document.querySelector(".product-list");
// Create an instance of ProductList and initialize it
const productList = new ProductList("tents", productData, listElement);
productList.init();
