import { getLocalStorage, setLocalStorage } from "./utils.mjs";

function updateCartCount() {
  const cart = getLocalStorage("so-cart");
  const count = Array.isArray(cart) ? cart.length : 0;
  const cartCountElem = document.getElementById("cart-count");
  if (cartCountElem) {
    cartCountElem.textContent = count > 0 ? count : "";
  }
}

function renderCartContents() {
  // Get cart items from localStorage
  const cartItems = getLocalStorage("so-cart");

  // Check if cartItems exists and is an array before trying to map
  if (cartItems && Array.isArray(cartItems)) {
    const htmlItems = cartItems.map((item) => cartItemTemplate(item));
    document.querySelector(".product-list").innerHTML = htmlItems.join("");
    // Add event listeners to all remove buttons
    document.querySelectorAll(".remove-from-cart").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        removeFromCart(id);
      });
    });
  } else {
    document.querySelector(".product-list").innerHTML = "";
  }
  updateCartCount(); // Ensure cart count is updated on render
}

function cartItemTemplate(item) {
  const newItem = `<li class="cart-card divider" style="position:relative; display:flex; align-items:center; justify-content:space-between;">
    <div style="display:flex; align-items:center; gap:1em;">
      <a href="#" class="cart-card__image">
        <img
          src="${item.Image}"
          alt="${item.Name}"
        />
      </a>
      <div>
        <a href="#">
          <h2 class="card__name">${item.Name}</h2>
        </a>
        <p class="cart-card__color">${item.Colors[0].ColorName}</p>
        <p class="cart-card__quantity">qty: 1</p>
        <p class="cart-card__price">$${item.FinalPrice}</p>
      </div>
    </div>
    <button class="remove-from-cart" data-id="${item.Id}" title="Remove from cart" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0 0.5em;">
      <img src="/images/bin.svg" alt="Remove" style="width:20px;height:20px;vertical-align:middle;" />
    </button>
  </li>`;
  return newItem;
}

function removeFromCart(id) {
  let cart = getLocalStorage("so-cart");
  if (!cart || !Array.isArray(cart)) return;
  // Remove only the first matching item (in case of duplicates)
  const idx = cart.findIndex((item) => item.Id === id);
  if (idx > -1) {
    cart.splice(idx, 1);
    setLocalStorage("so-cart", cart);
    renderCartContents();
    // updateCartCount will be called by renderCartContents
  }
}

renderCartContents();
