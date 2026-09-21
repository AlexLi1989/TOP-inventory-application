const db = require("../db/queries");

async function productSearchGet(req, res, next) {
  try {
    const products = await db.searchInventory(req.query);

    res.render("search-products", {
      TITLE: "Search Products",
      PRODUCTS: products,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  productSearchGet,
};
