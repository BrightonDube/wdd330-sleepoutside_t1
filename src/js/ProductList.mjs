import { renderListWithTemplate } from "./utils.mjs";

// Product card template function
function productCardTemplate(product) {
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
    // Get the data from the dataSource
    const list = await this.dataSource.getData();
    // Render the list
    this.renderList(list);
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
