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

const assert = require('assert');

class CartDAO {
	constructor(database) {
		this.db = database;
	}

	getCart(userId, callback) {
		const collection = this.db.collection('cart');
		collection.find({ userId }).toArray((err, result) => {
			const userResult = result.shift();
			const userCart = {
				userId,
				items: userResult.items || []
			};
			callback(userCart);
		});
	}

	itemInCart(userId, itemId, callback) {
		const collection = this.db.collection('cart');
		collection.find({
			userId,
			items: { $elemMatch: { _id: itemId } }
		}, { 'items.$': 1 }).toArray((err, result) => {
			if (typeof result !== 'undefined' && result.length > 0 &&
				typeof result.items !== 'undefined' && result.items.length > 0) {
				const userResult = result.shift();
				const itemInCart = userResult.items.shift();
				callback(itemInCart);
			} else {
				callback(null);
			}
		});
	}

	addItem(userId, item, callback) {
		this.db.collection('cart').findOneAndUpdate(
			{ userId },
			{ $push: { items: item } },
			{
				upsert: true,
				returnOriginal: false
			},
			(err, result) => {
				assert.equal(null, err);
				callback(result.value);
			});
	}

	updateQuantity(userId, itemId, quantity, callback) {
		if (quantity === 0) {
			this.db.collection('cart').findOneAndUpdate({
				userId,
				items: {
					$elemMatch: {
						_id: itemId
					}
				}
			}, {
				$unset: { 'items.$': 0 }
			}, {
				upsert: true,
				returnOriginal: false
			},
			(err, result) => {
				this.db.collection('cart').findOneAndUpdate(
					{ userId },
					{ $pull: { items: null } },
					{ multi: true },
					() => {
						const resultValue = result.value;
						const userCart = {
							userId,
							items: resultValue.items.filter((item) => item !== null) || []
						};
						callback(userCart);
					}
				);
			});
		} else {
			this.db.collection('cart').findOneAndUpdate({
				userId,
				items: {
					$elemMatch: {
						_id: itemId
					}
				}
			}, {
				$set: {
					'items.$.quantity': quantity
				}
			}, {
				upsert: true,
				returnOriginal: false
			}, (err, result) => {
				const value = result.value;
				const userCart = {
					userId,
					items: value.items || []
				};
				callback(userCart);
			});
		}
	}
}

module.exports.CartDAO = CartDAO;
