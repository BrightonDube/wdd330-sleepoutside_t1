import { renderListWithTemplate } from "./utils.mjs";

// Product card template function
function productCardTemplate(product) {
  // Log image paths to debug
  console.log(`Product card: ${product.Name}, Image path: ${product.Image}`);
  
  // Fix the image path for the public directory
  const imagePath = product.Image.replace("../images", "/images");
  
  return `<li class="product-card divider">
    <a href="product_pages/index.html?product=${product.Id}">
      <img
        src="${imagePath}"
        alt="${product.Name}"
      />
      <h2 class="card__name">${product.NameWithoutBrand}</h2>
      <p class="card__brand">${product.Brand.Name}</p>
      <p class="product-card__price">$${product.FinalPrice}</p>
    </a>
  </li>`;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
  }

  async init() {
    try {
      // Get the data from the dataSource using the correct method name
      const list = await this.dataSource.getProductsByCategory(this.category);
      // Render the list
      this.renderList(list);
    } catch (error) {
      console.error('Error initializing shopping cart:', error);
      // Show error message to the user
      this.listElement.innerHTML = '<p class="error-message">Error loading cart items. Please try again later.</p>';
    }
  }

  renderList(list) {
    // Use the utility function to render the list
    renderListWithTemplate(
      productCardTemplate,
      this.listElement,
      list,
      "afterbegin",
      true
    );
  }
}
