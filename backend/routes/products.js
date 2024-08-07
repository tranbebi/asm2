var express = require("express");
var router = express.Router();


//Import model
const connectDb = require("../model/db");
const { ObjectId } = require("mongodb");
const multer = require("multer");
// const multer = require("multer");
let storage =multer.diskStorage({
  destination:function (req,file,cb) {
    cb(null,"./public/img")},
  filename:function (req, file, cb) {
    cb(null,file.originalname)
  }

});
function checkFileUpload(req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("Định dạng oki la "));
  }else{
    cb(null, true);
  }
}
let upload = multer({
  storage: storage,
  fileFilter: checkFileUpload,
  limits : {fileSize:50*1024*1024}
})

//Lấy tất cả sản phẩm dạng json
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


//Lấy sản phẩm theo id
router.get("/id/:id", async (req, res, next) => {
  const db = await connectDb();
  const productCollection = db.collection("products");
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
  const productCollection = db.collection("products");
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
  const productCollection = db.collection("products");
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
router.post("/",upload.single("image"), async (req, res, next) => {
  const db = await connectDb();
  const productCollection = db.collection("products");
  const newProduct = { 
    _id:null,
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    categoryId: new ObjectId(req.body.categoryId),
    image:req.file.originalname,
    rating: 0,
  };
  const products = await productCollection.insertOne(newProduct);
  if (products.insertedId) {
    res.status(200).json({message:"thêm sản phẩm thành công"});
  } else {
    res.status(404).json({ message: "Không tìm thấy" });
  }
});

//Xóa sản phẩm
router.delete('/deleteproduct/:id', async (req, res, next) => {
  const db = await connectDb();
  const productCollection = db.collection('products');
  const id = new ObjectId(req.params.id);
  try {
    const result = await productCollection.deleteOne({ _id: id });
    if (result.deletedCount) {
      res.status(200).json({ message: "Xóa sản phẩm thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại" });
  }
});

//Sửa sản phẩm
router.put('/updateproduct/:id', upload.single('image'), async (req, res, next) => {
  const db = await connectDb();
  const productCollection = db.collection('products');
  const id = new ObjectId(req.params.id);
  const { name, price, description, categoryId } = req.body;
  let updatedProduct = { name, price, description, categoryId }; 

  if (req.file) {
    const image = req.file.originalname;
    updatedProduct.image = image; //
  }

  try {
    const result = await productCollection.updateOne({ _id: id }, { $set: updatedProduct });
    if (result.matchedCount) {
      res.status(200).json({ message: "Sửa sản phẩm thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại" });
  }
});


module.exports = router;
