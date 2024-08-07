var express = require("express");
var router = express.Router();


//Import model
const connectDb = require("../model/db");
const { ObjectId } = require("mongodb");



//Lấy tất cả sản phẩm dạng json
router.get("/", async (req, res, next) => {
  const db = await connectDb();
  const productCollection = db.collection("orders");
  const products = await productCollection.find().toArray();
  if (products) {
    res.status(200).json(products);
  } else {
    res.status(404).json({ message: "Không tìm thấy" });
  }
});


//Lấy sản phẩm theo id
router.get("/id/:id", async (req, res, next) => {
  const db = await connectDb();
  const productCollection = db.collection("orders");
  const products = await productCollection.findOne({
    _id: new ObjectId(req.params.id),

  });
  const categoriesCollection = db.collection("categories");
  const categories = await categoriesCollection.findOne({
    _id: new ObjectId(products.categoryId),

  });
  
  if (products) {
    products.category=categories;
    res.status(200).json(products);
  } else {
    res.status(404).json({ message: "Không tìm thấy" });
  }
});


//Lấy danh sách sản phẩm theo categoryId
router.get("/byCategory/:id", async (req, res, next) => {
  const db = await connectDb();
  const productCollection = db.collection("orders");
  const products = await productCollection
    .find({ categoryId: new ObjectId(req.params.id) })
    .toArray();
  if (products) {
    res.status(200).json(products);
  } else {
    res.status(404).json({ message: "Không tìm thấy" });
  }
});


//Top 10 sản phẩm đánh giá tốt nhất
router.get("/topRating", async (req, res, next) => {
  const db = await connectDb();
  const productCollection = db.collection("orders");
  const products = await productCollection
    .find()
    .sort({ rating: -1 })
    .limit(10)
    .toArray();
  if (products) {
    res.status(200).json(products);
  } else {
    res.status(404).json({ message: "Không tìm thấy" });
  }
});
// thêm đơn hàng 
router.post("/", async (req, res, next) => {
  const db = await connectDb();
  const productCollection = db.collection("orders");
  const data = req.body;
  const result = await productCollection.insertOne(data);
  if (result.insertedId) {
    res.status(200).json(result);
  } else {
    res.status(404).json({ message: "Không tìm thấy" });
  }
});

module.exports = router;
