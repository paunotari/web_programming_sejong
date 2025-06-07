const express = require('express');
const router = express.Router();
const products = require('../products/products.json');

// Helper to slugify names
const slugify = str =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

router.get('/products', (req, res) => {
  res.render('products', { products });
});

router.get('/products/:slug', (req, res) => {
  const slug = req.params.slug;
  const product = products.find(p => p.slug === slug);

  if (!product) {
    return res.status(404).render('404', { message: 'Product not found' });
  }

  res.render('productDetail', { product });
});


router.get('/about_us', (req, res) => {
  res.render('about_us');
});

router.get('/contact', (req, res) => {
  res.render('contact');
});

router.get('/', (req, res) => {
  res.render('home');
});

module.exports = router;
