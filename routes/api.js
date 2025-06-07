// routes/api.js
const express = require('express');
const router  = express.Router();
// require will automatically parse JSON:
const products = require('../data/products.json');

router.get('/products', (req, res) => {
  const { category = '', search = '' } = req.query;
  const s = search.toLowerCase();

  const filtered = products.filter(p => {
    const matchCat  = !category || p.category.toLowerCase() === category.toLowerCase();
    const matchText = !search   || 
      p.name.toLowerCase().includes(s) ||
      (p.description && p.description.toLowerCase().includes(s));
    return matchCat && matchText;
  });

  res.json(filtered);
});

module.exports = router;
// This code defines an Express router for handling API requests related to products.
// It imports the necessary modules, reads product data from a JSON file, and sets up a route to filter products based on category and search terms.