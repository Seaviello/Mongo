/**
 * Created by Seav on 17.05.2016.
 */
const express = require('express');
const ItemDAO = require('./DAO/ItemsDAO').ItemDAO;
const CartDAO = require('./DAO/CartDAO').CartDAO;
const Promise = require('bluebird');
const config = require('../config').config;

function cartRouter(Cart, CartItem, Item) {
	const carts = new CartDAO(Cart);
	const items = new ItemDAO(Item);
	const router = initialize();

	function initialize() {
		const router = express.Router();
		
		router.get('/:userId/cart', (req, res) => {
			const userId = req.params.userId;
			const updated = req.query.updated || false;
			carts.getCart(userId).then((userCart) => renderCart(res, userCart, userId, updated));
		});

		router.post('/:userId/cart/items/:itemId', (req, res) => {
			const userId = req.params.userId;
			const itemId = parseInt(req.params.itemId, 10);

			carts.addItemToCart(userId, itemId).then(item => {
				if (item === null) {
					items.getItem(itemId).then((product) => {
						const newItem = new CartItem(Object.assign({}, product._doc, { quantity: 1 }));
						return carts.addItem(userId, newItem);
					});
				} else {
					return carts.updateQuantity(userId, itemId, item.quantity + 1);
				}
			}).then(() => res.redirect(`/user/${userId}/cart`));
		});

		router.post('/:userId/cart/items/:itemId/quantity', (req, res) => {
			const userId = req.params.userId;
			const itemId = parseInt(req.params.itemId, 10);
			const quantity = parseInt(req.body.quantity, 10);

			carts.updateQuantity(userId, itemId, quantity)
				.then(() => res.redirect(`/user/${userId}/cart?updated=true`));
		});

		return router;
	}

	function renderCart(res, userCart, userId, updated) {
		const total = userCart.items.reduce((totalPrice, currItem) => totalPrice + currItem.price * currItem.quantity, 0);
		res.render('cart',
			{
				userId,
				updated,
				cart: userCart,
				total
			});
	}

	return {
		router
	};
}

module.exports.cartRouter = cartRouter;
