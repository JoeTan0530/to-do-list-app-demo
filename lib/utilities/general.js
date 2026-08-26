const mongoose = require('mongoose');

const generateReturnObj = (type, returnCode, dataReturn = "", statusMsg = "") => {
	let tempObj = {
		status: "",
		code: 0,
		data: "",
		statusMsg: ""
	}

	if (type == "Success") {
		tempObj = {
			status: "ok",
			code: returnCode,
			data: dataReturn,
			statusMsg: statusMsg
		}
	} else if (type == "Error") {
		tempObj = {
			status: "error",
			code:  returnCode ? returnCode : 1,
			data: dataReturn,
			statusMsg: statusMsg
		}
	}

	return tempObj;
}

const verifyIdFormat = (checkingID, customErrorMsg = "Invalid ID format") => {
	if (!mongoose.Types.ObjectId.isValid(checkingID)) {
        return generateReturnObj("Error", 1, "", customErrorMsg);
    } else {
    	return checkingID;
    }
}

const mapCountObj = (countArray = {}, countKey = "count") => {
	let tempCountObj = {};

	if (countArray) {
		const countObj = Array.isArray(countArray) ? countArray[0] : countArray;
		for (let countObjKey in countObj) {
	        tempCountObj[countObjKey] = countObj[countObjKey].length > 0 ? (countObj[countObjKey][0][countKey] ? countObj[countObjKey][0][countKey] : countObj[countObjKey][0]['count']) : 0;
	    }
	}

    return tempCountObj;
}

const convertFirstCharToUpper = (itemString = "") => {
	let tempNewItemString = "";

	if (itemString && typeof itemString == "string" && itemString != "") {
		tempNewItemString = itemString.charAt(0).toUpperCase() + itemString.slice(1);
	}

	return tempNewItemString;
}

const convertMillisecToSec = (timestamp) => {
	return Math.floor(timestamp / 1000);
}

const formatThousandSeparator = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
}

// Export all functions
module.exports = {
    generateReturnObj,
    verifyIdFormat,
    mapCountObj,
    convertFirstCharToUpper,
    convertMillisecToSec,
    formatThousandSeparator
};