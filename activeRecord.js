var bookshelf = require('bookshelf');
var knex = require('knex');

class Model {

    get schema() {
        return this._schema;
    }
    get attrs() {
        return this._attrs;
    }
    get query() {
        return this._query.toString();
    }

    constructor(knex, schema, attrs,config) {
        this._knex = knex;
        this._schema = schema;
        this._query = knex(schema.tableName);
        if (attrs != null)
            this._set(attrs);
    }
    where() {
        var args = arguments;
        if (Array.isArray(args[0])) {
            args = args[0];
            for (var i = 0; args.length; i++) {
                this._query.whereRaw(args[i].name, args[i].value);
            }
        } else {
            this._query.whereRaw(args[0] + " = ?", args[1]);
        }
        return this;
    }
    whereRaw(raw, value) {
        this._query.whereRaw(raw, value);
        return this;
    }
    orderBy(column) {
        this._query.orderBy(column);
        return this;
    }
    orderByDesc(column) {
        this._query.orderBy(column, 'desc');
        return this;
    }
    limit(number) {
        this._query.limit(number);
        return this;
    }
    skip(number) {
        this._query.offset(number);
        return this;
    }

    forge() {
        return new Model(this.schema, this.attrs);
    }
    count() {
        var rThis = this;
        return new Promise(function (resolve, reject) {
            var query = rThis._query
                .count();
            rThis._on("query", query);
            query.asCallback(function (err, result) {
                if (err) {

                    rThis._on("error", query, err);
                    reject(err);
                }
                rThis._on("result", query, result);
                resolve(result[0]["count(*)"]);
            })
        });
    }
    save(attrs) {
        this._on("save");
        var rThis = this;
        return new Promise(function (resolve, reject) {

            rThis.count()
                .catch(reject)
                .then(function (c) {
                    if (c == 0) {
                        rThis.insert(attrs)
                            .catch(reject)
                            .then(resolve);
                    } else {
                        rThis.update(attrs)
                            .catch(reject)
                            .then(resolve);
                    }
                })
        });
    }
    update(attrs) {
        var rThis = this;
        return new Promise(function (resolve, reject) {

            var params = rThis.attrs;
            if (attrs != null)
                params = attrs;

            var query = rThis._query.update(params);
            rThis._on("query", query);
            query.asCallback(function (err, result) {
                if (err) {
                    rThis._on("error", query, err);

                    reject(err);
                }
                rThis._on("result", query, result);
                resolve(result);
            });
        });
    }
    insert(attrs) {
        var rThis = this;
        return new Promise(function (resolve, reject) {

            var params = rThis.attrs;
            if (attrs != null)
                params = attrs;

            var query = rThis._query.insert(params);
            rThis._on("query", query);
            query.asCallback(function (err, result) {
                if (err) {
                    rThis._on("error", query, err);

                    reject(err);
                }
                rThis._on("result", query, result);
                resolve(result);
            });
        });
    }
    remove(attrs){
        var rThis=this;
        return new Promise(function(resolve,reject){
            var params=rThis.attrs;
            if (attrs !=null )
                params=attrs;
            
            var query=rThis._query.remove(params);
            rThis.on("query",query);
            query.asCallback(function(err,result){
                if (err){
                    rThis._on("error",query,err);
                    reject(err);
                }
                rThis.on("result",query,result);
                resolve(result);
            });

        })
    }
    fetchOne() {
        var rThis = this;
        return new Promise(function (resolve, reject) {
            var query = rThis._query;
            rThis._on("query", query);
            query.asCallback(function (err, result) {
                if (err) {
                    rThis._on("error", query, err);
                    reject(err);
                }
                rThis._on("result", query, result);
                if (result.length == 0)
                    resolve(null);
                else
                    resolve(result[0]);
            });
        })
    }
    fetchAll() {
        var rThis = this;
        return new Promise(function (resolve, reject) {
            var query = rThis._query;
            rThis._on("query", query);
            query.asCallback(function (err, result) {
                if (err) {
                    rThis._on("error", query, err);
                    reject(err);
                }
                rThis._on("result", query, result);
                resolve(result);
            });
        })
    }


    // PRIVATE METHODS
    _on() {
        var name = arguments[0];
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
        for (var i = 0; i < this.schema.events.length; i++) {
            var event = this.schema.events[i];
            if (event.name == name) {
                event.func.apply(event, args);
            }
        }
    }
    _set(attrs) {
        var safeAtts = {};
        for (var prop in attrs) {
            if (this.schema.columns[prop] == null)
                continue;
            safeAtts[prop] = attrs[prop];
        }
        this._attrs = safeAtts;

        for (var i = 0; i < this.schema.primaryColumns.length; i++) {
            var column = this.schema.primaryColumns[i];
            if (this.attrs[column] == null)
                continue;
            this.where(column, this.attrs[column]);
        }
    }
    _getColumnsAsArray() {
        var result = [];
        this.schema.columns.map(function (column) {
            reuslt.add(columnd.name);
        });
        return result;
    }

}
class Schema {
    constructor(bookshelf) {
        this.tableName = "TABLE_NAME";
        this.columns = [];
        this.events = [];
        this.configName="";
    }
    config(name){
        this.configName= name;
        return this;
    }
    table(name) {
        this.tableName = name;
        return this;
    }
    key(columns) {
        if (Array.isArray(columns)) {
            this.primaryColumns = columns;
        } else {
            this.primaryColumns = [columns];
        }
        return this;
    }
    column(name, type, length, consts) {
        if (consts == null)
            consts = [];

        this.columns[name] = {
            name: name,
            type: type,
            length: length,
            consts: consts
        };
        return this;
    }
    on(name, func) {
        this.events.push({
            name: name,
            func: func
        });
        return this;
    }
}

module.exports = function (sarina) {

    sarina.factory("sarina.activerecord.config", ["options"], function (options) {
        var _configs;

        return {
            set(name,config) {
                if (_configs==null)
                    _configs={};
                _configs[name]=config;
            },
            get(name) {

                if (_configs == null || options.db[name]==null) {
                    return options.db[name];
                }

                return _configs[name];
            }
        }
    })

    sarina.service("knex.provider",function () {
        return {
            create:function(config){

                var pool={
                    min:0,
                    max:7
                };
                if (config.pool!=null)
                    pool=config.pool;

                return new knex({
                    client:config.client,
                    connection:config,
                    pool: pool
                });
            }
        };
    });
    sarina.factory("sarina.activerecord.provider", [
        "sarina.activerecord.config", 
        "knex.provider"
    ], function (config, knexProvider) {

        return {
            define: function () {
                var schema = new Schema();
                schema.create = function () {
                    return function(atts){
                        var knex=
                        knexProvider.create( config.get(schema.configName) );
                        return new Model(knex, schema, atts);
                    }
                }
                return schema;
            }
        }
    });


}