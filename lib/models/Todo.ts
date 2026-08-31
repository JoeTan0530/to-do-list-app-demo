// lib/models/Todo.ts

import mongoose, { Schema } from "mongoose";
import { generateReturnObj, verifyIdFormat } from '../utilities/general.js';

// ============================================================
// Types
// ============================================================
interface ITask {
  task_name: string;
  task_description?: string;
  task_category: string;
  status: string;
  due_date?: Date;
  completed_date?: Date;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Static methods interface
interface ITodoModel extends mongoose.Model<ITask> {
  getTaskStatus(internalUse?: boolean): Promise<any>;
  getTaskCategory(internalUse?: boolean): Promise<any>;
  getDashboardData(): Promise<any>;
  getTaskItem(params: { taskID: string; editUse?: boolean }): Promise<any>;
  getTaskList(params: any): Promise<any>;
  getPagination(params: { listingCondition: any; page: number; limit: number }): Promise<any>;
  addTask(params: any): Promise<any>;
  editTask(params: any): Promise<any>;
  removeTask(params: any): Promise<any>;
  updateTaskStatus(params: any): Promise<any>;
  importTasks(params: any): Promise<any>;
  reorderingTask(params: any): Promise<any>;
}

// ============================================================
// Schema Definition
// ============================================================
const todoSchema = new Schema<ITask, ITodoModel>({
  task_name: {
    type: String,
    required: true,
  },
  task_description: {
    type: String,
  },
  task_category: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  due_date: {
    type: Date,
  },
  completed_date: {
    type: Date,
  },
  order: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// ============================================================
// Static Methods
// ============================================================

todoSchema.statics.getTaskStatus = async function (internalUse = false) {
  const statusArr = [
    { label: "Incomplete", value: "incomplete" },
    { label: "Completed", value: "complete" },
  ];

  if (internalUse) {
    const statusObj: Record<string, string> = {};
    statusArr.forEach((item) => {
      statusObj[item.value] = item.label;
    });
    return statusObj;
  }
  // ✅ Cast third argument to any
  return generateReturnObj("Success", 0, statusArr as any, "");
};

todoSchema.statics.getTaskCategory = async function (internalUse = false) {
  const categoryArr = [
    { label: "Work", value: "work" },
    { label: "Personal", value: "personal" },
    { label: "Urgent", value: "urgent" },
  ];

  if (internalUse) {
    const categoryObj: Record<string, string> = {};
    categoryArr.forEach((item) => {
      categoryObj[item.value] = item.label;
    });
    return categoryObj;
  }
  // ✅ Cast third argument to any
  return generateReturnObj("Success", 0, categoryArr as any, "");
};

todoSchema.statics.getDashboardData = async function () {
  const dashboardRes = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        incomplete: { $sum: { $cond: [{ $eq: ["$status", "incomplete"] }, 1, 0] } },
        complete: { $sum: { $cond: [{ $eq: ["$status", "complete"] }, 1, 0] } },
      },
    },
  ]);

  const stats = dashboardRes[0] || { total: 0, incomplete: 0, complete: 0 };
  return generateReturnObj("Success", 0, stats as any, "Successfully retrieved dashboard data.");
};

todoSchema.statics.getTaskItem = async function (props) {
  const { taskID, editUse = false } = props;

  const verifiedTaskID = verifyIdFormat(taskID);
  if (verifiedTaskID.status && verifiedTaskID.status === "error") {
    return verifiedTaskID;
  }

  const taskItemRes = await this.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(verifiedTaskID) } },
    {
      $project: {
        _id: 0,
        taskName: "$task_name",
        taskDescription: "$task_description",
        taskCategory: "$task_category",
        status: "$status",
        dueDate: "$due_date",
      },
    },
  ]);

  if (taskItemRes && taskItemRes.length > 0) {
    let tempItemRes = taskItemRes[0];

    // If NOT for edit, we want to display the labels instead of raw values
    if (!editUse) {
      const statusObj = await this.getTaskStatus(true);
      const categoryObj = await this.getTaskCategory(true);
      tempItemRes.status = statusObj[tempItemRes.status] || tempItemRes.status;
      tempItemRes.taskCategory = categoryObj[tempItemRes.taskCategory] || tempItemRes.taskCategory;
    }

    return generateReturnObj("Success", 0, tempItemRes as any, "");
  } else {
    return generateReturnObj("Error", 2, "", "Unable to retrieve task information.");
  }
};

