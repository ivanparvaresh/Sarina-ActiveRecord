var sarina=require("sarina");
var sarinaactiverecord=require("./../activerecord");

// create a sarina app by passing configuration
var app=sarina.create({
    db:{
        "default":{
            "client":"mysql",
            "host":"127.0.0.1",
            "database":"adserver",
            "user":"root",
            "password":""
        }
    }
});

// add to modules
app.module(sarinaactiverecord);

// Defining model
app.factory("Sample",["sarina.activerecord.provider"],function(ar){
    return ar.define()
        .config("default")
        .table("TbSample")
        .column("id","INT",11,["unique"])
        .column("TITLE","VARCHAR",50)
        .create();
});


// using model
app.service("sample.dataprovider",["Sample"],function(model){

    return {
        insert:function(title){
            return new Promise(function(resolve,reject){
                new model({
                    "title":title
                    })
                    .insert()
                    .then(resolve)
                    .catch(reject);
            });
        },
        update:function(id,title){
            return new Promise(function(resolve,reject){
                new model()
                    .where("id",id)
                    .update({
                        "title":title
                    })
                    .then(resolve)
                    .catch(reject);
            });
        },
        remove:function(id){
            return new Promise(function(resolve,reject){
                new model()
                    .where("id",id)
                    .remove()
                    .then(resolve)
                    .catch(reject);
            })
        },
        fetchAll:function(){
            return new Promise(function(resolve,reject){
                return new model()
                    .fetchAll()
                    .then(resolve)
                    .catch(reject);
            })
            
        }
    }
    

});


// add a executable process to sarina
app.exec("runner",["sample.dataprovider"],function(sampledp){
    return {
        run:function(){
            return new Promise(function(resolve,reject){
                sampledp.fetchAll()
                    .then(function(result){
                        console.log("Result:",result);
                    }).catch(reject);
            })
        }
    }
});

// finally we need to start app
app.start();