var express = require('express');
var path = require('path');
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var oracle = require('./params/oracle');

var app = express();

app.set("port", process.env.PORT || 3000);
app.use(bodyParser.urlencoded({extended:false}));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/assets"));
app.use("/", require("./routes/web"));
app.use("/api", require("./routes/api"));

app.listen(app.get('port'), () => {
    console.log("Server started on port : ", app.get('port'));
});

process.once('SIGTERM', async (code) => {
    console.log(`About to exit with code: ${code}`);
    await oracle.closePoolAndExit();
  });

//process
//    .once('SIGTERM', oracle.closePoolAndExit())
//    .once('SIGINT', oracle.closePoolAndExit());

oracle.init();

