var express = require('express');
var router = express.Router();

router.get("/", (req, res) => {
    res.json("this is a json status code for the user api");
})

module.exports = router;