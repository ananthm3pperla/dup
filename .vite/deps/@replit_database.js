import { require_fs } from "./chunk-MG562XKQ.js";
import { __commonJS } from "./chunk-624QZG55.js";

// node_modules/@replit/database/node_modules/node-fetch/browser.js
var require_browser = __commonJS({
  "node_modules/@replit/database/node_modules/node-fetch/browser.js"(
    exports,
    module,
  ) {
    "use strict";
    var getGlobal = function () {
      if (typeof self !== "undefined") {
        return self;
      }
      if (typeof window !== "undefined") {
        return window;
      }
      if (typeof global !== "undefined") {
        return global;
      }
      throw new Error("unable to locate global object");
    };
    var globalObject = getGlobal();
    module.exports = exports = globalObject.fetch;
    if (globalObject.fetch) {
      exports.default = globalObject.fetch.bind(globalObject);
    }
    exports.Headers = globalObject.Headers;
    exports.Request = globalObject.Request;
    exports.Response = globalObject.Response;
  },
});

// node_modules/@replit/database/index.js
var require_database = __commonJS({
  "node_modules/@replit/database/index.js"(exports, module) {
    var fetch = require_browser();
    var fs = require_fs();
    var replitDBFilename = "/tmp/replitdb";
    var Client = class {
      /**
       * Initiates Class.
       * @param {String} key Custom database URL
       */
      constructor(key) {
        if (key) {
          this.key = key;
        } else {
          this.key = getKey();
          setInterval(
            () => {
              this.key = getKey();
            },
            1e3 * 60 * 60,
          );
        }
      }
      // Native Functions
      /**
       * Gets a key
       * @param {String} key Key
       * @param {boolean} [options.raw=false] Makes it so that we return the raw string value. Default is false.
       */
      async get(key, options) {
        return await fetch(this.key + "/" + key)
          .then((e) => e.text())
          .then((strValue) => {
            if (options && options.raw) {
              return strValue;
            }
            if (!strValue) {
              return null;
            }
            let value = strValue;
            try {
              value = JSON.parse(strValue);
            } catch (_err) {
              throw new SyntaxError(
                `Failed to parse value of ${key}, try passing a raw option to get the raw value`,
              );
            }
            if (value === null || value === void 0) {
              return null;
            }
            return value;
          });
      }
      /**
       * Sets a key
       * @param {String} key Key
       * @param {any} value Value
       */
      async set(key, value) {
        const strValue = JSON.stringify(value);
        await fetch(this.key, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: encodeURIComponent(key) + "=" + encodeURIComponent(strValue),
        });
        return this;
      }
      /**
       * Deletes a key
       * @param {String} key Key
       */
      async delete(key) {
        await fetch(this.key + "/" + key, { method: "DELETE" });
        return this;
      }
      /**
       * List key starting with a prefix or list all.
       * @param {String} prefix Filter keys starting with prefix.
       */
      async list(prefix = "") {
        return await fetch(
          this.key + `?encode=true&prefix=${encodeURIComponent(prefix)}`,
        )
          .then((r) => r.text())
          .then((t) => {
            if (t.length === 0) {
              return [];
            }
            return t.split("\n").map(decodeURIComponent);
          });
      }
      // Dynamic Functions
      /**
       * Clears the database.
       */
      async empty() {
        const promises = [];
        for (const key of await this.list()) {
          promises.push(this.delete(key));
        }
        await Promise.all(promises);
        return this;
      }
      /**
       * Get all key/value pairs and return as an object
       */
      async getAll() {
        let output = {};
        for (const key of await this.list()) {
          let value = await this.get(key);
          output[key] = value;
        }
        return output;
      }
      /**
       * Sets the entire database through an object.
       * @param {Object} obj The object.
       */
      async setAll(obj) {
        for (const key in obj) {
          let val = obj[key];
          await this.set(key, val);
        }
        return this;
      }
      /**
       * Delete multiple entries by keys
       * @param {Array<string>} args Keys
       */
      async deleteMultiple(...args) {
        const promises = [];
        for (const arg of args) {
          promises.push(this.delete(arg));
        }
        await Promise.all(promises);
        return this;
      }
    };
    module.exports = Client;
    function getKey() {
      try {
        return fs.readFileSync(replitDBFilename, "utf8");
      } catch (err) {
        return process.env.REPLIT_DB_URL;
      }
    }
  },
});
export default require_database();
//# sourceMappingURL=@replit_database.js.map
