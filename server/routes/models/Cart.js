/**
 * Created by Seav on 21.05.2016.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CartItemSchema = require('./Item').CartItemSchema;

const CartSchema = new Schema({
	_id: String,
	userId: String,
	items: [CartItemSchema]
});

class CartModel {
	constructor(connection) {
		this.Cart = connection.model('Cart', CartSchema);
	}
}

module.exports.CartModel = CartModel;
