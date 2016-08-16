var EXPRESS=require('express');
var ROUTER=EXPRESS.Router();

ROUTER.get('/', function(req, res, next){
    res.render('mdl_phonebook', {});
});

module.exports=ROUTER;
