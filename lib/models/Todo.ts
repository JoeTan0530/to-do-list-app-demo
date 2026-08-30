import mongoose from "mongoose";
import { generateReturnObj, verifyIdFormat } from '../utilities/general.js';

const todoSchema = new mongoose.Schema({
	task_name: {
		type: String,
		required: true
	},
	task_description: {
		type: String,
	},
	task_category: {
		type: String,
		required: true
	},
	status: {
		type: String,
		required: true
	},
	due_date: {
		type: Date
	},
	completed_date: {
		type: Date
	},
	order: { type: Number, default: 0 }
}, {
	timestamps: true
});

todoSchema.statics.getTaskStatus = async function(internalUse = false) {

	const statusArr = [
		{
			label: "Incomplete",
			value: "incomplete"
		},
		{
			label: "Completed",
			value: "complete"
		}
	];

	if (internalUse) {
		let statusObj = {};

		statusArr.forEach((item, index) => {
			statusObj[item['value']] = item['label'];
		});

		return statusObj;

	} else {
		return generateReturnObj("Success", 0, statusArr, "");
	}
}

todoSchema.statics.getTaskCategory = async function(internalUse = false) {

	const categoryArr = [
		{
			label: "Work",
			value: "work"
		},
		{
			label: "Personal",
			value: "personal"
		},
		{
			label: "Urgent",
			value: "urgent"
		}
	];

	if (internalUse) {
		let categoryObj = {};

		categoryArr.forEach((item, index) => {
			categoryObj[item['value']] = item['label'];
		});

		return categoryObj;
	} else {
		return generateReturnObj("Success", 0, categoryArr, "");
	}
}

todoSchema.statics.getTaskItem = async function (params) {
	const {
		taskID,
		editUse = false
	} = props;

	const verifiedTaskID = verifyIdFormat(taskID);

	if (verifiedTaskID['status'] && verifiedTaskID['status'] == "error") {
		return verifiedTaskID;
	}

	const taskItemRes = await this.aggregate([
		{
			$match: {
				_id: new mongoose.Types.ObjectId(verifiedTaskID),
			}
		},
		{
			$project: {
				_id: 0,
				taskName: "$task_name",
				taskDescription: "$task_description",
				taskCategory: "$task_category",
				status: "$status",
				dueDate: "$due_date",
			}
		}
	]);

	if (taskItemRes && taskItemRes.length > 0) {
		let tempItemRes = taskItemRes[0];

		if (editUse) {
			const statusObj = await this.getTaskStatus(true);
			const categoryObj = await this.getTaskCategory(true);

			tempItemRes['status'] = statusObj[tempItemRes['status']];
			tempItemRes['taskCategory'] = categoryObj[tempItemRes['taskCategory']];
		}

		return generateReturnObj("Success", 0, tempItemRes, "");
	} else {
		return generateReturnObj("Error", 2, "", "Unable to retrieve task information.");
	}
}

todoSchema.statics.getTaskList = async function(params) {
	const {
		page = 1,
		limit = 10,
		filters = {}
	} = params;

	const skip = (page - 1) * limit;

	let matchCondition = {};
	let sortBy = {};

	if (filters) {
		const specialConditionsKey = [
			"sort",
			"order",
			"taskDescription",
			"limit"
		];

		Object.keys(filters).forEach((item, index) => {
			if (!specialConditionsKey.includes(item)) {
				matchCondition[item] = filters[item];
			}
		});

		if (filters['taskDescription']) {
			matchCondition['task_description'] = new RegExp(filters['taskDescription'], 'i');
		}

		let orderBy = -1;

		if (filters['order'] == "ascending") {
			orderBy = 1
		}

		if (filters['sort'] == "sort") {
			sortBy = {
				[filters['sort']]: orderBy
			}
		} else {
			sortBy = {
				createdAt: orderBy
			}
		}
	}

	const taskListRes = await this.aggregate([
		{
			$match: matchCondition
		}, 
		{
			$project: {
				_id: 0,
				taskID: "$_id",
				taskName: "$task_name",
				taskDescription: "$task_description",
				taskCategory: "$task_category",
				status: 1,
				order: 1,
				dueDate: {
					$dateToString: {
						format: "%Y-%m-%d",
						date: "$due_date"
					}
				},
				createdAt: {
					$dateToString: {
						format: "%Y-%m-%d %H:%M:%S",
						date: "$createdAt"
					}
				}
			}
		},
		{
			$sort: sortBy
		},
		{
			$skip: skip
		},
		{
			$limit: limit
		}
	]);

	const taskPaginationRes = await this.getPagination({listingCondition: matchCondition, page: page, limit: limit});

	if (taskListRes && taskListRes.length > 0) {
		let taskListing = [];
		const statusObj = await this.getTaskStatus(true);
		const categoryObj = await this.getTaskCategory(true);

		taskListRes.forEach((item, index) => {
			taskListing.push({
				...item,
				taskCategory: categoryObj[item.taskCategory],
				status: statusObj[item.status]
			});
		});

		let listingObj = {
			listing: taskListing,
			pagination: taskPaginationRes
		}

		return generateReturnObj("Success", 0, listingObj)
	} else {
		return generateReturnObj("Success", 0, "", "No result found");
	}
}

todoSchema.statics.getPagination = async function(params) {
	const {
		listingCondition,
		page,
		limit
	} = params;

	const paginationRes = await this.aggregate([
		{
			$match: listingCondition
		},
		{
			$facet: {
				totalRecord: [
					{
						$count: "count"
					}
				]
			}
		}
	]);

	// Default pagination info.
	let paginationObj = {
		pageNumber: 1,
		numRecord: limit,
		totalRecord: 0,
		totalPage: 0
	}

	if (paginationRes && paginationRes[0]['totalRecord'] && paginationRes[0]['totalRecord'].length > 0) {
		const totalRecordData = paginationRes[0]['totalRecord'][0]['count'];

		paginationObj = {
			pageNumber: page,
			numRecord: limit,
			totalRecord: totalRecordData,
			totalPage: Math.ceil(totalRecordData / limit)
		}
	}

	return paginationObj;
}

