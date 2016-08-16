var EXPRESS=require('express');
var ROUTER=EXPRESS.Router();

/* GET home page. */
ROUTER.get('/', function(req, res, next){
    res.redirect('/phonebook');
});

module.exports=ROUTER;
