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

class CartDAO {
	constructor(Cart) {
		this.Cart = Cart;
	}

	getCart(userId) {
		return this.Cart.findOne({ userId }).select({ userId: 1, items: 1 }).exec();
	}

	addItemToCart(userId, itemId) {
		return this.Cart
			.findOne({ userId, 'items._id': itemId }, { _id: 0, 'items.$': 1 })
			.exec()
			.then(itemArray => Promise.resolve(itemArray === null ? itemArray : itemArray.items[0]));
	}

	addItem(userId, item) {
		return this.Cart.findOneAndUpdate(
			{ userId },
			{ $push: { items: item } },
			{ upsert: true,
				returnOriginal: false }
		).exec();
	}

	updateQuantity(userId, itemId, quantity) {
		const query = { userId };
		const updateQuery = {};
		const options = { returnOriginal: false };

		if (quantity === 0) {
			updateQuery.$pull = { items: { _id: itemId } };
			options.upsert = false;
		} else {
			query.items = {
				$elemMatch: {
					_id: itemId
				}
			};
			updateQuery.$set = { 'items.$.quantity': quantity };
			options.upsert = true;
		}

		return this.Cart.findOneAndUpdate(query, updateQuery, options).exec();
	}
}

module.exports.CartDAO = CartDAO;