todoSchema.statics.getTaskList = async function (params) {
  const { page = 1, limit = 10, filters = {} } = params;
  const skip = (page - 1) * limit;

  let matchCondition: any = {};
  let sortBy: any = {};

  if (filters) {
    const specialConditionsKey = ["sort", "order", "taskDescription", "limit"];

    Object.keys(filters).forEach((item) => {
      if (!specialConditionsKey.includes(item)) {
        matchCondition[item] = filters[item];
      }
    });

    if (filters.taskDescription) {
      matchCondition.task_description = new RegExp(filters.taskDescription, 'i');
    }

    let orderBy = -1;
    if (filters.order === "ascending") {
      orderBy = 1;
    }

    if (filters.sort && filters.sort !== "") {
      sortBy = { [filters.sort]: orderBy };
    } else {
      sortBy = { createdAt: orderBy };
    }
  }

  const queryPipeline: any[] = [
    { $match: matchCondition },
    { $sort: sortBy },
    { $skip: skip },
    {
      $project: {
        _id: 0,
        taskID: "$_id",
        taskName: "$task_name",
        taskDescription: "$task_description",
        taskCategory: "$task_category",
        status: 1,
        order: 1,
        dueDate: { $dateToString: { format: "%Y-%m-%d", date: "$due_date" } },
        completedDate: { $dateToString: { format: "%Y-%m-%d", date: "$completed_date" } },
        createdAt: { $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$createdAt" } },
      },
    },
  ];

  if (limit && limit > 0) {
    queryPipeline.push({ $limit: limit });
  }

  const taskListRes = await this.aggregate(queryPipeline);
  const taskPaginationRes = await this.getPagination({
    listingCondition: matchCondition,
    page,
    limit,
  });

  if (taskListRes && taskListRes.length > 0) {
    const taskListing: any[] = [];
    const statusObj: Record<string, string> = await this.getTaskStatus(true);
    const categoryObj: Record<string, string> = await this.getTaskCategory(true);

    taskListRes.forEach((item) => {
      taskListing.push({
        ...item,
        taskCategory: categoryObj[item.taskCategory] || item.taskCategory,
        statusDisplay: statusObj[item.status] || item.status,
        // keep original status for internal logic
        status: item.status,
      });
    });

    const listingObj = {
      listing: taskListing,
      pagination: taskPaginationRes,
    };

    // ✅ Cast third argument to any
    return generateReturnObj("Success", 0, listingObj as any, "");
  } else {
    return generateReturnObj("Success", 0, "", "No result found");
  }
};

todoSchema.statics.getPagination = async function (params) {
  const { listingCondition, page, limit } = params;

  const paginationRes = await this.aggregate([
    { $match: listingCondition },
    { $facet: { totalRecord: [{ $count: "count" }] } },
  ]);

  let paginationObj = {
    pageNumber: 1,
    numRecord: limit,
    totalRecord: 0,
    totalPage: 0,
  };

  if (paginationRes && paginationRes[0]?.totalRecord?.length > 0) {
    const totalRecordData = paginationRes[0].totalRecord[0].count;
    paginationObj = {
      pageNumber: page,
      numRecord: limit,
      totalRecord: totalRecordData,
      totalPage: Math.ceil(totalRecordData / limit),
    };
  }

  return paginationObj;
};

todoSchema.statics.addTask = async function (params) {
  const paramData = params;

  const requiredFieldArr: Record<string, string> = {
    taskName: "Please enter task name.",
    taskCategory: "Please select a category.",
    status: "Please select a status",
  };

  if (!paramData) {
    return generateReturnObj("Error", 1, "", "Invalid params.");
  }

  // Validate input
  const errorField: any[] = [];
  for (const fieldKey in requiredFieldArr) {
    const tempData = paramData[fieldKey];
    if (!tempData || tempData === "") {
      errorField.push({
        errorID: fieldKey,
        errorMsg: requiredFieldArr[fieldKey],
      });
    }
  }

  if (errorField.length > 0) {
    // ✅ Cast third argument to any
    return generateReturnObj("Error", 1, { field: errorField } as any, "Form error");
  }

  // Determine next order number for incomplete tasks
  let latestTaskOrderNum = 1;
  if (paramData.status === "complete") {
    latestTaskOrderNum = 0;
  } else {
    const tasksRes = await this.aggregate([
      { $match: { status: "incomplete" } },
      { $project: { order: 1 } },
      { $sort: { order: -1 } },
      { $limit: 1 },
    ]);
    if (tasksRes && tasksRes.length > 0) {
      latestTaskOrderNum = Number(tasksRes[0].order) + 1;
    }
  }

  const newTask = new this({
    task_name: paramData.taskName,
    task_description: paramData.taskDescription,
    task_category: paramData.taskCategory,
    status: paramData.status,
    due_date: paramData.dueDate,
    order: latestTaskOrderNum,
  });

  await newTask.save();

  return generateReturnObj("Success", 0, "", "Successfully added a task.");
};

todoSchema.statics.editTask = async function (params) {
  const paramData = params;

  const requiredFieldArr: Record<string, string> = {
    taskName: "Please enter task name.",
    taskCategory: "Please select a category.",
    status: "Please select a status",
  };

  const verifiedTaskID = verifyIdFormat(paramData.taskID);
  if (!paramData.taskID || paramData.taskID === "" || (verifiedTaskID.status && verifiedTaskID.status === "error")) {
    return generateReturnObj("Error", 2, "", "Invalid task ID.");
  }

  if (!paramData) {
    return generateReturnObj("Error", 1, "", "Invalid params.");
  }

  const errorField: any[] = [];
  for (const fieldKey in requiredFieldArr) {
    const tempData = paramData[fieldKey];
    if (!tempData || tempData === "") {
      errorField.push({
        errorID: fieldKey,
        errorMsg: requiredFieldArr[fieldKey],
      });
    }
  }

  if (errorField.length > 0) {
    // ✅ Cast third argument to any
    return generateReturnObj("Error", 3, errorField as any, "Form error");
  }

  const taskItem = await this.findById(verifiedTaskID);
  if (!taskItem) {
    return generateReturnObj("Error", 1, "", "Unable to update task record, please contact admin.");
  }

  taskItem.task_name = paramData.taskName;
  taskItem.task_description = paramData.taskDescription;
  taskItem.task_category = paramData.taskCategory;
  taskItem.status = paramData.status;
  taskItem.due_date = paramData.dueDate;
  taskItem.completed_date = paramData.completed_date;

  await taskItem.save();

  return generateReturnObj("Success", 0, "", "Successfully edited a task.");
};

todoSchema.statics.removeTask = async function (params) {
  const { taskID } = params;

  const verifiedTaskID = verifyIdFormat(taskID);
  if (!taskID || taskID === "" || (verifiedTaskID.status && verifiedTaskID.status === "error")) {
    return generateReturnObj("Error", 2, "", "Invalid task ID.");
  }

  const deletedItemRes = await this.findByIdAndDelete(verifiedTaskID);
  if (deletedItemRes) {
    return generateReturnObj("Success", 0, "", "Successfully removed task record.");
  } else {
    return generateReturnObj("Error", 2, "", "Unable to remove task record, please contact admin.");
  }
};

todoSchema.statics.updateTaskStatus = async function (params) {
  const { taskID, status } = params;

  const verifiedTaskID = verifyIdFormat(taskID);
  if (!taskID || taskID === "" || (verifiedTaskID.status && verifiedTaskID.status === "error")) {
    return generateReturnObj("Error", 2, "", "Invalid task ID.");
  }
  if (!status || status === "") {
    return generateReturnObj("Error", 2, "", "Invalid status.");
  }

  const taskItem = await this.findById(verifiedTaskID);
  if (!taskItem) {
    return generateReturnObj("Error", 2, "", "Unable to update task record, please contact admin.");
  }

  let latestTaskOrderNum = 0;
  if (status === "incomplete") {
    // Assign new highest order number
    const tasksRes = await this.aggregate([
      { $match: { status: "incomplete" } },
      { $project: { order: 1 } },
      { $sort: { order: -1 } },
      { $limit: 1 },
    ]);
    if (tasksRes && tasksRes.length > 0) {
      latestTaskOrderNum = Number(tasksRes[0].order) + 1;
    }
    // ✅ Set to undefined instead of null
    taskItem.completed_date = undefined;
  } else {
    // Mark complete, set order to 0
    latestTaskOrderNum = 0;
    taskItem.completed_date = new Date();
  }

  taskItem.status = status;
  taskItem.order = latestTaskOrderNum;
  await taskItem.save();

  return generateReturnObj("Success", 0, "", "Successfully updated task record.");
};

todoSchema.statics.importTasks = async function (props) {
  const { tasks } = props;

  if (!tasks || tasks.length === 0) {
    return generateReturnObj("Error", 2, "", "Unable to import task list.");
  }

  // Find current highest order among incomplete tasks
  let latestTaskOrderNum = 0;
  const tasksRes = await this.aggregate([
    { $match: { status: "incomplete" } },
    { $project: { order: 1 } },
    { $sort: { order: -1 } },
    { $limit: 1 },
  ]);
  if (tasksRes && tasksRes.length > 0) {
    latestTaskOrderNum = Number(tasksRes[0].order);
  }

  const importedTasks: any[] = [];
  tasks.forEach((task: any) => {
    importedTasks.push({
      ...task,
      order: task.status === "incomplete" ? ++latestTaskOrderNum : 0,
    });
  });

  const importTasksRes = await this.insertMany(importedTasks);
  if (importTasksRes) {
    return generateReturnObj("Success", 0, "", `Successfully imported ${importTasksRes.length} tasks.`);
  } else {
    return generateReturnObj("Error", 2, "", "Unable to import tasks, please contact admin.");
  }
};

todoSchema.statics.reorderingTask = async function (params) {
  const { page = 1, limit = 10, reorderedTaskList = [] } = params;

  if (!reorderedTaskList || reorderedTaskList.length === 0) {
    return generateReturnObj("Error", 1, "", "Invalid reorder list.");
  }

  // Fetch all incomplete tasks sorted by order ascending
  const allTasks = await this.find({ status: 'incomplete' })
    .sort({ order: 1 })
    .lean();

  // Map task IDs to their current index
  const taskIdToIndex: Record<string, number> = {};
  allTasks.forEach((task, idx) => {
    taskIdToIndex[task._id.toString()] = idx;
  });

  // Validate that all IDs exist
  const invalidIds = reorderedTaskList.filter((id: string) => !taskIdToIndex.hasOwnProperty(id));
  if (invalidIds.length > 0) {
    return generateReturnObj("Error", 2, "", `Invalid task IDs: ${invalidIds.join(', ')}`);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, allTasks.length);

  // Build new full order
  const newFullOrder = [
    ...allTasks.slice(0, startIndex).map((task) => task._id.toString()),
    ...reorderedTaskList,
    ...allTasks.slice(endIndex).map((task) => task._id.toString()),
  ];

  const bulkOps = newFullOrder.map((id: string, index: number) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(id) },
      update: { $set: { order: index + 1 } },
    },
  }));

  await this.bulkWrite(bulkOps);
  return generateReturnObj("Success", 0, "", "Successfully rearranged task records.");
};

// ============================================================
// Export Model
// ============================================================
export const Todo = (mongoose.models.Todo as ITodoModel) || mongoose.model<ITask, ITodoModel>('Todo', todoSchema);