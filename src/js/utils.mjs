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

/**
 * Displays an alert message to the user
 * @param {string} message - The message to display
 * @param {boolean} [scroll=true] - Whether to scroll to the message
 * @returns {HTMLElement} The created alert element
 */
export function alertMessage(message, scroll = true) {
  // create element to hold the alert
  const alert = document.createElement('div');
  // add a class to style the alert
  alert.classList.add('alert');
  
  // Add message and close button
  alert.innerHTML = `
    <div class="alert-message">${message}</div>
    <button class="alert-close" aria-label="Close">&times;</button>
  `;

  // add a listener to the alert to see if they clicked on the X
  alert.addEventListener('click', function(e) {
    // Check if the click was on the close button or its children (the &times;)
    if (e.target.classList.contains('alert-close') || e.target.closest('.alert-close')) {
      const main = document.querySelector('main');
      if (main && main.contains(this)) {
        main.removeChild(this);
      }
    }
  });
  
  // add the alert to the top of main
  const main = document.querySelector('main');
  if (main) {
    main.prepend(alert);
    
    // make sure they see the alert by scrolling to the top of the window
    if (scroll) {
      window.scrollTo(0, 0);
    }
  }
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(alert) && main && main.contains(alert)) {
      main.removeChild(alert);
    }
  }, 5000);
  
  return alert;
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
