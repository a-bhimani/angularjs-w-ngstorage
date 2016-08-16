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


//BACKUP
ROUTER.post('/', function(req, res, next){
    //DB_PHONEBOOK.contacts=req.body;
    F_HANDLE.rename(DB_PHONEBOOK_PATH, (DB_PHONEBOOK_PATH.split('.')[0] +'_'+ (new Date()).getTime() +'.json.bak'),
        function(){
            var r_index=req.body.r_index;
            var triggers=req.body.triggers;
            var imgBaseURL='http://lorempixel.com/300/300/people/';
            UNDERSCORE.each(triggers, function(trigger, ix){
                if(trigger.doAdd){
                    var newID=0;
                    var new_contact=null;
                    newID=(UNDERSCORE.max(DB_PHONEBOOK.contacts, function(contact){return contact.id;}).id)+1;
                    UNDERSCORE.each(r_index, function(n_index, jy){
                        if(trigger.payload.id===n_index.localID)
                            r_index[jy].remoteID=newID;
                    });
                    new_contact=trigger.payload;
                    new_contact.id=newID;
                    new_contact.avatar=(imgBaseURL+newID);
                    DB_PHONEBOOK.contacts.push(new_contact);
                }

                if(trigger.doUpdate){
                    var updateID=trigger.payload.id;
                    UNDERSCORE.each(r_index, function(n_index, jy){
                        if(updateID===n_index.localID)
                            updateID=n_index.remoteID;
                    });
                    UNDERSCORE.each(DB_PHONEBOOK.contacts, function(contact, ix){
                        if(contact.id===updateID){
                            DB_PHONEBOOK.contacts[ix]=trigger.payload;
                            DB_PHONEBOOK.contacts[ix].id=updateID;
                            DB_PHONEBOOK.contacts[ix].avatar=(imgBaseURL+updateID);
                        }
                    });
                }

                if(trigger.doDelete){
                    var deleteID=trigger.payload.id;
                    UNDERSCORE.each(r_index, function(n_index, jy){
                        if(deleteID===n_index.localID)
                            deleteID=n_index.remoteID;
                    });
                    UNDERSCORE.each(DB_PHONEBOOK.contacts, function(contact, ix){
                        if(contact.id===deleteID)
                            DB_PHONEBOOK.contacts.splice(ix, 1);
                    });
                }
            });
            F_HANDLE.writeFileSync(DB_PHONEBOOK_PATH, JSON.stringify(DB_PHONEBOOK));
        });
    res.sendStatus(200);
});


module.exports=ROUTER;


