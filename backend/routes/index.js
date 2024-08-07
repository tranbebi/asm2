var express = require('express');
var router = express.Router();

// Nhập model
const connectDb = require('../model/db');
const { ObjectId } = require('mongodb');

// Lấy tất cả sản phẩm dưới dạng JSON
router.get("/", async (req, res, next) => {
  const db = await connectDb();
  const productCollection = db.collection("products");
  const products = await productCollection.find().toArray();
  const categoriesCollection = db.collection("categories");
  const categories = await categoriesCollection.find().toArray();
  if (products) {
    products.map((item) =>{
      const category=categories.find(
        (cat) => cat._id.toString() === item.categoryId.toString()
      );

      item.category=category;
      return item;
      
    });
    res.status(200).json(products);
  } else {
    res.status(404).json({ message: "Không tìm thấy" });
  }
});

router.get('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = await connectDb();
    const productCollection = db.collection('products');
    const product = await productCollection.findOne({ _id: new ObjectId(id) });
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (err) {
    next(err);
  }
});

router.get('/user', async (req, res, next) => {
  const db = await connectDb();
  const userCollection = db.collection('categories');
  const users = await userCollection.find().toArray();
  if (users) {
    res.status(200).json(users);
  } else {
    res.status(404).json({ message: "Không tìm thấy" });
  }
});

// Lấy danh sách sản phẩm theo idcate
router.get('/productbycate/:id', async (req, res, next) => {
  const db = await connectDb();
  const productCollection = db.collection('products');
  const products = await productCollection.find({ categoryId: req.params.id }).toArray();
  if (products) {
    res.status(200).json(products);
  } else {
    res.status(404).json({ message: "Không tìm thấy" });
  }
});

router.get('/products/hot', async (req, res, next) => {
  const db = await connectDb();
  const productCollection = db.collection('products');
  try {
    const products = await productCollection.find({ view: { $gt: 100000 } }).toArray();

    if (products.length > 0) {
      res.status(200).json(products);
    } else {
      res.status(404).json({ message: "Không tìm thấy" });
    }
  } catch (error) {
    next(error);
  }
});

// Tìm kiếm theo sản phẩm
router.get('/search/:keyword', async (req, res, next) => {
  const db = await connectDb();
  const productCollection = db.collection('products');
  const products = await productCollection.find({ name: new RegExp(req.params.keyword, 'i') }).toArray();
  if (products) {
    res.status(200).json(products);
  } else {
    res.status(404).json({ message: "Không tìm thấy" });
  }
});

module.exports = router;