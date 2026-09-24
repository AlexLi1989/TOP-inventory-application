const db = require("../db/queries");
const { body, validationResult, matchedData } = require("express-validator");

//cloudinary module and config
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const nameLengthErr = "Must be between 3 and 100 characters.";
const descLengthErr = "Must be between 3 and 512 characters.";
const numericErr = "Must be a number.";

const validateProduct = [
  body("product_name")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage(nameLengthErr)
    .escape(),
  body("price").trim().isNumeric().withMessage(numericErr),
  body("quantity").trim().isNumeric().withMessage(numericErr),
  body("category_id").trim().isNumeric().withMessage(numericErr),
  body("description")
    .trim()
    .isLength({ min: 3, max: 512 })
    .withMessage(descLengthErr)
    .escape(),
];

async function productCreateGet(req, res, next) {
  try {
    const categories = await db.getAllCategories();

    res.render("add-product", {
      TITLE: "Add New Product",
      CATEGORIES: categories,
    });
  } catch (error) {
    next(error);
  }
}
const productCreatePost = [
  ...validateProduct,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const categories = await db.getAllCategories();
      if (!errors.isEmpty()) {
        return res.status(400).render("add-product", {
          TITLE: "Add New Product",
          CATEGORIES: categories,
          errors: errors.array(),
          LASTPARAMS: req.body,
        });
      }
      let imageUrl = "/assets/default_game.jpg"; //default game jpg
      if (req.file) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "board_gamania_products",
        });
        imageUrl = uploadResult.secure_url;
      }
      const product = matchedData(req);
      await db.insertProduct(product, imageUrl);
      res.redirect("/search");
    } catch (error) {
      next(error);
    }
  },
];
async function productEditGet(req, res, next) {
  try {
    const product = await db.getProduct(req.params.id);
    const categories = await db.getAllCategories();
    res.render("product-details", {
      TITLE: "Product Details",
      PRODUCT: product,
      CATEGORIES: categories,
    });
  } catch (error) {
    next(error);
  }
}
async function productEditPost(req, res, next) {
  try {
    const product_id = req.params.id;
    const {
      product_name,
      price,
      quantity,
      category_id,
      description,
      old_product_image_url, //remember the old image
    } = req.body;
    //set old image as default
    let finalImageUrl = old_product_image_url;
    //if new image url is provided , replace old
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "board_gamania_products",
      });
      finalImageUrl = uploadResult.secure_url;
    }

    await db.editProduct(
      product_name,
      price,
      quantity,
      category_id,
      description,
      finalImageUrl,
      product_id,
    );
    res.redirect(`/product/${product_id}`);
  } catch (error) {
    next(error);
  }
}
async function productDeletePost(req, res, next) {
  try {
    await db.deleteProduct(req.params.id);
    res.redirect("/search");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  productCreateGet,
  productCreatePost,
  productEditGet,
  productEditPost,
  productDeletePost,
};
