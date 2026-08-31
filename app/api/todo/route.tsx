import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Todo } from '@/lib/models/Todo';
import { generateReturnObj } from '@/lib/utilities/general';

export async function POST(request: Request) {
  try {
    // 1. Parse the request body
    const body = await request.json();
    const { command, params } = body;

    // 2. Connect to database
    await connectToDatabase();

    // 3. Execute the command
    let response;

    switch (command) {
      case "getTaskStatus":
        response = await Todo.getTaskStatus();
        break;
      case "getTaskCategory":
        response = await Todo.getTaskCategory();
        break;
      case "getDashboardData":
        response = await Todo.getDashboardData();
        break;
      case "getTaskList":
        response = await Todo.getTaskList(params);
        break;
      case "getTaskItem":
        response = await Todo.getTaskItem(params);
        break;
      case "addTask":
        response = await Todo.addTask(params);
        break;
      case "editTask":
        response = await Todo.editTask(params);
        break;
      case "removeTask":
        response = await Todo.removeTask(params);
        break;
      case "updateTaskStatus":
        response = await Todo.updateTaskStatus(params);
        break;
      case "importTasks":
        response = await Todo.importTasks(params);
        break;
      case "reorderingTask":
        response = await Todo.reorderingTask(params);
        break;
      default:
        response = generateReturnObj("Error", 1, "", "Invalid command.");
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Safely extract error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorResponse = generateReturnObj("Error", 2, "", errorMessage);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}