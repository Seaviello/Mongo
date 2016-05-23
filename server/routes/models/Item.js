/**
 * Created by Seav on 19.05.2016.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const categories = 'Umbrellas Stickers Kitchen Apparel Swag Office Books Electronics'.split(' ');

const item = {
	_id: Number,
	title: String,
	slogan: String,
	description: String,
	stars: Number,
	category: { type: String, enum: categories },
	img_url: String,
	price: Number,
	reviews: [
		{
			name: String,
			comment: String,
			stars: Number,
			date: Date
		}
	]
};

const cartItem = Object.assign({}, item, { quantity: Number });

const ItemSchema = new Schema(item);
const CartItemSchema = new Schema(cartItem);

class ItemModel {
	constructor(connection) {
		this.Item = connection.model('Item', ItemSchema);
	}
}

class CartItemModel {
	constructor(connection) {
		this.CartItem = connection.model('CartItem', CartItemSchema);
	}
}

module.exports.ItemSchema = ItemSchema;
module.exports.ItemModel = ItemModel;
module.exports.CartItemSchema = CartItemSchema;
module.exports.CartItemModel = CartItemModel;
