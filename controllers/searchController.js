const db = require("../db/queries");

async function productSearchGet(req, res, next) {
  try {
    //pass the query to db and let db do the logic
    const products = await db.searchInventory(req.query);
    const categories = await db.getAllCategories();

    res.render("search-products", {
      TITLE: "Search Products",
      PRODUCTS: products,
      CATEGORIES: categories,
      LASTPARAMS: req.query, //for rendering last search choices
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  productSearchGet,
};
