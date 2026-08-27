import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Todo } from '@/lib/models/Todo';

import { generateReturnObj } from '@/lib/utilities/general';

export async function POST(request: Request) {
	try {
		// 1. Parse the request body correctly
        const body = await request.json();
        
        // 2. Extract command and params
        const { command, params } = body;
        
        // 3. Connect to database
        await connectToDatabase();

        // 4. Execute the command
        let response;

		switch (command) {
			case "getTaskStatus":
				response = await Todo.getTaskStatus();
				break;
			case "getTaskCategory":
				response = await Todo.getTaskCategory();
				break;
			case "getTaskList":
				response = await Todo.getTaskList(params);
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
			case "reorderingTask":
				response = await Todo.reorderingTask(params);
				break;
			default:
				response = generateReturnObj("Error", 1, "", "Invalid command.");
		}

		// 5. Return response using NextResponse
        return NextResponse.json(response, { status: 200 });
	} catch (error) {
		let errorResponse = generateReturnObj("Error", 2, "", error.message);
        return NextResponse.json(errorResponse, { status: 400 });
	}
}