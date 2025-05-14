import { getParam } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";

const dataSource = new ProductData("tents");
const productId = getParam("product");

// Create a new ProductDetails instance and initialize it
const product = new ProductDetails(productId, dataSource);
product.init().catch(err => console.error("Error initializing product:", err));
