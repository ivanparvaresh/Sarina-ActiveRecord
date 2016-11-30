var bookshelf = require('bookshelf');
var knex = require('knex');

class Model{

    get schema(){
        return this._schema;
    }
    get attrs(){
        return this._attrs;
    }
    get query(){
        return this._query;
    }

    constructor(knex,schema,attrs,config){
        this._knex=knex;
        this._schema=schema;
        this._config=config;
        this._query=knex(schema.tableName);
        if (attrs!=null)
            this._set(attrs);
    }
    where(){
        var args=arguments;
        if (Array.isArray(args[0])){
            args=args[0];
            for(var i=0;args.length;i++){
                this._query.whereRaw(args[i].name,args[i].value);
            }
        }else{
            this._query.whereRaw(args[0] + " = ?" , args[1]);
        }
        return this;
    }
    whereRaw(raw,value){
        this._query.whereRaw(raw,value);
        return this;
    }
    orderBy(column){
        this._query.orderBy(column);
        return this;
    }
    orderByDesc(column){
        this._query.orderBy(column, 'desc');
        return this;
    }
    limit(number){
        this._query.limit(number);
        return this;
    }
    skip(number){
        this._query.offset(number);
        return this;
    }

    forge(){
        return new Model(this.schema,this.attrs);
    }
    count(){
        var rThis=this;
        return new Promise(function(resolve,reject){
            var query=rThis.query
                .count();
            rThis._on("query",query);
            query.asCallback(function(err,result){
                if (err){
                    
                    rThis._on("error",query,err);
                    reject(err);
                }
                rThis._on("result",query,result);
                resolve(result[0]["count(*)"]);
            })
        });
    }
    save(attrs){
        this._on("save");
        var rThis=this;
        return new Promise(function(resolve,reject){
            
            rThis.count()
                .catch(reject)
                .then(function(c){
                    if (c==0){
                        rThis.insert(attrs)
                            .catch(reject)
                            .then(resolve);
                    }else{
                        rThis.update(attrs)
                            .catch(reject)
                            .then(resolve);
                    }
                })
        });
    }
    update(attrs){
        var rThis=this;
        return new Promise(function(resolve,reject){

            var params=rThis.attrs;
            if (attrs!=null)
                params=attrs;

            var query=rThis.query.update(params);
            rThis._on("query",query);
            query.asCallback(function(err,result){
                if (err){
                    rThis._on("error",query,err);
                    
                    reject(err);
                }
                rThis._on("result",query,result);
                resolve(result);
            });
        });
    }
    insert(attrs){
        var rThis=this;
        return new Promise(function(resolve,reject){

            var params=rThis.attrs;
            if (attrs!=null)
                params=attrs;

            var query=rThis.query.insert(params);
            rThis._on("query",query);
            query.asCallback(function(err,result){
                if (err){
                    rThis._on("error",query,err);
                    
                    reject(err);
                }
                rThis._on("result",query,result);
                resolve(result);
            });
        });
    }
    fetchOne(){
        var rThis=this;
        return new Promise(function(resolve,reject){
            var query=rThis.query;
            rThis._on("query",query);
            query.asCallback(function(err,result){
                if (err){
                    rThis._on("error",query,err);
                    reject(err);
                }
                rThis._on("result",query,result);
                if (result.length==0)
                    resolve(null);
                else
                    resolve(result[0]);
            });
        })
    }
    fetchAll(){
        var rThis=this;
        return new Promise(function(resolve,reject){
            var query=rThis.query;
            rThis._on("query",query);
            query.asCallback(function(err,result){
                if (err){
                    rThis._on("error",query,err);
                    reject(err);
                }
                rThis._on("result",query,result);
                resolve(result);
            });
        })
    }


    // PRIVATE METHODS
    _on(){
        var name=arguments[0];
        var args=[];
        for(var i=1;i<arguments.length;i++){
            args[i-1]=arguments[i];
        }
        for(var i=0;i<this.schema.events.length;i++){
            var event=this.schema.events[i];
            if (event.name==name){
                event.func.apply(event,args);
            }
        }
    }
    _set(attrs){
        var safeAtts={};
        for(var prop in attrs){
            if (this.schema.columns[prop]==null)
                continue;
            safeAtts[prop]=attrs[prop];
        }
        this._attrs=safeAtts;

        for(var i=0;i<this.schema.primaryColumns.length;i++){
            var column=this.schema.primaryColumns[i];
            if (this.attrs[column]==null)
                continue;
            this.where(column,this.attrs[column]);
        }
    }
    _getColumnsAsArray(){
        var result=[];
        this.schema.columns.map(function(column){
            reuslt.add(columnd.name);
        });
        return result;
    }

}
class Schema{
    constructor(bookshelf){
        this.tableName="TABLE_NAME";
        this.columns=[];
        this.events=[];
    }
    table(name){
        this.tableName=name;
        return this;
    }
    key(columns){
        if (Array.isArray(columns)){
            this.primaryColumns=columns;
        }else{
            this.primaryColumns=[columns];
        }
        return this;
    }
    column(name,type,length,consts){
        if (consts==null)
            consts=[];

        this.columns[name]={
            name:name,
            type:type,
            length:length,
            consts:consts
        };
        return this;
    }
    on(name,func){
        this.events.push({
            name:name,
            func:func
        });
        return this;
    }
}

module.exports=function(sarina){
    
    sarina.factory("knex",["sarina","config"],function(sarina,config) {
        return knex({
            client: 'mysql',
            connection: config.db["default"]
        });
    });
    sarina.factory("activeRecord",["sarina","config","knex"],function(sarina,config,knex) {

        var defaults={
            debug:false
        }
        if (config.debug)
            defaults.debug=true;

        return {
            define:function(){
                var schema = new Schema();
                schema.create=function(){
                    var model=function(atts){
                        return new Model(knex,schema,atts,defaults);
                    }
                    return model;
                }
                return schema;
            }
        }
    });

    
}