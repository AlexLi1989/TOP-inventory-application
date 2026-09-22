const pool = require("./pool");

//product search
async function searchInventory(queryParams) {
  const { category, productName, sortBy, order } = queryParams;

  //base sql query
  let sql =
    "SELECT inventory.*,categories.category_name FROM inventory JOIN categories ON inventory.category_id = categories.category_id";
  let queryValues = [];
  let filterValues = [];
  let sqlOrder = "";
  let direction = "";

  //params contain name case
  if (productName) {
    queryValues.push(`%${productName}%`);
    filterValues.push(`product_name ILIKE $${queryValues.length}`);
  }
  //params contain one or more category
  if (category) {
    queryValues.push(category);
    filterValues.push(`categories.category_name = ANY($${queryValues.length})`);
  }
  //joining one or both query to base sql
  if (filterValues.length > 0) {
    sql += " WHERE " + filterValues.join(" AND ");
  }
  //sorting
  if (sortBy) {
    if (sortBy == "price") {
      sqlOrder = " ORDER by price";
    } else if (sortBy == "alpha") {
      sqlOrder = " ORDER by product_name";
    }
  }
  //ordering direction
  if (sortBy && order) {
    direction = order == "desc" ? " DESC" : " ASC";
    sqlOrder += direction;
  }
  sql += sqlOrder;
  const { rows } = await pool.query(sql, queryValues);
  return rows;
}

async function getAllCategories() {
  const { rows } = await pool.query(
    "SELECT * FROM categories ORDER BY category_name",
  );
  return rows;
}

async function insertInventory() {}

async function updateInventory() {}

async function deleteInventory(productId) {
  await pool.query("DELETE FROM inventory WHERE product_id = $1", [productId]);
}

module.exports = {
  searchInventory,
  getAllCategories,
  insertInventory,
  updateInventory,
  deleteInventory,
};
