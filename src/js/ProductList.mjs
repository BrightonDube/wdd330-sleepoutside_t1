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
    // Create HTML for each item in the list
    const htmlItems = list.map((product) => this.renderProduct(product));
    // Insert the HTML into the listElement
    this.listElement.innerHTML = htmlItems.join("");
  }

  renderProduct(product) {
    return `<li class="product-card divider">
            <a href="product_pages/index.html?product=${product.Id}">
                <img
                    src="${product.Image}"
                    alt="${product.Name}"
                />
                <h2 class="card__name">${product.NameWithoutBrand}</h2>
                <p class="card__brand">${product.Brand.Name}</p>
                <p class="product-card__price">$${product.FinalPrice}</p>
            </a>
        </li>`;
  }
}
