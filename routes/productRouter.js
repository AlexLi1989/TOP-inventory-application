const { Router } = require("express");
const productRouter = Router();
const productController = require("../controllers/productController");

productRouter.post("/", productController.productCreatePost);
productRouter.get("/:id", productController.productEditGet);
productRouter.post("/:id", productController.productUpdatePost);
productRouter.post("/:id/delete", productController.productDeletePost);

module.exports = productRouter;
