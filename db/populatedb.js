const { Client } = require("pg");
require("dotenv").config();

const SQL = `
DROP TABLE IF EXISTS inventory;

CREATE TABLE IF NOT EXISTS inventory (
  ProductID INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  ProductName VARCHAR(100) NOT NULL,
  Price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  Category VARCHAR(50) NOT NULL CHECK (Category IN ('Strategy', 'Party & Social', 'Cooperative', 'Family & Kids', 'Thematic & Immersive')),
  Description VARCHAR(512),
  ProductImageURL VARCHAR NOT NULL DEFAULT 'assets/default_game.jpg',
  Added DATE DEFAULT CURRENT_DATE NOT NULL,
  Updated DATE DEFAULT CURRENT_DATE NOT NULL
);

INSERT INTO inventory (ProductName, Price, Category, Description, ProductImageURL)
VALUES
  (
    'Catan',
    45.00,
    'Strategy',
    'A classic game of gathering resources and trading to build settlements on the island of Catan.',
    'https://res.cloudinary.com/diksoiqmo/image/upload/v1789963197/catan.webp'
  ),
  (
    'The Resistance: Avalon',
    25.50,
    'Party & Social',
    'A game of social deduction where players try to unmask Arthur''s loyal knights or Mordred''s minions.',
    'https://res.cloudinary.com/diksoiqmo/image/upload/v1789963198/The_Resistance__Avalon.webp'
  ),
  (
    'Pandemic',
    39.99,
    'Cooperative',
    'Four diseases have broken out in the world and it is up to a team of specialists to find cures.',
    'https://res.cloudinary.com/diksoiqmo/image/upload/v1789963198/pandemic.webp'
  ),
  (
    'Ticket to Ride',
    49.95,
    'Family & Kids',
    'A cross-country train adventure game where players collect train cards to claim railway routes.',
    'https://res.cloudinary.com/diksoiqmo/image/upload/v1789963164/ticket_to_ride.webp'
  ),
  (
    'Gloomhaven',
    140.00,
    'Thematic & Immersive',
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
