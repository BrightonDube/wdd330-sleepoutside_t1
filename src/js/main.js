import  ProductData  from "./ProductData.mjs";
import  ProductList  from "./ProductList.mjs";

const product = new ProductData("tents");
const data = await product.getData();
const productList = new ProductList('tents', product, "li");
const dataList = productList.init();
dataList.then((data) => productList.renderList(data));