import { getLocalStorage, setLocalStorage } from "./utils.mjs";

function updateCartCount() {
  const cart = getLocalStorage("so-cart");
  const count = Array.isArray(cart) ? cart.length : 0;
  const cartCountElem = document.getElementById("cart-count");
  if (cartCountElem) {
    cartCountElem.textContent = count > 0 ? count : "";
  }
}

export default class ProductDetails {
  constructor(productId, dataSource, product) {
    this.productId = productId;
    this.product = product;
    this.dataSource = dataSource;
  }

  async init() {

    // Render the product details if product was found
    this.product = await this.dataSource.findProductById(this.productId);
    if (this.product) {
      this.renderProductDetails();
      // Add event listener to Add to Cart button
      document
        .getElementById("addToCart")
        .addEventListener("click", this.addProductToCart.bind(this));
      updateCartCount();
    } else {
      document.querySelector("#product-detail").innerHTML =
        `<p>Product not found. Please check the URL and try again.</p>`;
    }
  }

  addProductToCart() {
    let cart = getLocalStorage("so-cart");
    if (!cart || !Array.isArray(cart)) {
      cart = [];
    }
    cart.push(this.product);
    setLocalStorage("so-cart", cart);
    updateCartCount();
    // Visual feedback: animate badge
    const cartCountElem = document.getElementById("cart-count");
    if (cartCountElem) {
      cartCountElem.classList.add("cart-bounce");
      setTimeout(() => cartCountElem.classList.remove("cart-bounce"), 400);
    }
  }

  renderProductDetails() {
    document.title = `Sleep Outside | ${this.product.Name}`; 
    
    document.querySelector("#product-detail").innerHTML = `
      <h3>${this.product.Category.charAt(0).toUpperCase()}${this.product.Category.slice(1)}</h3>
      <h2 class="divider">${this.product.NameWithoutBrand}</h2>
      <img class="divider" src="${this.product.Images.PrimaryLarge}" alt="${this.product.Name}" />
      <p class="product-card__price">$${this.product.FinalPrice}</p>
      <p class="product__color">${this.product.Colors[0].ColorName}</p>
      <p class="product__description">${this.product.DescriptionHtmlSimple}</p>
      <div class="product-detail__add">
        <button id="addToCart" data-id="${this.product.Id}">Add to Cart</button>
      </div>
    `;
  }
}
