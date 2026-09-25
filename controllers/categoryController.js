const db = require("../db/queries");
const { body, validationResult, matchedData } = require("express-validator");

const lengthErr = "Must be between 3 and 50 characters.";
const uniqueErr = "Category already exists.";

const validateCategory = [
  body("category_name")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage(lengthErr)
    .escape()
    .custom(async (value) => {
      const category = await db.findCategory({ category_name: value });
      if (category) {
        throw new Error(uniqueErr);
      }
      return true;
    }),
];

async function categorySearchGet(req, res, next) {
  try {
    const categories = await db.getAllCategories();

    res.render("categories", {
      TITLE: "All Categories",
      CATEGORIES: categories,
    });
  } catch (error) {
    next(error);
  }
}
const categoryCreatePost = [
  ...validateCategory,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const categories = await db.getAllCategories();
      if (!errors.isEmpty()) {
        return res.status(400).render("categories", {
          TITLE: "All Categories",
          CATEGORIES: categories,
          ERRORS: errors.array(),
          LASTPARAMS: req.body,
        });
      }
      const { category_name } = matchedData(req);
      await db.insertCategory(category_name);
      res.redirect("/categories");
    } catch (error) {
      next(error);
    }
  },
];

async function categoryDeletePost(req, res, next) {
  try {
    await db.deleteCategory(req.params.id);
    res.redirect("/categories");
  } catch (error) {
    if (error.code === "23503") //PostgreSQL error code
    {
      try {
        const categories = await db.getAllCategories();
        return res.status(400).render("categories", {
          TITLE: "All Categories",
          CATEGORIES: categories,
          ERRORS: [{ msg: "Cannot delete category that is still in use" }],
        });
      } catch (dbError) {
        next(dbError);
      }
    }
    next(error);
  }
}

module.exports = {
  categorySearchGet,
  categoryCreatePost,
  categoryDeletePost,
};
