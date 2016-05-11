'use strict';

const mongoose = require('mongoose');
const i18ngoose = require('../');


class Helpers {

	static createModel(schemaDef, pluginConf) {

		var schema = new mongoose.Schema(schemaDef);

		schema.plugin(i18ngoose, pluginConf);

		return mongoose.model('testmodel', schema);
	}


	static clearModelDefs() {
		mongoose.models = {};
	}

}


module.exports = Helpers;
