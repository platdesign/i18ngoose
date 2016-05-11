'use strict';

const Code = require('code');
const expect = Code.expect;



const mongoose = require('mongoose');
const i18ngoose = require('../');

const helper = require('./helper');


describe('i18ngoose', () => {


	describe('Init a new model', () => {

		// Remove all model defintions from mongoose instance
		afterEach(helper.clearModelDefs);



		describe('set i18n fields', () => {

			let model;

			beforeEach(() => {
				let Model = helper.createModel({
					title: {
						type: String,
						i18n: true,
						default: 'Z'
					}
				}, { languages: ['de', 'en'] });

				model = new Model({
					title: {
						de: 'A',
						tr: 'Q'
					}
				});
			});


			it('i18n fields should should be equal', () => {

				expect(model.title.de).to.equal('A');
				expect(model.title.en).to.equal('Z');
				expect(model.title.tr).to.be.undefined();

			});

			it('toObjectTranslated should return correct values', () => {

				let de = model.toObjectTranslated({ iso: 'de' });

				expect(de.title).to.equal('A');

				let en = model.toObjectTranslated({ iso: 'en' });

				expect(en.title).to.equal('Z');

				let tr = model.toObjectTranslated({ iso: 'tr' });

				expect(tr.title).to.be.undefined();

			});



			it('toJSONTranslated should return correct values', () => {

				let de = model.toJSONTranslated({ iso: 'de' });

				expect(de.title).to.equal('A');

				let en = model.toJSONTranslated({ iso: 'en' });

				expect(en.title).to.equal('Z');

				let tr = model.toJSONTranslated({ iso: 'tr' });

				expect(tr.title).to.be.undefined();

			});


		});



		describe('set i18n fields on subdocuments', () => {

			let model;

			beforeEach(() => {
				let Model = helper.createModel({
					head: {
						title: {
							type: String,
							i18n: true
						},
						teaser: {
							type: String,
							i18n: true
						}
					}
				}, { languages: ['de', 'en'] });

				model = new Model({
					head: {
						title: {
							de: 'A',
							en: 'B',
							tr: 'C'
						},
						teaser: {
							de: 'A',
							en: 'B',
							tr: 'C'
						}
					}
				});

			});


			it('i18n fields should should be equal', () => {

				expect(model.head.title.de).to.equal('A');
				expect(model.head.title.en).to.equal('B');
				expect(model.head.title.tr).to.be.undefined();

				expect(model.head.teaser.de).to.equal('A');
				expect(model.head.teaser.en).to.equal('B');
				expect(model.head.title.tr).to.be.undefined();

			});

			it('toObjectTranslated should return correct values', () => {

				let de = model.toObjectTranslated({ iso: 'de' });
				expect(de.head.title).to.equal('A');
				expect(de.head.teaser).to.equal('A');

				let en = model.toObjectTranslated({ iso: 'en' });
				expect(en.head.title).to.equal('B');
				expect(en.head.teaser).to.equal('B');

			});



			it('toJSONTranslated should return correct values', () => {

				let de = model.toJSONTranslated({ iso: 'de' });
				expect(de.head.title).to.equal('A');
				expect(de.head.teaser).to.equal('A');

				let en = model.toJSONTranslated({ iso: 'en' });
				expect(en.head.title).to.equal('B');
				expect(en.head.teaser).to.equal('B');

			});


		});



		describe('set i18n fields on subdocument-arrays', () => {

			let model;

			beforeEach(() => {
				let Model = helper.createModel({
					heads: [{
						title: {
							type: String,
							i18n: true
						},
						teaser: {
							type: String,
							i18n: true
						}
					}]
				}, { languages: ['de', 'en'] });

				model = new Model({
					heads: [{
						title: {
							de: 'A',
							en: 'B',
							tr: 'C'
						},
						teaser: {
							de: 'A',
							en: 'B',
							tr: 'C'
						}
					}]
				});

			});


			it('i18n fields should should be equal', () => {

				expect(model.heads[0].title.de).to.equal('A');
				expect(model.heads[0].title.en).to.equal('B');
				expect(model.heads[0].title.tr).to.be.undefined();

				expect(model.heads[0].teaser.de).to.equal('A');
				expect(model.heads[0].teaser.en).to.equal('B');
				expect(model.heads[0].title.tr).to.be.undefined();

			});

			it('toObjectTranslated should return correct values', () => {

				let de = model.toObjectTranslated({ iso: 'de' });
				expect(de.heads[0].title).to.equal('A');
				expect(de.heads[0].teaser).to.equal('A');

				let en = model.toObjectTranslated({ iso: 'en' });
				expect(en.heads[0].title).to.equal('B');
				expect(en.heads[0].teaser).to.equal('B');

			});



			it('toJSONTranslated should return correct values', () => {

				let de = model.toJSONTranslated({ iso: 'de' });
				expect(de.heads[0].title).to.equal('A');
				expect(de.heads[0].teaser).to.equal('A');

				let en = model.toJSONTranslated({ iso: 'en' });
				expect(en.heads[0].title).to.equal('B');
				expect(en.heads[0].teaser).to.equal('B');

			});


		});



		describe('init i18n model', () => {


			let Model;

			beforeEach(() => {
				Model = helper.createModel({
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
					}
				}, { languages: ['de', 'en', 'tr'] });
			});

			let rawDoc = {
				title: 'title',
				story: 'story',
				sub: {
					test: 'test'
				},
				huhu: 'huhu'
			};

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



	});



})
