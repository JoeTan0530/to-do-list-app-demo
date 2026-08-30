import React, { useState, useEffect, useRef, useImperativeHandle, useId } from "react";
import Select from "react-select";

interface CustomSelectProps {
	selectOptions: [],
	handleSelectValue?: Function,
	placeholderDisplay?: string,
	selectID?: string,
	getInputDataKey?: string,
	currentValue?: string,
	customSelectRef?: React.Ref<HTMLDivElement>,
}

const CustomSelect: React.FC<CustomSelectProps> = (props) => {
	/* 
		For the getInputDataKey by default it will use "id" 
		but if for the handle onChange function you're using
		"name" or whatever other props to get the input value
		you can use 'getInputDataKey' props to overwrite it.
	 */

	const {
		selectOptions,
		handleSelectValue,
		placeholderDisplay = "",
		selectID,
		getInputDataKey = "id",
		currentValue = "",
		customSelectRef,
	} = props;

	let optionList = selectOptions ? [...selectOptions] : [{ value: "", label: "" }];
	const uniqueID = useId();
	const displayID = selectID || `select-${uniqueID}`;

	const [displayType, setDisplayType] = useState(optionList[0]);
	const selectRef = useRef();

	useImperativeHandle(customSelectRef, () => ({
		resetInput: () => {
			triggerReset();
		}
	}));

	useEffect(() => {
		let currOption = { value: "", label: "" };
		if (currentValue || currentValue === 0) {
			let tempObj = optionList.find((item) => {
				return item.value === currentValue;
			});

			currOption = tempObj;
		} else {
			currOption = optionList[0];
		}

		setDisplayType(currOption);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [optionList, currentValue]);

	const triggerChange = (onChangeVal) => {
		const inputRef = selectRef.current.inputRef;
		handleSelectValue({
			target: {
				id: inputRef[getInputDataKey],
				value: onChangeVal.value
			}
		});
	}

	const triggerReset = () => {
		setDisplayType(optionList[0]);
	}

	return (
		<Select
			inputId={displayID}
			instanceId={displayID}
			ref={selectRef}
			className="form-select bg-gray-100 border border-gray-300 rounded-lg"
			classNamePrefix="form-select"
			options={optionList}
			value={displayType}
			onChange={(event) => {
				setDisplayType(event);
				triggerChange(event);
			}}
			placeholder={placeholderDisplay}
			styles={{
				control: (base) => ({
					...base,
					border: "none",
					boxShadow: "none"
				})
			}}
			components={{ IndicatorSeparator: () => null }}
		/>
	)
}

export default CustomSelect;