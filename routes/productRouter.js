const { Router } = require("express");
const productRouter = Router();
const productController = require("../controllers/productController");

//multer
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

productRouter.get("/new", productController.productCreateGet);
productRouter.post(
  "/new",
  upload.single("product_image"),
  productController.productCreatePost,
);
productRouter.get("/:id", productController.productEditGet);
productRouter.post(
  "/:id",
  upload.single("product_image"),
  productController.productEditPost,
);
productRouter.post("/:id/delete", productController.productDeletePost);

module.exports = productRouter;
