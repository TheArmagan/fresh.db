/**
 * @typedef {Object} FDBOptions FreshDB Options.
 * @property {String?} options.name Database name. (Default: db)
 * @property {String?} options.folderPath Database folder path. (Default: ./fresh.db)
 * @property {Boolean?} options.prettySave If its true before saving prettify the data. (Default: false)
 * @property {Number?} options.prettySaveSS Prettify spacing amount. (Default: 2)
 * @property {Boolean?} options.disableGetSetErrors If the setting is true, it does not care about the errors that occur while putting or receiving data in the database and tries again. (Default: false)
 * @property {Boolean?} options.DEBUG (Default: false)
 */

let fs = require("fs");
let _ = require("./lodash.js");
let mkdirp = require("./mkdirp");
let JSONParse = require("json-parse-helpfulerror").parse;
let clc = require("cli-color");
let JSONStringify = require("json-stringify-safe");
/**
 * The fresh db.
 * @param {FDBOptions} options
 * @
 */
const FreshDB = function (options = {}) {

    let self = this;

    global.FRESHDB_DEFAULT_OPTIONS = global.FRESHDB_DEFAULT_OPTIONS || {};
    options = Object.assign(options, global.FRESHDB_DEFAULT_OPTIONS);

    options.name = (typeof options.name == "undefined" ? "db" : String(options.name));
    options.folderPath = options.folderPath || `./fresh.db`;
    options.prettySave = options.prettySave || false;
    options.prettySaveSS = options.prettySaveSS || 2;
    options.disableGetSetErrors = options.disableGetSetErrors || false;
    options.DEBUG = options.DEBUG || false;

    this.options = options;

    let dbFileName = `${options.name}.fdb`;
    let dbPathName = `${options.folderPath}/${dbFileName}`;
    let dbFolderPath = options.folderPath;

    function debug(at = "", msg = "", ignoreDebugState = false) {
        if (options.DEBUG || ignoreDebugState) {
            console.log(
                clc.green(`[${new Date().toLocaleTimeString()}:${new Date().getMilliseconds()} FRESHDB]`),
                clc.blueBright(`[${at}]`),
                clc.yellow(`[${dbPathName}]`),
                msg
            );
        }
    }

    function fixFilePath() {
        if (!fs.existsSync(dbFolderPath)) {
            debug("FIXPATH", `${dbFolderPath} folder path creating.`);
            mkdirp(dbFolderPath);
        }
        if (!fs.existsSync(dbPathName)) {
            fs.writeFileSync(dbPathName, "{}");
            debug("FIXPATH", `${dbFolderPath} file creating.`);
        }
    }

    fixFilePath();

    function setDB(json) {
        try {
            fs.writeFileSync(dbPathName, JSONStringify(json, null, (options.prettySave ? options.prettySaveSS : 0)));
            debug("SET", "WRITE: OK");
        } catch (err) {
            debug("SET", "Trying to write the file. ERROR:\n" + err);
            debug("SET", "WRITE: ERROR");
            if (!options.disableGetSetErrors) throw err;
            setDB(json);
        }
    }

    function getDB() {
        let rawDBText = "";
        let parsedDB = {};
        try {
            rawDBText = fs.readFileSync(dbPathName);
            debug("GET", "READ: RAW");
        } catch (err) {
            debug("GET", "READ: RAW ERROR");
            debug("GET", "Trying to get the file. ERROR:\n" + err);
            fixFilePath();
            if (!options.disableGetSetErrors) throw err;
            return getDB();
        }

        try {
            parsedDB = JSONParse(rawDBText);
            debug("GET", "READ: RAW PARSE");
        } catch (err) {
            debug("GET", "READ: PARSE ERROR");
            debug("GET", "JSON Parsing error. Trying again:\n" + err);
            if (!options.disableGetSetErrors) throw err;
            return getDB();
        }
        return parsedDB;
    }

    /** 
     * is Database deleted?
     * @type {Boolean}
     */
    this.isDeleted = false;

    /**
     * Get data fram database synchronously.
     * @param {String} dataPath Data location
     * @param {any} defaultValue Data location
     * @returns {any}
     */
    this.get = function (dataPath, defaultValue) {
        let rawData = getDB();
        let result = _.get(rawData, dataPath);
        if (typeof result == "undefined") {
            let newData = _.set(rawData, dataPath, defaultValue);
            setDB(newData);
            result = defaultValue;
        }
        return result;
    };

    /**
     * Set data on database synchronously.
     * @param {String} dataPath Data location
     * @returns {any}
     */
    this.set = function (dataPath, value) {
        setDB(_.set(getDB(), dataPath, value));
        return value;
    };

    /**
     * Delete data on database synchronously.
     * @param {String} dataPath Data location
     * @returns {Boolean}
     */
    this.del = function (dataPath) {
        let data = getDB();
        let isWorked = _.unset(data, dataPath);
        setDB(data);
        return isWorked;
    };


    /**
     * Check data on database synchronously.
     * @param {String} dataPath Data location
     * @returns {Boolean}
     */
    this.has = function (dataPath) {
        return _.has(getDB(), dataPath);
    };


    /**
     * Clear the database synchronously.
     * @param {String} dataPath Data location
     * @returns {{}}
     */
    this.clear = function () {
        setDB({});
        return {};
    };

    /**
     * Get all data from database synchronously.
     * @returns {any}
     */
    this.getAll = function () {
        return getDB();
    };

    /**
     * Updates data on database synchronously with updater function.
     * Updater function needs to be return data.
     * 
     * @param {String} dataPath Data location
     * @param {function(data)} updater Updater function
     * 
     * @returns {any}
     */
    this.update = function (dataPath, updater) {
        setDB(_.update(getDB(), dataPath, updater));
        return _.get(getDB(), dataPath);
    };
    /**
     * db.update shorthands.
     */
    this.s = {
        push: function(dataPath, ...value) {
            let r;
            self.update(dataPath, (d) => {
                if (!Array.isArray(d)) {
                    if (!!d) throw new Error(`${options.name}, ${dataPath} is not an a array.`);
                    d = [];
                }
                r = d.push(...value);
                return d;
            });
            return r;
        },
        unshift: function(dataPath, ...value) {
            let r;
            self.update(dataPath, (d) => {
                if (!Array.isArray(d)) {
                    if (!!d) throw new Error(`${options.name}, ${dataPath} is not an a array.`);
                    d = [];
                }
                r = d.unshift(...value);
                return d;
            });
            return r;
        },
        shift: function (dataPath) {
            let r;
            self.update(dataPath, (d) => {
                if (!Array.isArray(d)) {
                    if (!!d) throw new Error(`${options.name}, ${dataPath} is not an a array.`);
                    d = [];
                }
                r = d.shift();
                return d;
            });
            return r;
        },
        pop: function(dataPath) {
            let r;
            self.update(dataPath, (d) => {
                if (!Array.isArray(d)) {
                    if (!!d) throw new Error(`${options.name}, ${dataPath} is not an a array.`);
                    d = [];
                }
                r = d.pop();
                return d;
            });
            return r;
        },
        splice: function(dataPath, index, deleteCount) {
            let r;
            self.update(dataPath, (d) => {
                if (!Array.isArray(d)) {
                    if (!!d) throw new Error(`${options.name}, ${dataPath} is not an a array.`);
                    d = [];
                }
                r = d.splice(index, deleteCount);
                return d;
            });
            return r;
        },
        add: function (dataPath, value) {
            return self.update(dataPath, (d) => {
                if (typeof d == "undefined") d = 0;
                d += value;
                return d;
            });
        },
        subtract: function (dataPath, value) {
            return self.update(dataPath, (d) => {
                if (typeof d == "undefined") d = 0;
                d -= value;
                return d;
            });
        },
        multiply: function (dataPath, value) {
            return self.update(dataPath, (d) => {
                if (typeof d == "undefined") d = 0;
                d *= value;
                return d;
            });
        },
        divide: function (dataPath, value) {
            return self.update(dataPath, (d) => {
                if (typeof d == "undefined") d = 0;
                d /= value;
                return d;
            });
        }
    };

    /**
     * Deletes the database asynchronously.
     */
    this.deleteDatabase = function () {
        self.isDeleted = true;
        return new Promise((resolve) => {
            fs.unlink(dbPathName, () => {
                resolve();
            });
        });
    };
};

module.exports = FreshDB;

/**
 * Changes tha freshdb's default options for the this node process.
 * `process.env.FRESHDB_DEFAULT_OPTIONS`
 * @param {FDBOptions} options
 */
module.exports.setDefaultOptions = (options = {}) => {
    global.FRESHDB_DEFAULT_OPTIONS = options;
    return true;
}