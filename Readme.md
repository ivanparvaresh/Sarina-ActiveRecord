# Sarina.ActiveRecord

This plugin has implmeented ActiveRecord design pattern for sarina. 
Plugin created by [JavadParvaresh](https://github.com/javadparvaresh).

> In software engineering, the active record pattern is an architectural pattern found in software that stores in-memory object data in relational databases. It was named by Martin Fowler in his 2003 book Patterns of Enterprise Application Architecture.[1] The interface of an object conforming to this pattern would include functions such as Insert, Update, and Delete, plus properties that correspond more or less directly to the columns in the underlying database table.([wikipedia](https://en.wikipedia.org/wiki/Active_record_pattern))

Plugin has build on top of [Knex](https://github.com/tgriesser/knex) and [bookshelf](https://github.com/tgriesser/bookshelf).

## Table of contents
- [Quick Start](#quick-start)
- [Bugs and feature requests](#bugs-and-feature-requests)
- [The Basics](#the-basics)
- [The Configuration](#the-configuration)
- [Apis](#apis)

## Quick start

Several quick start options are available:
- Clone the repo: `git clone https://github.com/javadparvaresh/Sarina-ActiveRecord.git`
- Install with [npm](https://www.npmjs.com): `npm install sarinaactiverecord`

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
            "database":"SampleDb",
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

});


```



## Apis

1. Query 
```javascript

    //....

    new Model()
        .where("column1","equalto") 
        .where("column2","test") // an other where clause
        .whereRaw("columnd3 >= :column3",value)
        .orderBy("column4") // order by ascending
        .orderByDesc("column4") // order by descending
        .limit(1) // limiting fetched rows
        .skip(2) // skip rows 

        .count() // return count of Query
        .fetchOne() // return first matched record
        .fetchAll() // return all matched records

    //....

```

2. Manipulating Data
```javascript

    // ...

    // Insert or Update
    new Model({
        Column1 : "New Value"
    }).where("id",1)
    .save();

    // Insert
    new Model({
        Column1 : "New Value"
    })
    .insert();

    // Update
    new Model({
        Column1 : "New Value"
    }).where("id",1)
    .update();

    // Remove
    new Model()
        .where("id",1)
        .remove();

    // ...

```