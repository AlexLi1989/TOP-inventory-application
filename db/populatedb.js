const { Client } = require("pg");
require("dotenv").config();

const SQL = `
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS categories;

CREATE TABLE IF NOT EXISTS categories(
  category_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  category_name VARCHAR(50) UNIQUE NOT NULL
  );

CREATE TABLE IF NOT EXISTS inventory (
  product_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  quantity INTEGER NOT NULL DEFAULT 0,
  category_id INTEGER REFERENCES categories(category_id) ON DELETE RESTRICT,
  description VARCHAR(512),
  product_image_url VARCHAR NOT NULL DEFAULT 'assets/default_game.jpg',
  added DATE DEFAULT CURRENT_DATE NOT NULL,
  updated DATE DEFAULT CURRENT_DATE NOT NULL
);

INSERT INTO categories(category_name)
VALUES
  ('Strategy'),
  ('Party & Social'),
  ('Cooperative'),
  ('Family & Kids'),
  ('Thematic & Immersive');

INSERT INTO inventory (product_name, price, quantity, category_id, description, product_image_url)
VALUES
  (
    'Catan',
    45.00,
    5,
    1,
    'A classic game of gathering resources and trading to build settlements on the island of Catan.',
    'https://res.cloudinary.com/diksoiqmo/image/upload/v1789963197/catan.webp'
  ),
  (
    'The Resistance: Avalon',
    25.50,
    3,
    2,
    'A game of social deduction where players try to unmask Arthur''s loyal knights or Mordred''s minions.',
    'https://res.cloudinary.com/diksoiqmo/image/upload/v1789963198/The_Resistance__Avalon.webp'
  ),
  (
    'Pandemic',
    39.99,
    6,
    3,
    'Four diseases have broken out in the world and it is up to a team of specialists to find cures.',
    'https://res.cloudinary.com/diksoiqmo/image/upload/v1789963198/pandemic.webp'
  ),
  (
    'Ticket to Ride',
    49.95,
    1,
    4,
    'A cross-country train adventure game where players collect train cards to claim railway routes.',
    'https://res.cloudinary.com/diksoiqmo/image/upload/v1789963164/ticket_to_ride.webp'
  ),
  (
    'Gloomhaven',
    140.00,
    2,
    5,
    'A tactical combat game in a persistent world of shifting motives and evolving campaigns.',
    'https://res.cloudinary.com/diksoiqmo/image/upload/v1789963198/gloomhaven.webp'
  );
`;

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: process.env.DB_URL,
  });
  try {
    await client.connect();
    console.log("connected");
    await client.query(SQL);
    console.log("seeded");
  } catch (error) {
    console.log(error);
  } finally {
    await client.end();
    console.log("done");
  }
}

main();
