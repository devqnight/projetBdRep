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


router.get("/users", async (req, res) => {

    let users = await oracle.doQuery(
        'SELECT * FROM COMPTE'
    );

    res.render("home/users", {users: users, error: req.query.error});
});

router.post("/addUser", async (req, res) => {
    let client = req.body.client;
    let initial = req.body.initial;

    let error = await oracle.doProc(
        'OUVRIRCOMPTE',
        {
            txt: ':nom, :initial',
            objects: {
                nom: client,
                initial: initial
            }
        }
    );

    res.redirect("/users?error="+error[0]);
})

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

router.get("/shop", async (req, res) => {
    let operations = await oracle.doQuery(
        "SELECT CODEVALEUR, DATEOP, NATURE, QTEOP, MONTANT FROM OPERATION ORDER BY DATEOP DESC"
    );

    let comptes = await oracle.doQuery(
        "SELECT NOMCLIENT, NUMCOMPTE FROM COMPTE"
    );

    let actions = await oracle.doQuery(
        "SELECT DENOMINATION, CODEVALEUR FROM VALEUR"
    );

    res.render("home/shop", {operations: operations, error: req.query.error || null, comptes: comptes, actions: actions});
});

router.post("/transaction", async (req, res, next) => {
    let numcompte = req.body.compte;
    let codevaleur = req.body.action;
    let type = req.body.type;
    let montant = req.body.montant;
    let quantite = req.body.quantite;

    let proc = '';

    if(type === "A"){
        proc = 'ACHETER'
    } else if(type === "V"){
        proc = 'VENDRE'
    }

    let error = await oracle.doProc(
        proc,
        {
            txt: ':numcpte, :code, :date, :quant, :ma',
            objects: {
                numcpte: numcompte,
                code: codevaleur,
                date: new Date(),
                quant: quantite,
                ma: montant
            }
        }
    );

    res.redirect("/shop?error="+error[0]);
});

router.get("/about", (req, res) => {
    res.render("home/about");
});

//router.get("/login", (req, res) => {
//    res.render("home/login");
//});

module.exports = router;