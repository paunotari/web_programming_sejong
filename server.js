const express = require('express');
const path = require('path');
const fs = require('fs');

//form
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static assets from custom folders
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'javascript')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes
app.get('/', (req, res) => {
  res.render('home');
});

//  Fixed: Load and pass product data to products.ejs
app.get('/products', (req, res) => {
  fs.readFile(path.join(__dirname, 'products', 'products.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error loading products');
    let products;
    try {
      products = JSON.parse(data);
    } catch (e) {
      return res.status(500).send('Error parsing products data');
    }
    // Filtering logic
    const search = (req.query.search || '').toLowerCase();
    const category = (req.query.category || '').toLowerCase();
    if (search) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(search) ||
        (p.description && p.description.toLowerCase().includes(search))
      );
    }
    if (category) {
      products = products.filter(p => p.category && p.category.toLowerCase() === category);
    }
    res.render('products', { products });
  });
});

// Route for individual product pages
app.get('/products/:slug', (req, res) => {
  fs.readFile(path.join(__dirname, 'products', 'products.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error loading products');
    let products;
    try {
      products = JSON.parse(data);
    } catch (e) {
      return res.status(500).send('Error parsing products data');
    }
    const product = products.find(p => p.slug === req.params.slug);
    if (!product) return res.status(404).sendFile(path.join(__dirname, '404.html'));
    res.render('productdetail', { product });
  });
});

// Support legacy .html and subfolder product URLs
app.get('/products/:category/:slug.html', (req, res) => {
  fs.readFile(path.join(__dirname, 'products', 'products.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error loading products');
    const products = JSON.parse(data);
    const slugify = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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

// About Us page
app.get('/about', (req, res) => {
  console.log('Rendering about_us EJS');
  res.render('about_us');
});

// Contact page
app.get('/contact', (req, res) => {
  res.render('contact');
});

//form POST and email
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) { //Checking if all fields were filled
    return res.status(400).render('contact', { error: 'All fields must be filled.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `${name} message`,
    text: `${name} (${email}) has sent to Gadgetcatalog:\n\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.render('contact', { success: 'Message successfully recieved.' });;
  } catch (error) {
    console.error(error);
    res.status(500).render('contact', { error: 'Error when sending the message.' });
  }
});


// API endpoint for product search/filter
app.get('/api/products', (req, res) => {
  fs.readFile(path.join(__dirname, 'products', 'products.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to load products.' });
    let products;
    try {
      products = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse products.' });
    }

    // Filtering
    const search = (req.query.search || '').toLowerCase();
    const category = (req.query.category || '').toLowerCase();

    if (search) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(search) ||
        (p.description && p.description.toLowerCase().includes(search))
      );
    }
    if (category) {
      products = products.filter(p => p.category && p.category.toLowerCase() === category);
    }
    res.json(products);
  });
});

// 404 Page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Intentional crash test
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

