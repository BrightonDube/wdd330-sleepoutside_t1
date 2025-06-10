import { getParam, loadHeaderFooter, updateCartCount } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductDetails from "./ProductDetails.mjs";

window.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load header and footer first
    await loadHeaderFooter();

    // Get the product ID from the URL
    const productID = getParam("product");

    // Initialize the data source
    const dataSource = new ExternalServices();

    // Create and initialize the product details
    const product = new ProductDetails(productID, dataSource);
    await product.init();

    
    // Update cart count after everything is loaded
    await updateCartCount();
  } catch (e) {
    console.error("Error initializing product page:", e);
    document.querySelector("#product-detail").innerHTML =
      `<p>Error loading product. Please try again later.</p>`;
  }
});

document
  .getElementById("commentForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent page reload

    let commentText = document.getElementById("commentText").value;

    if (commentText.trim() !== "") {
      let commentContainer = document.createElement("div");
      commentContainer.classList.add("comment");
      commentContainer.textContent = commentText;

      document.getElementById("comments-list").appendChild(commentContainer);

      document.getElementById("commentText").value = ""; // Clear textarea
    }
  });
