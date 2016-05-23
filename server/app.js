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
const Promise = require('bluebird');

/* Internal dependencies */
const config = require('./config').config;
const ItemModel = require('./routes/models/Item').ItemModel;
const CartItemModel = require('./routes/models/Item').CartItemModel;
const CartModel = require('./routes/models/Cart').CartModel;
const itemRouter = require('./routes/item').itemRouter;
const cartRouter = require('./routes/cart').cartRouter;
const mainRouter = require('./routes/main').mainRouter;


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

/* Setting up db connection and models*/
mongoose.Promise = Promise;
const dbOptions = { promiseLibrary: Promise };
const connection = mongoose.createConnection(config.dbUrl, dbOptions);
const Item = new ItemModel(connection).Item;
const CartItem = new CartItemModel(connection).CartItem;
const Cart = new CartModel(connection).Cart;

/* Setting up router */
const itemsRoutes = itemRouter(Item).router;
const userRoutes = cartRouter(Cart, CartItem, Item).router;
const mainRoutes = mainRouter(Item).router;

// Use the router routes in our application
app.use('/', mainRoutes);
app.use('/item', itemsRoutes);
app.use('/user', userRoutes);

// Start the server listening
const server = app.listen(3000, () => {
	const port = server.address().port;
	console.log('Mongomart server listening on port %s.', port);
});