todoSchema.statics.addTask = async function(params) {
	const paramData = params;

	const requiredFieldArr = {
		taskName: "Please enter task name.",
		taskCategory: "Please select a cateogry.",
		status: "Please select a status"
	}

	if (paramData) {
		// Validate input params
		let errorField = [];
		for (let fieldKey in requiredFieldArr) {
			let tempData = paramData[fieldKey];

			if (!tempData || tempData == "") {
				errorField.push({
					errorID: fieldKey,
					errorMsg: requiredFieldArr[fieldKey]
				});
			}
		}

		if (errorField && errorField.length > 0) {
			return generateReturnObj("Error", 1, {field: errorField}, "Form error");
		}

		const tasksRes = await this.aggregate([
			{
				$match: {
					status: "incomplete"
				}
			},
			{
				$project: {
					order: 1
				}
			},
			{
				$sort: {
					order: -1
				}
			},
			{
				$limit: 1
			}
		]);

		let latestTaskOrderNum = 1;

		if (tasksRes && tasksRes.length > 0) {
			latestTaskOrderNum = Number(tasksRes[0]['order']) + 1;
		} else if (paramData['status'] === "complete") {
			latestTaskOrderNum = 0;
		}


		const newTask = new this({
			task_name: paramData['taskName'],
			task_description: paramData['taskDescription'],
			task_category: paramData['taskCategory'],
			status: paramData['status'],
			due_date: paramData['dueDate'],
			order: latestTaskOrderNum
		});

		await newTask.save();

		return generateReturnObj("Success", 0, "", "Successfully added a task.");
	} else {
		return generateReturnObj("Error", 1, "", "Invalid params.");
	}
}

todoSchema.statics.editTask = async function(params) {
	const paramData = params;

	const requiredFieldArr = {
		taskName: "Please enter task name.",
		taskCategory: "Please select a cateogry.",
		status: "Please select a status"
	}

	const verifiedTaskID = verifyIdFormat(paramData['taskID']);

	if (!paramData['taskID'] || paramData['taskID'] == "" || (verifiedTaskID['status'] && verifiedTaskID['status'] == "error")) {
		return generateReturnObj("Error", 2, "", "Invalid task ID.");
	}

	if (paramData) {
		// Validate input params
		let errorField = [];
		for (let fieldKey in requiredFieldArr) {
			let tempData = paramData[fieldKey];

			if (!tempData || tempData == "") {
				errorField.push({
					errorID: fieldKey,
					errorMsg: requiredFieldArr[fieldKey]
				});
			}
		}

		if (errorField && errorField.length > 0) {
			return generateReturnObj("Error", 3, errorField, "Form error");
		}

		const taskItem = await this.findById(verifiedTaskID);

		if (taskItem) {
			taskItem.task_name = paramData['taskName'];
			taskItem.task_description = paramData['taskDescription'];
			taskItem.task_category = paramData['taskCategory'];
			taskItem.status = paramData['status'];
			taskItem.due_date = paramData['dueDate'];
			taskItem.completed_date = paramData['completed_date'];

			await taskItem.save();

			return generateReturnObj("Success", 0, "", "Successfully edited a task.");
		}
	} 

	return generateReturnObj("Error", 1, "", "Unable to update task record, please contact admin.");
}

todoSchema.statics.removeTask = async function(params) {
	const {
		taskID
	} = params;

	const verifiedTaskID = verifyIdFormat(taskID);

	if (!taskID || taskID == "" || (verifiedTaskID['status'] && verifiedTaskID['status'] == "error")) {
		return generateReturnObj("Error", 2, "", "Invalid task ID.");
	}

	const deletedItemRes = await this.findByIdAndDelete(verifiedTaskID);

	if (deletedItemRes) {
		return generateReturnObj("Success", 0, "", "Successfully removed task record.");
	} else {
		return generateReturnObj("Error", 2, "", "Unable to remove task record, please contact admin.");
	}
}

todoSchema.statics.updateTaskStatus = async function (params) {
	const {
		taskID,
		status
	} = params;

	const verifiedTaskID = verifyIdFormat(taskID);

	if (!taskID || taskID == "" || (verifiedTaskID['status'] && verifiedTaskID['status'] == "error")) {
		return generateReturnObj("Error", 2, "", "Invalid task ID.");
	}

	if (!status || status != "") {
		return generateReturnObj("Error", 2, "", "Invalid status.");
	}

	const taskItem = await this.findById(verifiedTaskID);

	if (taskItem) {
		taskItem.status = status;
		taskItem.order = 0;

		await taskItem.save();

		return generateReturnObj("Success", 0, "","Successfully updated task record.");
	} else {
		return generateReturnObj("Error", 2, "", "Unable to update task record, please contact admin.");
	}
}

todoSchema.statics.reorderingTask = async function (params) {
	const {
		reorderedTaskList
	} = params;

	const operations = reorderedTaskList.map((item) => ({
		updateOne: {
			filter: { _id: new mongoose.Types.ObjectId(item.taskID) },
			update: { $set: { order: item.order } }
		}
	}));

	const result = await this.bulkWrite(operations);

	return generateReturnObj("Success", 0, "", "Successfully rearranged task record.");
}

export const Todo = mongoose.models.Todo || mongoose.model('Todo', todoSchema);