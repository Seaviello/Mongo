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

class ItemDAO {
	constructor(database) {
		this.collection = database.collection('item');
	}

	getCategories(callback) {
		let categories = [];
		this.collection.aggregate([
			{
				$group: {
					_id: '$category',
					num: { $sum: 1 }
				}
			},
			{ $sort: { _id: 1 } }
		]).toArray((error, result) => {
			categories = result;
			const category = {
				_id: 'All',
				num: 0
			};
			result.forEach(item => {category.num += item.num;});
			categories.unshift(category);
			callback(categories);
		});
	}

	getItems(category, page, itemsPerPage, callback) {
		let projection = this.collection;
		if (category === 'All') {
			projection = projection.find({});
		} else {
			projection = projection.find({ category });
		}

		projection.sort({ category: 1 })
			.skip(page * itemsPerPage)
			.limit(itemsPerPage)
			.toArray((error, result) => {
				callback(result);
			}
		);
	}

	getNumItems(category, callback) {
		let projection = this.collection;
		if (category === 'All') {
			projection = projection.find({});
		} else {
			projection = projection.find({ category });
		}
		projection.count((error, result) => {
			callback(result);
		});
	}

	searchItems(query, page, itemsPerPage, callback) {
		this.collection
			.find({ $text: { $search: query } })
			.sort({ _id: 1 })
			.skip(page * itemsPerPage)
			.limit(itemsPerPage)
			.toArray((error, items) => callback(items));
	}

	getNumSearchItems(query, callback) {
		this.collection
			.find({ $text: { $search: query } })
			.count((error, result) => callback(result));
	}

	getItem(itemId, callback) {
		this.collection
			.find({ _id: itemId })
			.forEach(doc => callback(doc));
	}

	getRelatedItems(callback) {
		this.collection
			.find({})
			.limit(4)
			.toArray((err, relatedItems) => callback(relatedItems));
	}

	addReview(itemId, comment, name, stars, callback) {
		const reviewDoc = {
			name,
			comment,
			stars,
			date: Date.now()
		};

		this.collection.updateOne(
				{ _id: itemId },
				{ $push: { reviews: reviewDoc } },
				(err, results) => callback(results)
			);
	}
}

module.exports.ItemDAO = ItemDAO;
