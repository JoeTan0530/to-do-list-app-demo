import { useEffect, useState, useId } from "react";
import { Form } from "react-bootstrap";

import CustomSelect from "./CustomSelect";
import CustomDatePicker from "./CustomDatePicker";

interface CustomFormBuilderProps {
	formID: string,
	formConfig: [],
	handleFormData: Function,
	latestFormData: {},
	errorState?: {}
}

const CustomFormBuilder: React.FC<CustomFormBuilderProps> = (props) => {
	const {
		formID,
		formConfig,
		handleFormData,
		latestFormData,
		errorState = {}
	} = props;

	const uniqueID = useId();
	const formContainerID = formID || `defaultFormID${uniqueID}`;

	return (
		<div key={formContainerID} key={formContainerID} className="w-full">
            <Form id={`formBuild${formContainerID}`}>
            	<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            		{
            			formConfig && formConfig.length > 0 && formConfig.map((formItem, formIndex) => {
            				if (formItem['type'] === "select") {
            					return (
            						<div key={`select-${formContainerID}-${formIndex}`} className="col-span-1">
            							<Form.Label className="block text-left text-lg font-bold mb-2">
	            							{formItem['label']}
	            							{formItem['isRequired'] && <span className="text-red-500 ms-1">*</span>}
	            						</Form.Label>
	            						<CustomSelect
			                                selectID={formItem['id']}
			                                selectOptions={formItem['options']}
			                                currentValue={latestFormData[formItem['id']] ? latestFormData[formItem['id']] : ""}
			                                addDefaultAllOption={false}
			                                handleSelectValue={handleFormData}
			                            />
			                            <div className="text-red-500 text-md text-normal mt-1">
			                            	{errorState[formItem['id']] ? errorState[formItem['id']] : ""}
			                            </div>
            						</div>
            					)
            				} else if (formItem['type'] === "date") {
            					return (
            						<div key={`date-picker-${formContainerID}-${formIndex}`} className="col-span-1">
            							<Form.Label className="block text-left text-lg font-bold mb-2">
	            							{formItem['label']}
	            							{formItem['isRequired'] && <span className="text-red-500 ms-1">*</span>}
	            						</Form.Label>
            							<CustomDatePicker 
            								dateID={formItem['id']}
            								value={latestFormData[formItem['id']] ? latestFormData[formItem['id']] : ""}
            								onChange={handleFormData}
            								asSingle={true}
            							/>
            							<div className="text-red-500 text-md text-normal mt-1">
			                            	{errorState[formItem['id']] ? errorState[formItem['id']] : ""}
			                            </div>
            						</div>
            					)
            				} else if (formItem['type'] === "textarea") {
            					return (
            						<div key={`input-${formContainerID}-${formIndex}`} className="col-span-1 md:col-span-2">
	            						<Form.Group className="w-full" controlId={formItem['id']}>
		            						<Form.Label className="block text-left text-lg font-bold mb-2">
		            							{formItem['label']}
		            							{formItem['isRequired'] && <span className="text-red-500 ms-1">*</span>}
		            						</Form.Label>
		            						<Form.Control
		            							as="textarea" 
		            							placeholder={formItem['placeholder'] ? formItem['placeholder'] : ""}
		            							defaultValue={latestFormData[formItem['id']] ? latestFormData[formItem['id']] : ""}
		            							className="block bg-gray-100 rounded-md border border-gray-300 w-full p-2 focus:outline-none"
		            							rows={3}
		            							onChange={(event) => handleFormData(event)}
		            						/>
		            						<div className="text-red-500 text-md text-normal mt-1">
				                            	{errorState[formItem['id']] ? errorState[formItem['id']] : ""}
				                            </div>
		            					</Form.Group>
            						</div>
            					)
            				} else {
            					return (
	            					<Form.Group key={`input-${formContainerID}-${formIndex}`} className="w-full col-span-1" controlId={formItem['id']}>
	            						<Form.Label className="block text-left text-lg font-bold mb-2">
	            							{formItem['label']}
	            							{formItem['isRequired'] && <span className="text-red-500 ms-1">*</span>}
	            						</Form.Label>
	            						<Form.Control
	            							type={formItem['type'] ? formItem['type'] : "text"} 
	            							placeholder={formItem['placeholder'] ? formItem['placeholder'] : ""}
	            							defaultValue={latestFormData[formItem['id']] ? latestFormData[formItem['id']] : ""}
	            							className="block bg-gray-100 rounded-md border border-gray-300 h-10 w-full p-2 focus:outline-none"
	            							onChange={(event) => handleFormData(event)}
	            						/>
	            						<div className="text-red-500 text-md text-normal mt-1">
			                            	{errorState[formItem['id']] ? errorState[formItem['id']] : ""}
			                            </div>
	            					</Form.Group>
	            				)
            				}
            			})
            		}
            		{
            			(!formConfig || formConfig.length === 0) && (
            				<div className="p-5 text-gray-500">Loading form...</div>
            			)
            		}
            	</div>
            </Form>
        </div>
	)
}

export default CustomFormBuilder;