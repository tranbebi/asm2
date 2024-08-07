var express = require("express");
var router = express.Router();


//Import model
const connectDb = require("../model/db");
const { ObjectId } = require("mongodb");


//Lấy tất cả sản phẩm dạng json
router.get("/", async (req, res, next) => {
  const db = await connectDb();
  const categoriesCollection = db.collection("categories");
  const categories = await categoriesCollection.find().toArray();
  if (categories) {
    res.status(200).json(categories);
  } else {
    res.status(404).json({ message: "Không tìm thấy" });
  }
});
module.exports = router;