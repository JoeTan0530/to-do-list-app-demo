import axios from "axios";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Import specific icons
import { faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';

const getAuthHeaders = () => {
	const headers = {
		"Content-Type": "application/json",
	};

	const sessionToken = localStorage.getItem('sessionToken');
	if (sessionToken) {
		headers["Authorization"] = `Bearer ${sessionToken}`;
	}

	return headers;
};

export const apiCaller = async (method, param, fCallback, setErrMsg, setIsLoading=null) => {

	if (method === "POST") {
		const customUrl = param['url'] ? param['url'] : process.env.REACT_APP_QUERY_URL;

		let params = param['urlParams'] ? param['urlParams'] : {};

		if (!params['params']) {
			params['params'] = {};
		}

		try {
			
			let res = await axios.post(customUrl, params, {
				headers: getAuthHeaders(),
			});

			callApiSuccess(res, fCallback, setErrMsg, param);

			if(setIsLoading) {
				setIsLoading(false)
			}
		} catch (err) {
			if (!navigator.onLine) {
				alert("Network Issue");
			} else {
				alert(err);
			}
			if(setIsLoading) {
				setIsLoading(false)
			}
		}
	} else if (method === "GET") {
		let getURL = param['url'] ? param['url'] : "";

		let apiURL = getURL;

		if (param['urlParams']) {
			if (Array.isArray(param['urlParams'])) {
				let getParams = param['urlParams'];

				apiURL += "?";
				getParams.forEach((value, key) => {
					apiURL += (key != 0 ? "&" : "") + value;
				});
			}
		}

		try {
			let res = await axios.get(apiURL, {
				headers: getAuthHeaders(),
			});

			if (fCallback) {
				fCallback(res, "Success Get Data");
			}

		} catch (err) {
			if (!navigator.onLine) {
				alert("Network Issue");
			} else {
				alert(err);
				if (fCallback) {
					fCallback(err, "Error Get Data");
				}
			}

			if(setIsLoading) {
				setIsLoading(false)
			}
		}
	}
}

function callApiSuccess(res, fCallback, setErrMsg, param) {
	let result = res["data"];

	if (result && result.status === "ok") {
		if (result['data'] && result['data']['sessionToken']) {
			localStorage.setItem('sessionToken', result['data']['sessionToken']);
		}

		if (result['data'] && result['data']['isLoginData'] && result['data']['isLoginData'] === 1) {
			if (result['data']['userInfo']) {
				sessionStorage.setItem('fullName', result['data']['userInfo']['name']);
				sessionStorage.setItem('email', result['data']['userInfo']['email']);
			}
		}

		fCallback(result.data, result.statusMsg);
	} else if (result.status === "error" && result.data && result.data.field && result.data.field !== "") {
		result.data.field.forEach((element) => {
			setErrMsg((prevData) => ({
				...prevData,
				[element.id]: element.msg,
			}));
		});
	} else if (result.status === "error") {
		errorHandling(result.code, result.statusMsg);
	} else {
		console.log("Something went wrong");
	}
}

function errorHandling(code, msg) {
	switch (code) {
		case 1:
			console.log(msg, 'warning');
			break;
		case 2:
			console.log(msg, 'error');
			break;
		case 3:
			console.log(msg, 'error');
			logoutUser();
			break;
		default:
			console.log('Default Error');
	}
}

export const logoutUser = () => {
	localStorage.removeItem("sessionToken");
	localStorage.removeItem("fullName");
	localStorage.removeItem("email");

	setTimeout(() => {
		window.location.href = '/';
	}, 1500);
}

export const generateRandomColorCode = () => {
	return `${"#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

export const restrictNumberOnly = (inputEvent, sort = "normal", inputDecimal) => {
	let inputVal = inputEvent.target.value;
	const maxDecimal = parseInt(inputDecimal ? inputDecimal : process.env.REACT_APP_DEFAULT_DP, 10);
	let regexPattern = /[^0-9.]/g;

	if (sort === "numberOnly") {
		regexPattern = /[^0-9]/g;
	}

	inputVal = inputVal.replace(regexPattern, "");
	let decimalIndex = inputVal.indexOf(".");

	if (decimalIndex > -1) {
		let tempSlice = inputVal.slice(decimalIndex + 1);
		tempSlice = tempSlice.replace(/[^0-9]/g, "");
		if (tempSlice.length > maxDecimal) {
			tempSlice = tempSlice.slice(0, maxDecimal);
		}
		inputVal = inputVal.slice(0, decimalIndex + 1) + tempSlice;
	}

	inputEvent.target.value = inputVal;
};

export const handlePasswordReveal = (passwordElement, eventNode) => {
	let newPasswordType = "text";
	let passwordRef = passwordElement;

	if (passwordRef) {
		if (passwordRef.current.type === newPasswordType) {
			newPasswordType = "password";
		}

		passwordRef.current.type = newPasswordType;
	}
};

export const formatDateDDMMYYYY = (inputDate) => {
	if (!inputDate) return "";

	const dateObj = inputDate instanceof Date ? inputDate : new Date(inputDate);
	if (Number.isNaN(dateObj.getTime())) return "";

	const day = dateObj.getDate();
	const month = dateObj.getMonth() + 1;
	const year = dateObj.getFullYear();

	return `${day}/${month}/${year}`;
};

export const formatDateForInitialInput = (inputDate) => {
	if (!inputDate) return "";

	const [date] = inputDate.split(" ");

	return date;
}

export const formatNumberWithThousandsSeparator = (inputVal) => {
	if (inputVal === null || inputVal === undefined || inputVal === "") return "";

	const rawStr = String(inputVal).replace(/,/g, "").trim();
	if (!rawStr) return "";

	const num = Number(rawStr);
	if (Number.isNaN(num)) return String(inputVal);

	return new Intl.NumberFormat("en-US").format(num);
};

export const formatCurrencyRM = (inputVal) => {
	const formatted = formatNumberWithThousandsSeparator(inputVal);
	return formatted ? `RM ${formatted}` : "";
};
