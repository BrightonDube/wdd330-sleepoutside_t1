import { renderListWithTemplate } from "./utils.mjs";

// Product card template function
function productCardTemplate(product) {
  // Check if product is discounted
  const isDiscounted = product.FinalPrice < product.SuggestedRetailPrice;
  
  // Calculate discount percentage if discounted
  let discountPercentage = 0;
  let discountBadge = '';
  
  if (isDiscounted) {
    discountPercentage = Math.round(((product.SuggestedRetailPrice - product.FinalPrice) / product.SuggestedRetailPrice) * 100);
    discountBadge = `<div class="discount-badge">-${discountPercentage}%</div>`;
  }
  
  return `<li class="product-card divider ${isDiscounted ? 'on-sale' : ''}">
    <a href="/product_pages/index.html?product=${product.Id}">
      ${discountBadge}
      <img
        src="${product.Image || product.Images?.PrimaryMedium}"
        alt="${product.Name}"
      />
      <h2 class="card__name">${product.NameWithoutBrand}</h2>
      <p class="card__brand">${product.Brand.Name}</p>
      <div class="product-card__price-container">
        <p class="product-card__price">$${product.FinalPrice}</p>
        ${isDiscounted ? `<p class="product-card__original-price">$${product.SuggestedRetailPrice}</p>` : ''}
      </div>
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
    const list = await this.dataSource.getData(this.category);
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
