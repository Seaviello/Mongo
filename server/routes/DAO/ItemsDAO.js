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
const Promise = require('bluebird');

class ItemDAO {
	constructor(Item) {
		this.Item = Item;
	}

	getCategories() {
		return this.Item.aggregate([
			{
				$group: {
					_id: '$category',
					num: { $sum: 1 }
				}
			}, {
				$sort: { _id: 1 }
			}]).exec();
	}

	getItems(category, page, itemsPerPage) {
		const queryObj = category === 'All' ? {} : { category };
		return this.Item
			.find(queryObj)
			.sort({ category: 1, title: 1 })
			.skip(page * itemsPerPage)
			.limit(itemsPerPage)
			.exec();
	}

	getNumItems(category) {
		const queryObj = category === 'All' ? {} : { category };
		return this.Item.find(queryObj).count().exec();
	}

	searchItems(query, page, itemsPerPage) {
		return this.Item
			.find({ $text: { $search: query } })
			.sort({ _id: 1 })
			.skip(page * itemsPerPage)
			.limit(itemsPerPage)
			.exec();
	}

	getNumSearchItems(query) {
		return this.Item
			.find({ $text: { $search: query } })
			.count()
			.exec();
	}

	getItem(itemId) {
		return this.Item
			.findOne({ _id: itemId })
			.exec();
	}

	getRelatedItems() {
		return this.Item
			.find({})
			.limit(4)
			.exec();
	}

	addReview(itemId, review) {
		return this.Item.findByIdAndUpdate(
			itemId,
			{ $push: { reviews: review } }
		).exec()
			.then(() => this.Item.aggregate([
				{ $match: { _id: itemId } },
				{ $unwind: '$reviews' },
				{
					$group: {
						_id: '$_id',
						avgStar: { $avg: '$reviews.stars' }
					}
				}
			]).exec())
			.then((resultArray) => {
				const result = resultArray[0];
				return this.Item.findByIdAndUpdate(
					result._id,
					{ $set: { stars: result.avgStar } }
				).exec();
			});
	}

	/* addReview(itemId, comment, name, stars, callback) {
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
	}*/
}

module.exports.ItemDAO = ItemDAO;
