'use strict';

const Code = require('code');
const expect = Code.expect;



const mongoose = require('mongoose');
const i18ngoose = require('../');




describe('i18n', () => {

	let Model;

	before(() => {

		let schema = new mongoose.Schema({
			title: {
				type: String,
				i18n: true
			},
			story: {
				type: String,
				i18n: true
			},
			sub: {
				test: {
					type: String,
					i18n: true
				}
			},
			huhu: {
				type: String
			},

			subdoc: [{
				testA: {
					type: String,
					i18n: true,
					default: '123'
				},
				testB: {
					type: String,
					i18n: true
				},
				testC: {
					type: String
				}
			}]
		})

		schema.plugin(i18ngoose, {
			languages: ['de', 'en', 'tr']
		});

		Model = mongoose.model('testmodel', schema);

	});


	let rawDoc = {
		title: 'title',
		story: 'story',
		sub: {
			test: 'test'
		},
		huhu: 'huhu'
	};



	describe('Model creation', () => {

		testForIso('de');
		testForIso('en');
		testForIso('tr');

		function testForIso(iso) {

			it(`should have attributes with iso: ${iso}`, () => {

				let model = Model.i18nInit(iso, rawDoc);

				expect(model.title[iso]).to.be.a.string();
				expect(model.title[iso]).to.equal(rawDoc.title);

				expect(model.story[iso]).to.be.a.string();
				expect(model.story[iso]).to.equal(rawDoc.story);

				expect(model.sub.test[iso]).to.be.a.string();
				expect(model.sub.test[iso]).to.equal(rawDoc.sub.test);

				expect(model.huhu).to.be.a.string();
				expect(model.huhu).to.equal(rawDoc.huhu);


				let translated = model.toObjectTranslated({ translation: iso });

				expect(translated.title).to.equal(rawDoc.title);
				expect(translated.story).to.equal(rawDoc.story);
				expect(translated.sub.test).to.equal(rawDoc.sub.test);
				expect(translated.huhu).to.equal(rawDoc.huhu);

				let json = model.toJSONTranslated({ translation: iso });

				expect(json.title).to.equal(rawDoc.title);
				expect(json.story).to.equal(rawDoc.story);
				expect(json.sub.test).to.equal(rawDoc.sub.test);
				expect(json.huhu).to.equal(rawDoc.huhu);
			});
		}

	});


	describe('Model setting attributes', () => {

		it('should set correct second iso', function() {

			let rawDoc = {
				title: 'title',
				story: 'story',
				sub: {
					test: 'test'
				},
				huhu: 'huhu'
			};

			let model = Model.i18nInit('de', rawDoc);

			model.i18nSet('en', { title: '123' });

			expect(model.title.de).to.equal(rawDoc.title);
			expect(model.title.en).to.equal('123');

		});

	});



	describe('subdocuments', () => {

		it('should... ', () => {
			var model = new Model();

			model.set({
				subdoc: [{
					testB: {
						de: '123'
					},
					testC: '345'
				}]
			});

			var submodel = model.subdoc[0];

			expect(submodel.testA.de).to.equal('123');
			expect(submodel.testA.en).to.equal('123');
			expect(submodel.testA.tr).to.equal('123');

			expect(submodel.testB.de).to.equal('123');

			expect(submodel.testC).to.equal('345');
		});

	});



})
