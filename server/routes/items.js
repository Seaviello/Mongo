/**
 * Created by Seav on 17.05.2016.
 */

const express = require('express');
const ItemDAO = require('./ItemsDAO').ItemDAO;

function itemRouter(database, userId) {
	const items = new ItemDAO(database);
	const router = initialize();

	function initialize() {
		const router = express.Router();
		router.get('/:itemId', (req, res) => {
			const itemId = parseInt(req.params.itemId, 10);
			items.getItem(itemId, (item) => {
				if (item === null) {
					res.status(404).send('Item not found.');
					return;
				}

				let stars = 0;
				let numReviews = 0;
				let reviews = [];

				if ('reviews' in item) {
					numReviews = item.reviews.length;

					for (let i = 0; i < numReviews; i++) {
						const review = item.reviews[i];
						stars += review.stars;
					}

					if (numReviews > 0) {
						stars = stars / numReviews;
						reviews = item.reviews;
					}
				}

				items.getRelatedItems(relatedItems => {
					res.render('item',
						{
							userId: this.userId,
							item,
							stars,
							reviews,
							numReviews,
							relatedItems
						});
				});
			})
			;
		});

		router.post('/:itemId/reviews', (req, res) => {
			const itemId = parseInt(req.params.itemId, 10);
			const review = req.body.review;
			const name = req.body.name;
			const stars = parseInt(req.body.stars, 10);

			items.addReview(itemId, review, name, stars, () => {
				res.redirect(`/${itemId}`);
			});
		});

		return router;
	}
	
	return {
		router
	};
}

module.exports.itemRouter = itemRouter;
