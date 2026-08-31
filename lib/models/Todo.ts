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

todoSchema.statics.getDashboardData = async function () {
	const dashboardRes = await this.aggregate([
		{
			$group: {
				_id: null,
				total: { $sum: 1 },
				incomplete: {
					$sum: { $cond: [{ $eq: ["$status", "incomplete"] }, 1, 0] }
				},
				complete: {
					$sum: { $cond: [{ $eq: ["$status", "complete"] }, 1, 0] }
				}
			}
		}
	]);

	const stats = dashboardRes[0] || { total: 0, incomplete: 0, complete: 0 };
	return generateReturnObj("Success", 0, stats, "Successfully retrived dashboard data.");
}

todoSchema.statics.getTaskItem = async function (props) {
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

		if (!editUse) {
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

		if (filters['sort'] && filters['sort'] !== "") {
			sortBy = {
				[filters['sort']]: orderBy
			}
		} else {
			sortBy = {
				createdAt: orderBy
			}
		}
	}

	const queryPipeline = [
		{
			$match: matchCondition
		}, 
		{
			$sort: sortBy
		},
		{
			$skip: skip
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
				completedDate: {
					$dateToString: {
						format: "%Y-%m-%d",
						date: "$completed_date"
					}
				},
				createdAt: {
					$dateToString: {
						format: "%Y-%m-%d %H:%M:%S",
						date: "$createdAt"
					}
				}
			}
		}
	];

	if (limit && limit > 0) {
		queryPipeline.push({ $limit: limit });
	}

	const taskListRes = await this.aggregate(queryPipeline);

	const taskPaginationRes = await this.getPagination({listingCondition: matchCondition, page: page, limit: limit});

	if (taskListRes && taskListRes.length > 0) {
		let taskListing = [];
		const statusObj = await this.getTaskStatus(true);
		const categoryObj = await this.getTaskCategory(true);

		taskListRes.forEach((item, index) => {
			taskListing.push({
				...item,
				taskCategory: categoryObj[item.taskCategory],
				status: item.status,
				statusDisplay: statusObj[item.status],
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
			return generateReturnObj("Error", 3, {field: errorField}, "Form error");
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

	if (!status || status == "") {
		return generateReturnObj("Error", 2, "", "Invalid status.");
	}

	const taskItem = await this.findById(verifiedTaskID);

	if (taskItem) {
		let latestTaskOrderNum = 0;

		if (status == "incomplete") {
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

			if (tasksRes && tasksRes.length > 0) {
				latestTaskOrderNum = Number(tasksRes[0]['order']) + 1;
			}

			taskItem.completed_date = null;
		} else {
			taskItem.completed_date = new Date();
		}

		taskItem.status = status;
		taskItem.order = latestTaskOrderNum;

		await taskItem.save();

		return generateReturnObj("Success", 0, "","Successfully updated task record.");
	} else {
		return generateReturnObj("Error", 2, "", "Unable to update task record, please contact admin.");
	}
}

todoSchema.statics.importTasks = async function (props) {
	const {
		tasks
	} = props;

	if (tasks && tasks.length == 0) {
		return generateReturnObj("Error", 2, "", "Unable to import task list.");
	}

	let latestTaskOrderNum = 0;

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

	if (tasksRes && tasksRes.length > 0) {
		latestTaskOrderNum = Number(tasksRes[0]['order']);
	} 

	let importedTasks = [];

	tasks.forEach((task, index) => {
		importedTasks.push({
			...task,
			order: (task['status'] === "incomplete" ? ++latestTaskOrderNum : 0)
		});
	});

	const importTasksRes = await this.insertMany(importedTasks);

	if (importTasksRes) {
		return generateReturnObj("Success", 0, "", `Successfully imported ${importTasksRes.length} tasks.`);
	} else {
		return generateReturnObj("Error", 2, "", "Unable to import tasks, please contact admin.");
	}

}

todoSchema.statics.reorderingTask = async function (params) {
  const {
    page = 1,
    limit = 10,
    reorderedTaskList = [] // array of task IDs in new order for this page
  } = params;

  if (!reorderedTaskList || reorderedTaskList.length === 0) {
    return generateReturnObj("Error", 1, "", "Invalid reorder list.");
  }

  // 1. Fetch all incomplete tasks sorted by order ascending
  const allTasks = await this.find({ status: 'incomplete' })
    .sort({ order: 1 })
    .lean();

  // 2. Build a map of task ID to its current position in the full list
  const taskIdToIndex = {};
  allTasks.forEach((task, idx) => {
    taskIdToIndex[task._id.toString()] = idx;
  });

  // 3. Validate that all IDs in reorderedTaskList exist and are incomplete
  const invalidIds = reorderedTaskList.filter(id => !taskIdToIndex.hasOwnProperty(id));
  if (invalidIds.length > 0) {
    return generateReturnObj("Error", 2, "", `Invalid task IDs: ${invalidIds.join(', ')}`);
  }

  // 4. Calculate the start index of the current page
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, allTasks.length);

  // 5. Extract the current page's task IDs (the segment we are replacing)
  const currentPageIds = allTasks.slice(startIndex, endIndex).map(task => task._id.toString());

  // 6. Build the new full order: replace the page segment with reorderedTaskList
  const newFullOrder = [
    ...allTasks.slice(0, startIndex).map(task => task._id.toString()),
    ...reorderedTaskList,
    ...allTasks.slice(endIndex).map(task => task._id.toString())
  ];

  // 7. Assign new order numbers (1..N) based on the new full order
  const bulkOps = newFullOrder.map((id, index) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(id) },
      update: { $set: { order: index + 1 } }
    }
  }));

  // 8. Execute bulk write
  const result = await this.bulkWrite(bulkOps);

  return generateReturnObj("Success", 0, "", "Successfully rearranged task records.");
};

export const Todo = mongoose.models.Todo || mongoose.model('Todo', todoSchema);