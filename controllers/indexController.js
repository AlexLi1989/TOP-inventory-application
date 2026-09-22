function index(req, res) {
  res.render("index", {
    TITLE: "Board Gamania - Home",
  });
}

module.exports = {
  index,
};
