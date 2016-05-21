/*
 Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

 Licensed under the Apache License, Version 2.0 (the 'License');
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an 'AS IS' BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/* External dependencies*/
const express = require('express');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

/* Internal dependencies */
const ItemSchema = require('./schemas/ItemSchema').ItemSchema;
const CartSchema = require('./schemas/CartSchema').CartSchema;
const config = require('./config').config;

// Set up express
const app = express();
app.set('view engine', 'html');
app.set('views', `${__dirname}/../views`);
app.use('/static', express.static(`${__dirname}/../static`));
app.use(bodyParser.urlencoded({ extended: true }));

/*
 Configure nunjucks to work with express
 Not using consolidate because I'm waiting on better support for template inheritance with
 nunjucks via consolidate. See: https://github.com/tj/consolidate.js/pull/224
 */
const env = nunjucks.configure('views', {
	autoescape: true,
	express: app
});
const nunjucksDate = require('nunjucks-date');
nunjucksDate.setDefaultFormat('MMMM Do YYYY, h:mm:ss a');
env.addFilter('date', nunjucksDate);

/* Setting up db*/
const connection = mongoose.createConnection(config.dbUrl);
const Item = connection.model('Item', ItemSchema);
const Cart = connection.model('Cart', CartSchema);

MongoClient.connect('mongodb://localhost:27017/mongomart', (err, db) => {
	assert.equal(null, err, 'Could not connect to mongoDB database');
	console.log('Successfully connected to MongoDB.');


	const ItemDAO = require('./routes/itemsDAO').ItemDAO;
	const items = new ItemDAO(db);

	const router = express.Router();
	const itemsRoutes = require('./routes/items.js').itemRouter(db, USERID).router;
	const userRoutes = require('./routes/user.js').userRouter(db).router;

	// Homepage
	router.get('/', (req, res) => {
		const page = req.query.page ? parseInt(req.query.page, 10) : 0;
		const category = req.query.category ? req.query.category : 'All';

		items.getCategories(categories => {
			items.getItems(category, page, ITEMS_PER_PAGE, pageItems => {
				items.getNumItems(category, itemCount => {
					let numPages = 0;
					if (itemCount > ITEMS_PER_PAGE) {
						numPages = Math.ceil(itemCount / ITEMS_PER_PAGE);
					}

					res.render('home', {
						category_param: category,
						useRangeBasedPagination: false,
						pages: numPages,
						items: pageItems,
						categories,
						itemCount,
						page
					});
				});
			});
		});
	});

	router.get('/search', (req, res) => {
		const page = req.query.page ? parseInt(req.query.page, 10) : 0;
		const query = req.query.query ? req.query.query : '';

		items.searchItems(query, page, ITEMS_PER_PAGE, searchItems => {
			items.getNumSearchItems(query, itemCount => {
				let numPages = 0;

				if (itemCount > ITEMS_PER_PAGE) {
					numPages = Math.ceil(itemCount / ITEMS_PER_PAGE);
				}

				res.render('search', {
					queryString: query,
					itemCount,
					pages: numPages,
					page,
					items: searchItems
				});
			});
		});
	});
	/*
	 *
	 * Since we are not maintaining user sessions in this application, any interactions with
	 * the cart will be based on a single cart associated with the the USERID constant we have
	 * defined above.
	 *
	 */
	router.get('/cart', (req, res) => {
		res.redirect(`/user/${USERID}/cart`);
	});

	// Use the router routes in our application
	app.use('/', router);
	app.use('/items', itemsRoutes);
	app.use('/user', userRoutes);

	// Start the server listening
	const server = app.listen(3000, () => {
		const port = server.address().port;
		console.log('Mongomart server listening on port %s.', port);
	});
});
