const pool = require("./pool");

async function getAllMessages() {
  const { rows } = await pool.query("SELECT * FROM messages");
  return rows;
}

async function insertUserMessage(name, message, added) {
  await pool.query(
    "INSERT INTO messages (name, message, added) VALUES ($1,$2,$3)",
    [name, message, added],
  );
}

async function getUserMessage(messageId) {
  const { rows } = await pool.query(
    "SELECT * FROM messages WHERE messages.id = $1",
    [messageId],
  );
  return rows[0];
}

async function deleteUserMessage(messageId) {
  await pool.query("DELETE FROM messages WHERE messages.id = $1", [messageId]);
}

module.exports = {
  getAllMessages,
  getUserMessage,
  insertUserMessage,
  deleteUserMessage,
};
