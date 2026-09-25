const pool = require("./pool");

//product search
async function searchInventory(queryParams) {
  let { category, productName, sortBy, order } = queryParams;

  if (category && !Array.isArray(category)) {
    category = [category];
  }

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

async function findCategory(categoryName) {
  const name = categoryName.category_name;
  const { rows } = await pool.query(
    "SELECT * from categories WHERE category_name = $1",
    [name],
  );
  return rows[0];
}

async function insertCategory(categoryName) {
  await pool.query("INSERT INTO categories (category_name) VALUES ($1)", [
    categoryName,
  ]);
}

async function deleteCategory(categoryId) {
  await pool.query("DELETE FROM categories WHERE category_id = $1", [
    categoryId,
  ]);
}
async function getProduct(product_id) {
  const { rows } = await pool.query(
    "SELECT inventory.*, categories.category_name FROM inventory JOIN categories ON inventory.category_id = categories.category_id WHERE product_id = $1",
    [product_id],
  );
  return rows[0];
}

async function insertProduct(product, imageUrl) {
  const { product_name, price, quantity, category_id, description } = product;
  await pool.query(
    "INSERT INTO inventory (product_name,price,quantity,category_id,description,product_image_url) VALUES ($1, $2, $3, $4, $5, $6)",
    [product_name, price, quantity, category_id, description, imageUrl],
  );
}

async function editProduct(
  product_name,
  price,
  quantity,
  category_id,
  description,
  finalImageUrl,
  product_id,
) {
  await pool.query(
    "UPDATE inventory SET product_name = $1, price = $2, quantity = $3, category_id = $4, description = $5, product_image_url = $6 WHERE product_id = $7",
    [
      product_name,
      price,
      quantity,
      category_id,
      description,
      finalImageUrl,
      product_id,
    ],
  );
}

async function deleteProduct(product_id) {
  await pool.query("DELETE FROM inventory WHERE product_id = $1", [product_id]);
}

module.exports = {
  searchInventory,
  getAllCategories,
  findCategory,
  insertCategory,
  deleteCategory,
  getProduct,
  insertProduct,
  editProduct,
  deleteProduct,
};
