var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var oracle = require('oracledb');

var app = express();

const run = async () => {
    let connection;

    try {
        connection = await oracle.getConnection({});

        console.info('successfully connected to oracle db');
    } catch (err) {
        console.error(err);
    } finally {
        if(connection){
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
};

//run();


app.set("port", process.env.PORT || 3000);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/assets"));
app.use("/", require("./routes/web"));
app.use("/api", require("./routes/api"));

app.listen(app.get('port'), () => {
    console.log("Server started on port : ", app.get('port'));
});


