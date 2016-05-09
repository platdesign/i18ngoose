/*

Heavily inspired by https://github.com/elrolito/mongoose-i18n


 */

'use strict';

const mongoose = require('mongoose');
const $parse = require('obj-parse');

const Document = mongoose.Document;

module.exports = (schema, options) => {
	if (!Array.isArray(options != null ? options.languages : void 0)) {
		throw new TypeError('Must pass an array of languages.');
	}

	schema.eachPath((path, config) => {
		var defaultPath, vPath;

		if (config.options.i18n === true) {
			removePathFromSchema(path, schema);

			options.languages.forEach((lang) => {
				var obj;
				obj = {};
				obj[lang] = config.options;
				if (config.options.required) {
					if ((options.defaultLanguage != null) && lang !== options.defaultLanguage) {
						delete obj[lang]['required'];
					}
				}
				return schema.add(obj, "" + path + ".");
			})

			if (options.defaultLanguage != null) {
				vPath = "" + path + ".i18n";
				defaultPath = "" + path + "." + options.defaultLanguage;
				schema.virtual(vPath).get(function() {
					return this.get(defaultPath);
				});
				return schema.virtual(vPath).set(function(value) {
					return this.set(defaultPath, value);
				});
			}
		}
	});


	function assignRawDoc2IsoAttrs(doc, iso, rawDoc) {
		schema.eachPath((path, config) => {

			let splittedPath = path.split('.');
			let pathIso = splittedPath[splittedPath.length - 1];
			let docSetter = $parse(path).assign;
			let rawVal;

			if(config.options.i18n === true && pathIso === iso) {

				rawVal = $parse( splittedPath.slice(0, splittedPath.length-1).join('.') )(rawDoc);

			} else if(config.options.i18n !== true) {

				rawVal = $parse( path )(rawDoc);

			}

			rawVal && docSetter(doc, rawVal);

		});

		return doc;
	}


	schema.statics.i18nInit = function (iso, rawDoc) {

		let doc = new this();

		return assignRawDoc2IsoAttrs(doc, iso, rawDoc);
	};


	schema.methods.i18nSet = function(iso, rawDoc) {
		return assignRawDoc2IsoAttrs(this, iso, rawDoc);
	}


	schema.methods.toObjectTranslated = function(options) {
		var key, populated, ret, translation, _ref;
		translation = void 0;
		if (options != null) {
			translation = options.translation;
			delete options.translation;
			if (Object.keys(options).length === 0) {
				options = void 0;
			}
		}
		ret = Document.prototype.toObject.call(this, options);
		if (translation != null) {
			translateObject(ret, schema, translation);
			_ref = this.$__.populated;
			for (key in _ref) {
				populated = _ref[key];
				translateObject(ret[key], populated.options.model.schema, translation);
			}
		}
		return ret;
	};


	schema.methods.toJSONTranslated = function(options) {
		var key, populated, ret, translation, _ref;
		translation = void 0;
		if (options != null) {
			translation = options.translation;
			delete options.translation;
			if (Object.keys(options).length === 0) {
				options = void 0;
			}
		}
		ret = Document.prototype.toJSON.call(this, options);
		if (translation != null) {
			translateObject(ret, schema, translation);
			_ref = this.$__.populated;
			for (key in _ref) {
				populated = _ref[key];
				translateObject(ret[key], populated.options.model.schema, translation);
			}
		}
		return ret;
	};

};



function translateObject(object, schema, translation) {
	var lastTranslatedField;
	lastTranslatedField = '';
	return schema.eachPath(function(path, config) {
		var child, index, keys, tree, _i, _len, _ref, _ref1, _results;
		if (config.options.i18n && !new RegExp("^" + lastTranslatedField + "\\.[^\.]+?$").test(path)) {
			lastTranslatedField = path.replace(/^(.*?)\.([^\.]+?)$/, '$1');
			keys = path.split('.');
			tree = object;
			while (keys.length > 2) {
				tree = tree[keys.shift()];
			}
			if (Array.isArray(tree)) {
				_results = [];
				for (index = _i = 0, _len = tree.length; _i < _len; index = ++_i) {
					child = tree[index];
					_results.push(tree[index][keys[0]] = (_ref = tree[index][keys[0]]) != null ? _ref[translation] : void 0);
				}
				return _results;
			} else {
				return tree[keys[0]] = (_ref1 = tree[keys[0]]) != null ? _ref1[translation] : void 0;
			}
		}
	});
};

function removePathFromSchema(path, schema) {
	var keys, tree;
	keys = path.split('.');
	tree = schema.tree;
	while (keys.length > 1) {
		tree = tree[keys.shift()];
	}
	delete tree[keys.shift()];
	return delete schema.paths[path];
};




