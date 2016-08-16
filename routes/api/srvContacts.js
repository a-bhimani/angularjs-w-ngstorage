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


//MEDIATORS
var _getMaxID=function(){
    return UNDERSCORE.max(DB_PHONEBOOK.contacts, function(contact){
        return contact.id;
    });
};

var _fetchContactByID=function(contact_id){
    return UNDERSCORE.find(DB_PHONEBOOK.contacts, function(e){
        return e.id===parseInt(contact_id);
    });
};


//CRUD
//RETRIEVE
ROUTER.get('/', function(req, res, next){
    res.setHeader('Content-Type', 'application/json');
    res.send(DB_PHONEBOOK.contacts);
    //res.sendStatus(200);
});

//CREATE
ROUTER.post('/', function(req, res, next){
    var newID=((_getMaxID()).id+1);
    var new_contact={
        id: newID,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        birthday: req.body.birthday,
        avatar: ('http://lorempixel.com/300/300/people/'+ newID)
    };
    DB_PHONEBOOK.contacts.push(new_contact);
    F_HANDLE.writeFileSync(DB_PHONEBOOK_PATH, JSON.stringify(DB_PHONEBOOK));
    res.setHeader('Content-Type', 'application/json');
    res.send({__id: new_contact.id});
    res.sendStatus(200);
});

ROUTER.route('/:contact_id')
    .all(function(req, res, next){
        contact_id=parseInt(req.params.contact_id);
        next();
    })

    //FETCH
    .get(function(req, res, next){
        var contact=_fetchContactByID(contact_id);
        res.setHeader('Content-Type', 'application/json');
        res.send(contact);
        //res.sendStatus(200);
    })

    //UPDATE
    .put(function(req, res, next){
        var contact=_fetchContactByID(contact_id);
        contact.name=req.body.name;
        contact.phone=req.body.phone;
        contact.email=req.body.email;
        contact.birthday=req.body.birthday;
        F_HANDLE.writeFileSync(DB_PHONEBOOK_PATH, JSON.stringify(DB_PHONEBOOK));
        res.sendStatus(200);
    })

    //DELETE
    .delete(function(req, res, next){
        for(var ix=0; ix<DB_PHONEBOOK.contacts.length; ix++)
            if(DB_PHONEBOOK.contacts[ix].id===contact_id)
                DB_PHONEBOOK.contacts.splice(ix, 1);
        F_HANDLE.writeFileSync(DB_PHONEBOOK_PATH, JSON.stringify(DB_PHONEBOOK));
        res.sendStatus(200);
    });


module.exports=ROUTER;


