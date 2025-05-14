import { getLocalStorage, setLocalStorage } from "./utils.mjs";
// Function to render product details
export function renderProductDetails(product) {
  document.title = `Sleep Outside | ${product.Name}`;
  
  document.querySelector("#product-detail").innerHTML = `
    <h3>${product.Brand.Name}</h3>
    <h2 class="divider">${product.NameWithoutBrand}</h2>
    <img class="divider" src="${product.Image}" alt="${product.Name}" />
    <p class="product-card__price">$${product.FinalPrice}</p>
    <p class="product__color">${product.Colors[0].ColorName}</p>
    <p class="product__description">${product.DescriptionHtmlSimple}</p>
    <div class="product-detail__add">
      <button id="addToCart" data-id="${product.Id}">Add to Cart</button>
    </div>
  `;
}

// Function to add product to cart
export function addProductToCart(product) {
  let cart = getLocalStorage("so-cart");
  if (!cart || !Array.isArray(cart)) {
    cart = [];
  }
  cart.push(product);
  setLocalStorage("so-cart", cart);
}















