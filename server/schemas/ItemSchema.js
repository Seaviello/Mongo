/**
 * Created by Seav on 19.05.2016.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const categories = 'Umbrellas Stickers Kitchen Apparel Swag Office Books Electronics'.split(' ');

const ItemSchema = new Schema({
	title: String,
	slogan: String,
	description: String,
	stars: Number,
	category: { type: String, enum: categories },
	img_url: String,
	price: Number
});

module.exports.ItemSchema = ItemSchema;
