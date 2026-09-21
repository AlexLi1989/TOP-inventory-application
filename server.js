const express = require("express");
const app = express();
const path = require("node:path");

require("dotenv").config();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

//routers
const indexRouter = require("./routes/indexRouter");
const searchRouter = require("./routes/searchRouter");
const productRouter = require("./routes/productRouter");

//routes
app.use("/", indexRouter);
app.use("/search", searchRouter);
app.use("/product", productRouter);

//404 route
app.use((req, res) => {
  res.status(404).render("404", { TITLE: "404 Not Found" });
});

//500 route
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("500", { TITLE: "500 Internal Server Error" });
});

//server
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`PostgreSQL practice - listening on port ${PORT}!`);
});

server.on("error", (error) => {
  console.error("server failed to start, error : ", error.message);
  throw error;
});
