import { getLocalStorage, setLocalStorage, loadHeaderFooter } from "./utils.mjs";

function updateCartCount() {
  const cart = getLocalStorage("so-cart");
  const count = Array.isArray(cart) ? cart.length : 0;
  const cartCountElem = document.getElementById("cart-count");
  if (cartCountElem) {
    cartCountElem.textContent = count > 0 ? count : "";
    cartCountElem.style.background = "#8A470C";
    cartCountElem.style.color = "#fff";
    cartCountElem.style.display = count > 0 ? "inline-block" : "none";
  }
}
function totalPrice(cartList) {
  let total = 0;
  cartList.forEach(item => {
    total += item.ListPrice;
  })
  document.querySelector(".cart-total").innerHTML = `<strong>Total: </strong>$${total}`
}
// Ensure badge is updated on page load
window.addEventListener("DOMContentLoaded", updateCartCount);

function renderCartContents() {
  // Get cart items from localStorage
  const cartItems = getLocalStorage("so-cart");

  // Check if cartItems exists and is an array before trying to map
  if (cartItems && Array.isArray(cartItems)) {
    const htmlItems = cartItems.map((item) => cartItemTemplate(item));
    document.querySelector(".product-list").innerHTML = htmlItems.join("");
    // Calculate and show the total price or show a message 
    if (cartItems.length > 0) {
      totalPrice(cartItems);
    } else {
      document.querySelector(".cart-total").innerHTML = `Your Cart is empty`
    }
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
  const newItem = `<li class="cart-card divider">
    <div class="cart-card__main">
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
    <button class="remove-from-cart" data-id="${item.Id}" title="Remove from cart">
      <img src="/images/bin.svg" alt="Remove" />
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
loadHeaderFooter();