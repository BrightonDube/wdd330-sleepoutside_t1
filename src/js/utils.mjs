// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}
export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

// render a list using a template
export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = false,
) {
  if (clear) {
    parentElement.innerHTML = "";
  }
  const htmlItems = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlItems.join(""));
}
export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  }
}
export async function loadTemplate(path) {
  const response = await fetch(path);
  const template = await response.text();
  return template;
}

export async function loadHeaderFooter(){
  const headerTemplate = await loadTemplate("../partials/header.html");
  const footerTemplate = await loadTemplate("../partials/footer.html");
  const headerElement = document.querySelector("#header");
  const footerElement = document.querySelector("#footer");
  renderWithTemplate(headerTemplate, headerElement);
  renderWithTemplate(footerTemplate, footerElement);
}
export async function updateCartCount() {
  const cart = getLocalStorage("so-cart");
  const count = Array.isArray(cart) ? cart.length : 0;
  const cartCountElem = document.getElementById("cart-count");
  
  // Check if cart count element exists in the DOM
  if (cartCountElem) {
    // Update cart count text and display
    cartCountElem.textContent = count > 0 ? count : "";
    cartCountElem.style.display = count > 0 ? "inline-block" : "none";
    
    // Set badge styling
    cartCountElem.style.backgroundColor = "#8a470c";
    cartCountElem.style.color = "white";
    cartCountElem.style.borderRadius = "50%";
    cartCountElem.style.padding = "0 6px";
    cartCountElem.style.fontWeight = "bold";
    cartCountElem.style.minWidth = "18px";
    cartCountElem.style.textAlign = "center";
    
    // Add bounce animation when count changes
    cartCountElem.classList.add("cart-bounce");
    setTimeout(() => {
      cartCountElem.classList.remove("cart-bounce");
    }, 400);
  }
}
