const state = {
  products: [],
  favorites: [],
  search: "",
};

const productsEl = document.querySelector("#products");
const favoritesEl = document.querySelector("#favorites");
const searchEl = document.querySelector("#searchInput");
const formEl = document.querySelector("#searchForm");
const messageEl = document.querySelector("#message");
const favCountEl = document.querySelector("#favCount");
const themeToggleEl = document.querySelector("#themeToggle");

function render() {
  const term = state.search.toLowerCase().trim();

  const shown = state.products.filter((product) =>
    product.title.toLowerCase().includes(term),
  );

  if (state.products.length === 0) {
    productsEl.innerHTML = '<p class="status">No products to show.</p>';
  } else if (shown.length === 0) {
    productsEl.innerHTML =
      '<p class="status">No products match your search.</p>';
  } else {
    productsEl.innerHTML = shown.map((product) => createCard(product)).join("");
  }

  if (state.favorites.length === 0) {
    favoritesEl.innerHTML = '<p class="status">No favorites yet.</p>';
  } else {
    favoritesEl.innerHTML = state.favorites
      .map((product) => createCard(product))
      .join("");
  }

  favCountEl.textContent = state.favorites.length;
}

function createCard(product) {
  const image = product.thumbnail;
  const saved = state.favorites.some((favorite) => favorite.id === product.id);

  return `
        <article class="card">

            <img
                src="${image}"
                alt="${product.title}"
            >

            <div class="card-content">

                <h3>${product.title}</h3>

                <p class="category">${product.category}</p>

                <p class="description">${product.description}</p>

                <p class="price">$${product.price}</p>

                <p class="rating">★ ${product.rating}</p>

                <button
                    class="${saved ? "saved" : ""}"
                    onclick="addOrRemove(${product.id})"
                >
                    ${saved ? "Remove" : "Favorite"}
                </button>

            </div>

        </article>
    `;
}

async function loadProducts() {
  messageEl.textContent = "Loading...";

  try {
    const response = await fetch("https://dummyjson.com/products");

    if (!response.ok) {
      throw new Error("Failed to load products");
    }

    const data = await response.json();

    state.products = data.products;

    messageEl.textContent = "";

    render();
  } catch (error) {
    messageEl.textContent = "Could not load products.";

    console.log(error);

    state.products = [];

    render();
  }
}

function addOrRemove(id) {
  const exists = state.favorites.find((favorite) => favorite.id === id);

  if (exists) {
    state.favorites = state.favorites.filter((favorite) => favorite.id !== id);
  } else {
    const product = state.products.find((product) => product.id === id);

    if (product) {
      state.favorites.push(product);
    }
  }

  saveFavorites();

  render();
}

function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(state.favorites));
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem("favorites");
    const parsed = JSON.parse(raw);
    state.favorites = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    state.favorites = [];
  }
}

let typingTimer;

searchEl.addEventListener("input", function () {
  clearTimeout(typingTimer);

  typingTimer = setTimeout(function () {
    state.search = searchEl.value;

    render();
  }, 300);
});

formEl.addEventListener("submit", function (event) {
  event.preventDefault();

  state.search = searchEl.value;

  render();
});

function init() {
  loadFavorites();

  loadProducts();
}
document.querySelector("#year").textContent = new Date().getFullYear();

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  themeToggleEl.textContent = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains("dark")
    ? "light"
    : "dark";

  localStorage.setItem("theme", nextTheme);

  applyTheme(nextTheme);
}
init();
