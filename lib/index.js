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

	var localize = createLocalizer(schema);

	transformSchema(schema, options);




	schema.methods.toObjectTranslated = function(options) {

		let iso = options.translation || options.iso;

		if(!iso) {
			throw new Error('Missing iso');
		}

		let obj = Document.prototype.toObject.call(this, options);

		return localize(obj, iso);
	};





	schema.methods.toJSONTranslated = function(options) {

		let iso = options.translation || options.iso;

		if(!iso) {
			throw new Error('Missing iso');
		}

		let obj =  Document.prototype.toJSON.call(this, options);

		return localize(obj, iso);
	};





	schema.statics.i18nInit = function (iso, rawDoc) {

		let doc = new this();

		return assignRawDoc2IsoAttrs(doc, iso, rawDoc);
	};




	schema.methods.i18nSet = function(iso, rawDoc) {
		return assignRawDoc2IsoAttrs(this, iso, rawDoc);
	}










	// TODO: Refactor this! ;)
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



};












/**
 * Creates a function which localizes a given document to a given iso
 * @param  {Object} schema mongoose schema
 * @return {Function}      localozer function
 */
function createLocalizer(schema) {

	// Operations cache
	let ops = [];

	// Walk through given schema-paths and push operators
	schema.eachPath((path, config) => {

		// If path-attribute needs to be localized
		if(config.options.i18n === true && config.instance === 'String') {

			// Add new operator
			ops.push((obj, iso)=>{

				// isoPath
				let iPath = [path, iso].join('.');

				// isoValue
				let val = $parse(iPath)(obj);

				// Create a setter for "original" path
				let set = $parse(path).assign;

				// set value on given document object
				set(obj, val);
			});

		// If path-attribute is an array of subdocuments
		} else if(config.instance === 'Array' && config.schema) {

			// Create a new localizer for array-item-schema
			let arrayLocalizer = createLocalizer(config.schema);

			// Add new operator
			ops.push((obj, iso) => {

				// Get array from document
				let arr = $parse(path)(obj);

				// localize each item in array
				arr.forEach((item) => {
					arrayLocalizer(item, iso);
				});

			});
		}

	});

	// Return localizer function
	return function localizer(obj, iso) {

		// execute each operator on the given doc-object with given iso-value
		ops.forEach((fn)=>{

			// execute operator
			fn(obj, iso);

		});

		return obj;
	}

}







/**
 * Transforms a given schema to an i18n-schema
 * @param  {Object} schema  mongoose-schema
 * @param  {Object} options plugin-options
 * @return {Object}         mongoose-schema
 */
function transformSchema(schema, options) {

	// Walk through each schema-path
	schema.eachPath((path, config) => {

		// if attr has an i18n value which is true
		if (config.options.i18n === true) {

			// remove the original attr-config
			schema.remove(path);

			// Add new attr-config for each configured language
			options.languages.forEach((lang) => {
				let obj = {
					[lang]: config.options
				};

				return schema.add(obj, path + '.');
			});

		// if config is an own schema transform it recursively
		} else if(config.schema) {
			transformSchema(config.schema, options);
		}
	});

	return schema;
}





