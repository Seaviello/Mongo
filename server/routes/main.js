/**
 * Created by Seav on 21.05.2016.
 */
const express = require('express');
const ItemDAO = require('./DAO/ItemsDAO').ItemDAO;
const config = require('../config').config;
const Promise = require('bluebird');

function mainRouter(Item) {
	const initializedRouter = initialize();
	const items = new ItemDAO(Item);

	function initialize() {
		const router = express.Router();
		router.get('/', (req, res) => {
			const page = req.query.page ? parseInt(req.query.page, 10) : 0;
			const category = req.query.category ? req.query.category : 'All';

			const promises = [
				items.getCategories(),
				items.getItems(category, page, config.ITEMS_PER_PAGE),
				items.getNumItems(category)
			];

			Promise.all(promises).then(([categories, pageItems, itemCount]) => {
				const totalCount = categories.reduce((total, cat) => total + cat.num, 0);
				const allCategories = [{ _id: 'All', num: totalCount }].concat(categories);
				let numPages = 0;
				if (itemCount > config.ITEMS_PER_PAGE) {
					numPages = Math.ceil(itemCount / config.ITEMS_PER_PAGE);
				}
				res.render('home', {
					category_param: category,
					useRangeBasedPagination: false,
					pages: numPages,
					items: pageItems,
					categories: allCategories,
					itemCount,
					page
				});
			});
		});

		router.get('/search', (req, res) => {
			const page = req.query.page ? parseInt(req.query.page, 10) : 0;
			const query = req.query.query ? req.query.query : '';
			const promises = [
				items.searchItems(query, page, config.ITEMS_PER_PAGE),
				items.getNumSearchItems(query)
			];

			Promise.all(promises)
				.then(([searchItems, itemCount]) => {
					let numPages = 0;
					if (itemCount > config.ITEMS_PER_PAGE) {
						numPages = Math.ceil(itemCount / config.ITEMS_PER_PAGE);
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

		router.get('/cart', (req, res) => {
			res.redirect(`/user/${config.USERID}/cart`);
		});

		return router;
	}

	return {
		router: initializedRouter
	};
}

module.exports.mainRouter = mainRouter;
