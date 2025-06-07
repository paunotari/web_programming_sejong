const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static assets from custom folders
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'javascript')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve static HTML files from the root directory
app.use(express.static(__dirname, { extensions: ['html'] }));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Route for product listing
app.get('/products', (req, res) => {
  fs.readFile(path.join(__dirname, 'products', 'products.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error loading products');
    const products = JSON.parse(data);
    res.render('products', { products });
  });
});

// Route for individual product pages
app.get('/products/:slug', (req, res) => {
  fs.readFile(path.join(__dirname, 'products', 'products.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error loading products');
    const products = JSON.parse(data);
    // Slugify function: lowercases, replaces spaces and non-alphanumerics with dashes
    const slugify = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product = products.find(p => slugify(p.name) === req.params.slug);
    if (!product) return res.status(404).sendFile(path.join(__dirname, '404.html'));
    res.render('product', { product });
  });
});

// Support legacy .html and subfolder product URLs for dropdown menu compatibility
app.get('/products/:category/:slug.html', (req, res) => {
  fs.readFile(path.join(__dirname, 'products', 'products.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error loading products');
    const products = JSON.parse(data);
    const slugify = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    // Try to match by slug only (ignore category)
    const product = products.find(p => slugify(p.name) === req.params.slug);
    if (!product) return res.status(404).sendFile(path.join(__dirname, '404.html'));
    res.redirect(`/products/${slugify(product.name)}`);
  });
});

// Support legacy .html product URLs without category
app.get('/products/:slug.html', (req, res) => {
  fs.readFile(path.join(__dirname, 'products', 'products.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error loading products');
    const products = JSON.parse(data);
    const slugify = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product = products.find(p => slugify(p.name) === req.params.slug);
    if (!product) return res.status(404).sendFile(path.join(__dirname, '404.html'));
    res.redirect(`/products/${slugify(product.name)}`);
  });
});

// About Us page (support both /about_us and /about_us.html)
app.get('/about_us', (req, res) => {
  res.sendFile(path.join(__dirname, 'about_us.html'));
});

// Contact page
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

// 404 Page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



app.get('/force-error', (req, res) => {
  throw new Error('Intentional crash!');
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err.stack);
  res.status(500).send(`
    <h1>500 – Server Error</h1>
    <p>Something went wrong. Please try again later.</p>
    <a href="/">Return to Home</a>
  `);
});