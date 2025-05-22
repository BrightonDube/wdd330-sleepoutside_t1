import { getParam, loadHeaderFooter, updateCartCount } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";

const productId = getParam("product");
const dataSource = new ProductData("tents");
const product = new ProductDetails(productId, dataSource);
product.init();
window.addEventListener("DOMContentLoaded", async () => {
  try{
   await loadHeaderFooter();
   updateCartCount();
  }catch(e){
    console.log(e);
  }
  
});

