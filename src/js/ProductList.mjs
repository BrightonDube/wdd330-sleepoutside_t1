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
    this.allProducts = [];
  }

  async init() {
    try {
      // Get the search query from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const searchQuery = urlParams.get('search');

      // If there's a search query, perform a search
      if (searchQuery) {
        await this.performSearch(searchQuery);
      }
      // Otherwise, load products by category
      else if (this.category) {
        await this.loadProductsByCategory();
      }
      // If no category or search, show all products
      else {
        await this.loadAllProducts();
      }

      // Set up event listeners for search if on the product listing page
      this.setupSearchListener();

    } catch (error) {
      console.error('Error initializing product list:', error);
      // Show error message to the user
      this.listElement.innerHTML = '<p class="error-message">Error loading products. Please try again later.</p>';
    }
  }

  async loadProductsByCategory() {
    this.allProducts = await this.dataSource.getProductsByCategory(this.category);
    this.renderList(this.allProducts);
  }

  async loadAllProducts() {
    // Get unique categories first
    const categories = await this.dataSource.getCategories();

    // Fetch products from all categories
    const productsPromises = categories.map(category =>
      this.dataSource.getProductsByCategory(category.Id)
    );

    const productsByCategory = await Promise.all(productsPromises);

    // Flatten the array of arrays into a single array of products
    this.allProducts = productsByCategory.flat();

    // Remove duplicates based on product ID
    const uniqueProducts = [];
    const productIds = new Set();

    this.allProducts.forEach(product => {
      if (!productIds.has(product.Id)) {
        productIds.add(product.Id);
        uniqueProducts.push(product);
      }
    });

    this.allProducts = uniqueProducts;
    this.renderList(this.allProducts);
    countList(this.allProducts)
  }

  async performSearch(query) {
    try {
      const searchTerm = query.trim();

      if (!searchTerm) {
        // If search is empty, show all products if we have them
        if (this.allProducts.length > 0) {
          this.renderList(this.allProducts);
        } else {
          await this.loadAllProducts();
        }
        return;
      }

      // Show loading state
      this.listElement.innerHTML = '<div class="loading">Searching products...</div>';

      try {
        // Use the server-side search endpoint
        const results = await this.dataSource.searchProducts(searchTerm);

        // Update the page title to show search results
        const titleElement = document.querySelector('.top-products');
        if (titleElement) {
          titleElement.textContent = `Search Results for "${searchTerm}"`;
        }

        // Render the search results
        if (results && results.length > 0) {
          this.renderList(results);
        } else {
          this.listElement.innerHTML = `
            <div class="no-results">
              <p>No products found for "${searchTerm}".</p>
              <p>Try different keywords or browse our <a href="/product-listing/index.html">full catalog</a>.</p>
            </div>
          `;
        }
      } catch (error) {
        console.error('Search error:', error);
        // Fallback to client-side search if server search fails
        console.log('Falling back to client-side search');
        await this.fallbackClientSideSearch(searchTerm);
      }

    } catch (error) {
      console.error('Error performing search:', error);
      this.listElement.innerHTML = '<p class="error-message">Error performing search. Please try again later.</p>';
    }
  }
  setupSearchListener() {
    // If we're on the product listing page, set up the search form
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchInput = searchForm.querySelector('input[type="search"]');
        const searchTerm = searchInput.value.trim();

        if (searchTerm) {
          // Update the URL with the search term without reloading the page
          const url = new URL(window.location);
          url.searchParams.set('search', searchTerm);
          window.history.pushState({}, '', url);

          // Perform the search
          this.performSearch(searchTerm);
        }
      });
    }
  }

  async fallbackClientSideSearch(searchTerm) {
    try {
      // Load all products if we haven't already
      if (this.allProducts.length === 0) {
        await this.loadAllProducts();
      }

      const searchTermLower = searchTerm.toLowerCase().trim();

      if (!searchTermLower) {
        this.renderList(this.allProducts);
        return;
      }

      // Filter products based on search term
      const filteredProducts = this.allProducts.filter(product => {
        // Search in product name, brand, and category
        const searchText = `${product.Name} ${product.Brand?.Name || ''} ${product.Category?.Name || ''}`.toLowerCase();
        return searchText.includes(searchTermLower);
      });

      // Update the page title to show search results
      const titleElement = document.querySelector('.top-products');
      if (titleElement) {
        titleElement.textContent = `Search Results for "${searchTerm}"`;
      }

      // Render the filtered list
      if (filteredProducts.length > 0) {
        this.renderList(filteredProducts);
      } else {
        this.listElement.innerHTML = `
          <div class="no-results">
            <p>No products found for "${searchTerm}".</p>
            <p>Try different keywords or browse our <a href="/product-listing/index.html">full catalog</a>.</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('Fallback search error:', error);
      this.listElement.innerHTML = `
        <div class="error-message">
          <p>Unable to perform search. Please try again later.</p>
        </div>
      `;
    }
  }
  renderList(list) {
    // Clear any existing content
    this.listElement.innerHTML = '';

    // Use the utility function to render the list
    renderListWithTemplate(
      productCardTemplate,
      this.listElement,
      list,
      "beforeend",
      true
    );
    document.querySelector('.breadcrumbs').textContent = `${this.category.charAt(0).toUpperCase()}${this.category.slice(1)} -> ${this.allProducts.length}`;
  }

}
