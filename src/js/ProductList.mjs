function productCardTemplate(product) {
    return `<li class="product-card">
            <a href="product_pages/cedar-ridge-rimrock-2.html">
              <img src="${product.Image}" alt=""/>
              <h3 class="card__brand">${product.Brand.Name}</h3>
              <h2 class="card__name">${product.Name}</h2>
              <p class="product-card__price">${product.FinalPrice}</p>
            </a>
          </li>`
}
export default class ProductList {
    constructor(category, dataSource, listElement) {
        this.category = category;
        this.dataSource = dataSource;
        this.listElement = listElement;
    }
    async init() {
        const list = await this.dataSource.getData();
        return list;
    }
    renderList(data) {
        const newList = data.map((item) => productCardTemplate(item));
        document.querySelector(".product-list").innerHTML = newList.join("");
    }
}
