const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const User = require('../models/User');
const { generateReturnObj, decodeToken } = require('../models/utilities/general');
import { NextResponse } from 'next/server';
import { db } from '@/lib/mongodb';

router.post('/', async(req, res) => {
	try {
		let request = req.body;

		let response = {};

		let command = request.command;

		let params = request.params;

		switch (command) {
			case "getExpenseItem":
				response = await Expense.getExpenseItem(params);
				break;
			case "getDateRangeExpense":
				response = await Expense.getDateRangeExpense(params);
				break;
			case "getExpenseList":
				response = await Expense.getExpenseList(params);
				break;
			case "addExpense":
				response = await Expense.addExpense(params);
				break;
			case "editExpense":
				response = await Expense.editExpense(params);
				break;
			case "removeExpense":
				response = await Expense.removeExpense(params);
				break;
			default:
				response = generateReturnObj("Error", 1, "", "Invalid command.");
		}

		res.status(200).json(response);
	} catch (error) {
		let errorResponse = generateReturnObj("Error", 2, "", error.message);
		res.status(400).json(errorResponse);
	}
});

module.exports = router;