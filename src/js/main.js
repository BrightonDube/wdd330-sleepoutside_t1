import  ProductData  from "./ProductData.mjs";
import  ProductList  from "./ProductList.mjs";

const product = new ProductData("tents");
const element = document.querySelector(".product-list");
const productList = new ProductList('tents', product, element);
productList.init();