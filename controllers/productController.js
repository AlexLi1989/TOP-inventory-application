const db = require("../db/queries");
const { body, validationResult, matchedData } = require("express-validator");
const fs = require("fs");

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
        if (req.file) {
          fs.unlink(req.file.path, () => {});
        }
        return res.status(400).render("add-product", {
          TITLE: "Add New Product",
          CATEGORIES: categories,
          ERRORS: errors.array(),
          LASTPARAMS: req.body,
        });
      }
      let imageUrl = "/assets/default_game.jpg"; //default game jpg
      if (req.file) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "board_gamania_products",
        });
        imageUrl = uploadResult.secure_url;
        fs.unlink(req.file.path, () => {});
      }
      const product = matchedData(req);
      await db.insertProduct(product, imageUrl);
      res.redirect("/search");
    } catch (error) {
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
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
const productEditPost = [
  ...validateProduct,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const product_id = req.params.id;
      const categories = await db.getAllCategories();
      const product = await db.getProduct(product_id);
      const { admin_password } = req.body;
      const isPasswordValid =
        admin_password === process.env.ADMIN_SECRET_PASSWORD;
      //check for 403 valid password first
      if (!isPasswordValid) {
        //clear local file storage
        if (req.file) {
          fs.unlink(req.file.path, () => {});
        }
        return res.status(403).render("product-details", {
          TITLE: "Product Details",
          PRODUCT: product,
          CATEGORIES: categories,
          ERRORS: [{ msg: "Invalid password." }],
          LASTPARAMS: req.body,
        });
      }
      if (!errors.isEmpty()) {
        if (req.file) {
          fs.unlink(req.file.path, () => {});
        }
        return res.status(400).render("product-details", {
          TITLE: "Product Details",
          PRODUCT: product,
          CATEGORIES: categories,
          ERRORS: errors.array(),
          LASTPARAMS: req.body,
        });
      }
      const { product_name, price, quantity, category_id, description } =
        matchedData(req);
      const {
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
        fs.unlink(req.file.path, () => {});
        await deleteCloudinaryImage(old_product_image_url);
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
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      next(error);
    }
  },
];
async function productDeletePost(req, res, next) {
  try {
    const product_id = req.params.id;
    const { admin_password } = req.body;
    const product = await db.getProduct(product_id);
    if (!product) {
      return res.redirect("/search");
    }
    if (admin_password !== process.env.ADMIN_SECRET_PASSWORD) {
      const categories = await db.getAllCategories();
      return res.status(403).render("product-details", {
        TITLE: "Product Details",
        PRODUCT: product,
        CATEGORIES: categories,
        ERRORS: [{ msg: "Invalid password." }],
        LASTPARAMS: req.body,
      });
    }
    const imageUrl = product.product_image_url;
    await deleteCloudinaryImage(imageUrl); //delete external resources first before database data
    await db.deleteProduct(product_id);
    res.redirect("/search");
  } catch (error) {
    next(error);
  }
}

//helper function for deleting old img on cloudinary eg: https://res.cloudinary.com/diksoiqmo/image/upload/v1790299819/board_gamania_products/catan.webp
async function deleteCloudinaryImage(url) {
  if (!url || url.includes("/assets/default_game.jpg")) {
    return;
  }
  try {
    if (url.includes("/board_gamania_products/")) {
      const fileStr = url.split("/board_gamania_products/")[1];
      const public_id = "board_gamania_products/" + fileStr.split(".")[0];
      await cloudinary.uploader.destroy(public_id);
    }
  } catch (error) {
    console.error("Error deleting cloudinary image:", error);
  }
}

module.exports = {
  productCreateGet,
  productCreatePost,
  productEditGet,
  productEditPost,
  productDeletePost,
};
