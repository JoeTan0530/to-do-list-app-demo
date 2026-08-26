import mongoose from "mongoose";
import { generateReturnObj, verifyIdFormat } from './utilities/general.js';

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
	}
}, {
	timestamps: true
});

todoSchema.statics.getTaskStatus = async function() {
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

	return generateReturnObj("Success", 0, statusArr, "");
}

todoSchema.statics.getTaskCategory = async function() {
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

	return generateReturnObj("Success", 0, categoryArr, "");
}

todoSchema.statics.getTaskList = async function(params) {
	const {
		page = 1,
		limit = 10,
	} = params;

	const skip = (page - 1) * limit;

	let matchCondition = {};

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
				taskCategory: "$taskCategory",
				status: 1,
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
			$sort: {
				createdAt: -1
			}
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
		let listingObj = {
			listing: taskListRes,
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

	const paginationRes = await this.aggregatte([
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
			return generateReturnObj("Error", 3, errorField, "Form error");
		}

		const newTask = new this({
			task_name: paramData['taskName'],
			task_description: paramData['taskDescription'],
			task_category: paramData['taskCategory'],
			status: paramData['status'],
			due_date: paramData['dueDate']
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

			await expenseItem.save();

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

	if (!paramData['taskID'] || paramData['taskID'] == "" || (verifiedTaskID['status'] && verifiedTaskID['status'] == "error")) {
		return generateReturnObj("Error", 2, "", "Invalid task ID.");
	}

	const deletedItemRes = await this.findByIdAndDelete(verifiedTaskID);

	if (deletedItemRes) {
		return generateReturnObj("Success", 0, "", "Successfully removed task record.");
	} else {
		return generateReturnObj("Error", 2, "", "Unable to remove task record, please contact admin");
	}
}

module.exports = mongoose.model('Expenses', expenseSchema);