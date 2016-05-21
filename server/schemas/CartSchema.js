/**
 * Created by Seav on 21.05.2016.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ItemSchema = require('./CartSchema').ItemSchema;

const CartSchema = new Schema({
	userId: String,
	items: [ItemSchema]
});

module.exports.CartSchema = CartSchema;
