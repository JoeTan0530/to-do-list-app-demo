import { useEffect, useState, useId } from "react";
import { Form } from "react-bootstrap";

import CustomSelect from "./CustomSelect";
import CustomDatePicker from "./CustomDatePicker";

// ============================================================
// Types
// ============================================================
interface FormConfigItem {
  id: string;
  type: "text" | "select" | "date" | "textarea" | string; // allow any string but we specify common ones
  label: string;
  isRequired?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  value?: string;
}

interface CustomFormBuilderProps {
  formID: string;
  formConfig: FormConfigItem[];
  handleFormData: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { id: string; value: any } }) => void;
  latestFormData: Record<string, any>;
  errorState?: Record<string, string>;
}

const CustomFormBuilder: React.FC<CustomFormBuilderProps> = (props) => {
  const { formID, formConfig, handleFormData, latestFormData, errorState = {} } = props;

  const uniqueID = useId();
  const formContainerID = formID || `defaultFormID${uniqueID}`;

  return (
    // ✅ Removed duplicate key
    <div key={formContainerID} className="w-full">
      <Form id={`formBuild${formContainerID}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          {formConfig && formConfig.length > 0 ? (
            formConfig.map((formItem, formIndex) => {
              const fieldId = formItem.id;
              const currentValue = latestFormData[fieldId] || "";
              const errorMessage = errorState[fieldId] || "";

              if (formItem.type === "select") {
                return (
                  <div key={`select-${formContainerID}-${formIndex}`} className="col-span-1">
                    <Form.Label className="block text-left text-lg font-bold mb-2">
                      {formItem.label}
                      {formItem.isRequired && <span className="text-red-500 ms-1">*</span>}
                    </Form.Label>
                    <CustomSelect
                      selectID={fieldId}
                      selectOptions={formItem.options || []}
                      currentValue={currentValue}
                      handleSelectValue={handleFormData}
                    />
                    {errorMessage && (
                      <div className="text-red-500 text-md text-normal mt-1">{errorMessage}</div>
                    )}
                  </div>
                );
              }

              if (formItem.type === "date") {
                return (
                  <div key={`date-picker-${formContainerID}-${formIndex}`} className="col-span-1">
                    <Form.Label className="block text-left text-lg font-bold mb-2">
                      {formItem.label}
                      {formItem.isRequired && <span className="text-red-500 ms-1">*</span>}
                    </Form.Label>
                    <CustomDatePicker
                      dateID={fieldId}
                      value={currentValue}
                      onChange={handleFormData}
                      asSingle={true}
                    />
                    {errorMessage && (
                      <div className="text-red-500 text-md text-normal mt-1">{errorMessage}</div>
                    )}
                  </div>
                );
              }

              if (formItem.type === "textarea") {
                return (
                  <div key={`input-${formContainerID}-${formIndex}`} className="col-span-1 md:col-span-2">
                    <Form.Group className="w-full" controlId={fieldId}>
                      <Form.Label className="block text-left text-lg font-bold mb-2">
                        {formItem.label}
                        {formItem.isRequired && <span className="text-red-500 ms-1">*</span>}
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        placeholder={formItem.placeholder || ""}
                        defaultValue={currentValue}
                        className="block bg-gray-100 rounded-md border border-gray-300 w-full p-2 focus:outline-none"
                        rows={3}
                        onChange={(event) => handleFormData(event)}
                      />
                      {errorMessage && (
                        <div className="text-red-500 text-md text-normal mt-1">{errorMessage}</div>
                      )}
                    </Form.Group>
                  </div>
                );
              }

              // Default: text input
              return (
                <Form.Group key={`input-${formContainerID}-${formIndex}`} className="w-full col-span-1" controlId={fieldId}>
                  <Form.Label className="block text-left text-lg font-bold mb-2">
                    {formItem.label}
                    {formItem.isRequired && <span className="text-red-500 ms-1">*</span>}
                  </Form.Label>
                  <Form.Control
                    type={formItem.type || "text"}
                    placeholder={formItem.placeholder || ""}
                    defaultValue={currentValue}
                    className="block bg-gray-100 rounded-md border border-gray-300 h-10 w-full p-2 focus:outline-none"
                    onChange={(event) => handleFormData(event)}
                  />
                  {errorMessage && (
                    <div className="text-red-500 text-md text-normal mt-1">{errorMessage}</div>
                  )}
                </Form.Group>
              );
            })
          ) : (
            <div className="p-5 text-gray-500">Loading form...</div>
          )}
        </div>
      </Form>
    </div>
  );
};

export default CustomFormBuilder;