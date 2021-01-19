const express = require('express');
const router = express.Router();
const ProductController =require('../controller/product.controller');

router.post('/product',ProductController.createProduct);
router.get('/product/:name', ProductController.getProduct);
router.get('/product', ProductController.getProducts);


module.exports = router;