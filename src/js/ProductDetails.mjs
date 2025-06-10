import { getLocalStorage, setLocalStorage, alertMessage } from "./utils.mjs";

function updateCartCount() {
  const cart = getLocalStorage("so-cart");
  const count = Array.isArray(cart) ? cart.length : 0;
  const cartCountElem = document.getElementById("cart-count");
  if (cartCountElem) {
    cartCountElem.textContent = count > 0 ? count : "";
  }
}

export default class ProductDetails {
  constructor(productId, dataSource, product) {
    this.productId = productId;
    this.product = product;
    this.dataSource = dataSource;
  }

  async init() {
    // Render the product details if product was found
    this.product = await this.dataSource.getProductById(this.productId);
    if (this.product) {
      this.renderProductDetails();
      // Add event listener to Add to Cart button
      const addToCartBtn = document.getElementById("addToCart");
      if (addToCartBtn) {
        addToCartBtn.addEventListener("click", () => {
          this.addProductToCart();
        });
      }
    } else {
      document.querySelector("#product-detail").innerHTML =
        `<p>Product not found. Please check the URL and try again.</p>`;
    }
  }

  addProductToCart() {
    let cart = getLocalStorage("so-cart");
    if (!cart || !Array.isArray(cart)) {
      cart = [];
    }
    cart.push(this.product);
    setLocalStorage("so-cart", cart);
    updateCartCount();

    // Show success message
    alertMessage(`${this.product.Name} has been added to your cart!`);

    // Visual feedback: animate badge
    const cartCountElem = document.getElementById("cart-count");
    if (cartCountElem) {
      cartCountElem.classList.add("cart-bounce");
      setTimeout(() => cartCountElem.classList.remove("cart-bounce"), 400);
    }
  }

  initializeCarousel() {
    const mainImage = document.querySelector('.main-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const prevButton = document.querySelector('.carousel-nav.prev');
    const nextButton = document.querySelector('.carousel-nav.next');
    let currentIndex = 0;

    // Array of all images including the primary one
    const allImages = [
      this.product.Image || this.product.Images?.PrimaryLarge,
      ...(this.product.Images?.ExtraImages || [])
    ];

    // Function to update the main image
    const updateMainImage = (index) => {
      // Update main image
      if (index == 0) {

        const primaryImage = this.product.Image || this.product.Images?.PrimaryLarge;
        mainImage.src = primaryImage

      } else {
        mainImage.src = allImages[index].Src;
        mainImage.alt = `${this.product.Name} - View ${index + 1}`;
      }

      // Update active thumbnail
      thumbnails.forEach((thumb, i) => {
        if (i === index) {
          thumb.classList.add('active');
        } else {
          thumb.classList.remove('active');
        }
      });

      // Update current index
      currentIndex = index;

      // Toggle navigation buttons based on current index
      if (prevButton) prevButton.disabled = currentIndex === 0;
      if (nextButton) nextButton.disabled = currentIndex === allImages.length - 1;
    };

    // Add click event to thumbnails
    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        updateMainImage(index);
      });
    });

    // Navigation buttons
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
          updateMainImage(currentIndex - 1);
        }
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        if (currentIndex < allImages.length - 1) {
          updateMainImage(currentIndex + 1);
        }
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        updateMainImage(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < allImages.length - 1) {
        e.preventDefault();
        updateMainImage(currentIndex + 1);
      }
    });

    // Disable prev button initially if on first image
    if (prevButton) prevButton.disabled = currentIndex === 0;
    if (nextButton) nextButton.disabled = currentIndex === allImages.length - 1;
  }

  renderProductDetails() {
    document.title = `Sleep Outside | ${this.product.Name}`;

    // Check if product is discounted
    const isDiscounted = this.product.FinalPrice < this.product.SuggestedRetailPrice;
    let discountBadge = '';
    let discountPricing = '';

    if (isDiscounted) {
      const discountPercentage = Math.round(((this.product.SuggestedRetailPrice - this.product.FinalPrice) / this.product.SuggestedRetailPrice) * 100);
      discountBadge = `<div class="discount-badge product-detail__discount">-${discountPercentage}%</div>`;
      discountPricing = `<p class="product-card__original-price">$${this.product.SuggestedRetailPrice.toFixed(2)}</p>`;
    }

    // Check for extra images
    const hasExtraImages = this.product.Images?.ExtraImages && this.product.Images.ExtraImages.length > 0;
    const primaryImage = this.product.Image || this.product.Images?.PrimaryLarge;

    // Create image carousel if extra images exist
    let imageSection = '';
    if (hasExtraImages) {
      const allImages = [primaryImage, ...this.product.Images.ExtraImages];
      const thumbnails = allImages.map((img, index) =>
        `<button class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
          <img src="${index === 0 ? primaryImage : img.Src}" alt="${this.product.Name} - View ${index + 1}" />
        </button>`

      ).join('');


      imageSection = `
        <div class="product-carousel">
          ${discountBadge}
          <div class="main-image-container">
            <img class="main-image" src="${primaryImage}" alt="${this.product.Name}" />
            <button class="carousel-nav prev" aria-label="Previous image">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <button class="carousel-nav next" aria-label="Next image">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          </div>
          <div class="thumbnails">
            ${thumbnails}
          </div>
        </div>`;

    } else {
      // Single image display
      imageSection = `
        <div class="product-image-container">
          ${discountBadge}
          <img class="divider" src="${primaryImage}" alt="${this.product.Name}" />
        </div>`;
    }

    // Set the HTML for the product details
    document.querySelector("#product-detail").innerHTML = `
      <h3>${this.product.Category?.charAt(0).toUpperCase()}${this.product.Category?.slice(1) || 'Product'}</h3>
      <h2 class="divider">${this.product.NameWithoutBrand || this.product.Name}</h2>
      ${imageSection}
      <div class="product-detail__price-container">
        <p class="product-card__price">$${this.product.FinalPrice?.toFixed(2) || '0.00'}</p>
        ${discountPricing}
      </div>
      <p class="product__color">${this.product.Colors?.[0]?.ColorName || ''}</p>
      <p class="product__description">${this.product.DescriptionHtmlSimple || this.product.Description || 'No description available.'}</p>
      <div class="product-detail__add">
        <button id="addToCart" data-id="${this.product.Id}">Add to Cart</button>
      </div>`;

    // Initialize carousel if there are extra images
    if (hasExtraImages) {
      this.initializeCarousel();
    }
  }
}