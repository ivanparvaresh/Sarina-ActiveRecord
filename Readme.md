# Sarina.ActiveRecord

Sarina ActiveRecord is a implemented designpattern for Sarina. Active record allows developer to deal with database based on models. 
Sarina.ActiveRecord created by [JavadParvaresh](https://github.com/javadparvaresh).

Sarina.ActiveRecord has build on top of [Knex](https://github.com/tgriesser/knex) and [bookshelf](https://github.com/tgriesser/bookshelf)

## Table of contents
- [Quick Start](#quick-start)
- [Bugs and feature requests](#bugs-and-feature-requests)

## Quick start

Several quick start options are available:
- Clone the repo: `git clone https://github.com/javadparvaresh/Sarina-ActiveRecord.git`
- Install with [npm](https://www.npmjs.com): `npm install sarinaactiverecord`

Read the [Getting started page](/doc/quickstart.md) for information on the framework contents, templates and examples, and more.

## Bugs and feature requests

Have a bug or a feature request? [please open a new issue](https://github.com/javadparvaresh/Sarina-ActiveRecord/issues/new).

## The Basics
```javascript

var sarina=require("sarina");
var sarinaactiverecord=require("sarinaactiverecord");

// create a sarina app by passing configuration
var app=sarina.create({
    db:{
        "default":{
            "client":"mysql",
            "host":"127.0.0.1",
            "database":"database",
            "user":"root",
            "password":""
        }
    }
});

// Defining model
app.factory("simpleModel",["sarina.activerecord"],function(ar){
    return 
        ar.define()
        .config("default")
        .table("tbSimple")
        .column("id","INT",33,["unique"])
        .column("title","VARCHAR",200)
        .create();
});


// using model
app.service("simpleService",["simpleModel"],function(simpleModel){

    return {
        insert:function(title){
            return new Promise(function(resolve,reject){
                new simpleModel({
                    "title":title
                    })
                    .insert()
                    .then(resolve)
                    .catch(reject);
            });
        },
        update:function(id,title){
            return new Promise(function(resolve,reject){
                new simpleModel()
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
                new simpleModel()
                    .where("id",id)
                    .remove()
                    .then(resolve)
                    .catch(reject);
            })
        }
        find:function(id){
            return new Promise(function(resolve,reject){
                return new simpleModel()
                    .where("id",id)
                    .whereRaw("id <= 10")
                    .orderByDesc("id")
                    .limit(1)
                    .fetchAll()
                    .then(resolve)
                    .catch(reject);
            })
            
        }
    }
    

});


// add a executable process to sarina
app.exec("runner",function(){
    return {
        run:function(){
            return new Promise(function(resolve,reject){
                console.log("hello wolrd");
                resolve(true);
            })
        }
    }
});

// finally we need to start app
app.start();

```

## The Configuration
```javascript

var sarina=require("sarina");
var sarinaactiverecord=require("sarinaactiverecord");

var app=sarina.create({});

app.config("sarina.customConfig",["sarina.activerecord.provider"],function(provider){

    provider.set("myConfig",{
        "client":"mysql",
        "host":"127.0.0.1",
        "database":"database",
        "user":"root",
        "password":""
    });

    app.factory("simpleModel",["sarina.activerecord"],function(ar){
        return 
            ar.define()
            .config("myConfig") // using my custom config
            .table("tbSimple")
            .column("id","INT",33,["unique"])
            .column("title","VARCHAR",200)
            .create();
    });

})


```

