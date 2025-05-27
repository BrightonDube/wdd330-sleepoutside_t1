import { getParam, loadHeaderFooter, updateCartCount } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";

window.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadHeaderFooter();
    updateCartCount();
  } catch (e) {
    console.log(e);
  }

});

const dataSource = new ProductData();
const productID = getParam("product");

const product = new ProductDetails(productID, dataSource);
product.init();