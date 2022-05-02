var express = require('express');
var router = express.Router();
var oracle = require('../../params/oracle');

router.get("/", async (req, res) => {
    let stocks = await oracle.doQuery(
        'SELECT CodeValeur, Denomination, SecteurEconomique, Indice, Cours '+
        'FROM Valeur, Secteur ' + 
        'WHERE Valeur.CodeSe = Secteur.CodeSe ' +
        'ORDER BY CodeValeur'
    );

    let users = await oracle.doQuery(
        'SELECT * FROM COMPTE'
    );

    res.render("index", {stocks: stocks, users: users});
});

router.get("/home/:username", async (req, res) => {
    let accounts = await oracle.doQuery('SELECT * FROM COMPTE WHERE NOMCLIENT = \''+ req.params.username +'\'');
    let reps = [];
    for(let account of accounts){
        let repartitions = await oracle.doProcWithOutput('REPARTITIONPORTEFEUILLE',{
            txt: ':num, :crit',
            objects: {
                num: account.NUMCOMPTE,
                crit: null
            }
        });
        if(repartitions.length > 0)
            reps.push({
                account: account.NUMCOMPTE,
                rep: repartitions
            });
    }
    
    let total = await oracle.doQuery('SELECT totalportefeuille(\'' + req.params.username + '\') AS total FROM Dual');

    res.render('home/profile', {accounts: accounts, repartitions: reps, total: total, name: req.params.username});
})

router.get("/home", (req, res) => {
    res.render("home/home");
});

router.get("/about", (req, res) => {
    res.render("home/about");
});

//router.get("/login", (req, res) => {
//    res.render("home/login");
//});

module.exports = router;