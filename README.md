#mongoose-i18n

Mongoose plugin for internationalization.

[![Build Status](https://travis-ci.org/platdesign/i18ngoose.svg?branch=master)](https://travis-ci.org/platdesign/i18ngoose)

#Install

`npm install --save i18ngoose`


#Usage

```javascript

const mongoose = require('mongoose');
const i18ngoose = require('i18ngoose');

// Create schema and define which attribute should be 'i18nable'
let schema = new mongoose.Schema({
	title: {
		type: String,
		i18n: true
	}
});

// Load plugin to schema and define languages
schema.plugin(i18ngoose, {
	languages: ['de', 'en', 'tr']
});

// Create mongoose model constrictor
const Model = mongoose.model('TestModel', schema);

// Init new document from Model for given language
let model = Model.i18nInit('en', {
	title: 'Hello'
});

// Set attributes for given language
model.i18nSet('de', {
	title: 'Hallo'
});

// work with the model (save, ...)
model.save().then(...);

// get translated object
let de = model.toObjectTranslated({ translation: 'de' });
let en = model.toObjectTranslated({ translation: 'en' });

// get translated json-object
let de = model.toJSONTranslated({ translation: 'de' });
let en = model.toJSONTranslated({ translation: 'en' });
```



#Author

Christian Blaschke <mail@platdesign.de>
