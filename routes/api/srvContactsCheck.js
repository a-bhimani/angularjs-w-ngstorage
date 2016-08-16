var EXPRESS=require('express');
var ROUTER=EXPRESS.Router();
var UNDERSCORE=require('underscore');
var F_HANDLE=require('fs');
var DB_PHONEBOOK_PATH='dal/seed.json';
var DB_PHONEBOOK=[];
try{
    DB_PHONEBOOK=JSON.parse(F_HANDLE.readFileSync(DB_PHONEBOOK_PATH));
}catch(ex){
    ;
}


ROUTER.route('/:unique_param')
    .all(function(req, res, next){
	unique_param=req.params.unique_param;
	next();
    })

    //FETCH
    .get(function(req, res, next){
	var result={answer: 0};
	res.setHeader('Content-Type', 'application/json');
	UNDERSCORE.find(DB_PHONEBOOK.contacts, function(e){
	    if((e.phone.match(/\d+/g).join([])===unique_param) || (e.email===unique_param))
		result.answer=e.id;
	});
	res.send(result);
    });


module.exports=ROUTER;


