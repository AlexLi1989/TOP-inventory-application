const { Router } = require("express");
const categoryRouter = Router();
const categoryController = require("../controllers/categoryController");

categoryRouter.get("/", categoryController.categorySearchGet);
categoryRouter.post("/", categoryController.categoryCreatePost);
categoryRouter.post("/:id/delete", categoryController.categoryDeletePost);

module.exports = categoryRouter;
