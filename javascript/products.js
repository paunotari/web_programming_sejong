let debounceTimer;

// 1) Debounce helper prevents spamming the API while typing
function debouncedFetch(delay = 300) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchProducts, delay);
}

// Utility function to slugify product names
function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

// 2) Core fetch + render logic
async function fetchProducts() {
  const search   = document.getElementById('searchInput').value.trim();
  const category = document.getElementById('categorySelect').value;

  // Build query string
  const params = new URLSearchParams();
  if (search)   params.append('search', search);
  if (category) params.append('category', category);

  // Show loading state
  const list = document.getElementById('productList');
  list.innerHTML = `<p>Loading…</p>`;

  try {
    const res = await fetch(`/api/products?${params.toString()}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const products = await res.json();

    // Render results
    if (products.length === 0) {
      list.innerHTML = `<p>No products found.</p>`;
    } else {
      list.innerHTML = products
        .map(p => `
          <div class="card">
            <img src="${p.image}" alt="${p.name}" loading="lazy" />
            <h3>${p.name}</h3>
            <p>${p.category}</p>
            <a href="/products/${p.slug}" class="view-button">View Details</a>
          </div>
        `).join('');
    }
  } catch (err) {
    list.innerHTML = `<p class="error">Something went wrong. Try again.</p>`;
    console.error(err);
  }
}

// 3) Initial load
// On page load, check for query params and set the search/category bar values accordingly
function setSearchBarFromURL() {
  const params = new URLSearchParams(window.location.search);
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const searchInput = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categorySelect');
  if (searchInput) searchInput.value = search;
  if (categorySelect) categorySelect.value = category;
}
document.addEventListener('DOMContentLoaded', () => {
  setSearchBarFromURL();
  fetchProducts();
});

// 4) Event listeners for search and category changes
document.getElementById('searchInput').addEventListener('input', () => debouncedFetch(300));
document.getElementById('categorySelect').addEventListener('change', fetchProducts);
