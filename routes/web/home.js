var express = require('express');
var router = express.Router();

router.get("/", (req, res) => {
    res.render("index");
});

router.get("/home", (req, res) => {
    res.render("home/home");
});

router.get("/about", (req, res) => {
    res.render("home/about");
});

router.get("/login", (req, res) => {
    res.render("home/login");
});

module.exports = router;