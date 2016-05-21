/**
 * Created by Seav on 17.05.2016.
 */
const express = require('express');
const CartDAO = require('./CartDAO').CartDAO;
const ItemsDAO = require('./ItemsDAO').ItemDAO;


function userRouter(database) {
	const cart = new CartDAO(database);
	const items = new ItemsDAO(database);
	const router = initialize();

	function initialize() {
		const router = express.Router();
		router.get('/:userId/cart', (req, res) => {
			const userId = req.params.userId;
			cart.getCart(userId, userCart => {
				const total = cartTotal(userCart);
				res.render('cart', { userId, updated: false, cart: userCart, total });
			});
		});
		router.post('/:userId/cart/items/:itemId', (req, res) => {
			const userId = req.params.userId;
			const itemId = parseInt(req.params.itemId, 10);

			const renderCart = userCart => {
				const total = cartTotal(userCart);
				res.render('cart',
					{
						userId,
						updated: true,
						cart: userCart,
						total
					});
			};

			cart.itemInCart(userId, itemId, item => {
				if (item === null) {
					items.getItem(itemId, (product) => {
						product.quantity = 1;
						cart.addItem(userId, product, userCart => renderCart(userCart));
					});
				} else {
					cart.updateQuantity(userId, itemId, item.quantity + 1, userCart => renderCart(userCart));
				}
			});
		});
		router.post('/:userId/cart/items/:itemId/quantity', (req, res) => {
			const userId = req.params.userId;
			const itemId = parseInt(req.params.itemId, 10);
			const quantity = parseInt(req.body.quantity, 10);

			cart.updateQuantity(userId, itemId, quantity, userCart => {
				const total = cartTotal(userCart);
				res.render('cart',
					{
						userId,
						updated: true,
						cart: userCart,
						total
					});
			});
		});

		return router;
	}

	function cartTotal(userCart) {
		let total = 0;
		for (let i = 0; i < userCart.items.length; i++) {
			const item = userCart.items[i];
			total += item.price * item.quantity;
		}
		return total;
	}
	
	return {
		router
	};
}

module.exports.userRouter = userRouter;
