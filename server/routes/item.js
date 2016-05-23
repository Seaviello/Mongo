/**
 * Created by Seav on 17.05.2016.
 */

const express = require('express');
const ItemDAO = require('./DAO/ItemsDAO').ItemDAO;
const Promise = require('bluebird');
const config = require('../config').config;

function itemRouter(Item) {
	const items = new ItemDAO(Item);
	const initializedRouter = initialize();

	function initialize() {
		const router = express.Router();
		router.get('/:itemId', (req, res) => {
			const itemId = parseInt(req.params.itemId, 10);
			const promises = [
				items.getItem(itemId),
				items.getRelatedItems()
			];
			Promise.all(promises).then(([item, relatedItems]) => {
				if (item === null) {
					res.status(404).send('Item not found.');
					return;
				}
				const retrievedItem = Object.assign({},
					{ item: item._doc }, {
						userId: config.USERID
					});
				if ('reviews' in retrievedItem && retrievedItem.reviews.length > 0) {
					retrievedItem.numReviews = item.reviews.length;
					const sum = item.reviews.reduce((total, currReview) => total + currReview.stars);
					retrievedItem.stars = sum / retrievedItem.numReviews;
				}
				console.log(retrievedItem);
				console.log(retrievedItem.item.reviews.length);
				res.render('item', Object.assign(retrievedItem,
					{ numOfReviews: retrievedItem.item.reviews.length },
					{ relatedItems }));
			});
		});

		router.post('/:itemId/reviews', (req, res) => {
			const itemId = parseInt(req.params.itemId, 10);
			const comment = req.body.review;
			const name = req.body.name;
			const stars = parseInt(req.body.stars, 10);

			const review = {
				comment,
				name,
				stars,
				date: Date.now()
			};

			items.addReview(itemId, review).then(() => {
				res.redirect(`/item/${itemId}`);
			});
		});

		return router;
	}

	return {
		router: initializedRouter
	};
}

module.exports.itemRouter = itemRouter;
