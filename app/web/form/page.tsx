"use client"
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";

import CustomFormBuilder from "../utilities/components/CustomFormBuilder";
import CustomDatePicker from "../utilities/components/CustomDatePicker";

import { addTask, getTaskStatus, getTaskCategory } from "../utilities/services/TodoService"

export default function Form() {
  const [formData, setFormData] = useState({
    taskName: "",
    taskCategory: "",
    taskDescription: "",
    status: "",
    dueDate: "",
  });

  const [formConfig, setFormConfig] = useState([
    {
      id: "taskName",
      type: "text",
      label: "Task Name",
      placeholder: "",
    },
    {
      id: "taskCategory",
      type: "select",
      label: "Task Category",
      value: formData['taskCategory'],
      options: [],
    },
    {
      id: "taskDescription",
      type: "textarea",
      label: "Task Description",
      placeholder: "",
    },
    {
      id: "status",
      type: "select",
      label: "Status",
      options: []
    },
    {
      id: "dueDate",
      type: "date",
      label: "Due Date",
      placeholder: "",
    }
  ]);

  useEffect(() => {
    getTaskStatus(updateFieldOptions('status'));
    getTaskCategory(updateFieldOptions('taskCategory'));
  }, []);

  // Generic updater for select options
  const updateFieldOptions = (fieldId: string) => (data: any[], msg: string) => {
    setFormConfig((prev) =>
      prev.map((item) =>
        item.id === fieldId && item.type === 'select'
          ? { ...item, options: data }
          : item
      )
    );
    setFormData((prev) => ({
      ...prev,
      [fieldId]: data[0]['value']
    }));
  };

  const updateFormData = (events) => {
    const { id, value } = events.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value
    }));
  }

  const triggerConfirm = () => {
    console.log("Form Data: ", formData);
    // addTask(formData, triggerAPICallback);
  }

  const triggerAPICallback = (data, msg) => {
    console.log("data: ", data);
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-5xl flex-col items-center justify-between py-6 md:py-12 px-6 md:px-16 bg-zinc-50 dark:bg-black sm:items-start">
        <div className="flex flex-col items-center w-full gap-6 text-center sm:items-start sm:text-left">
          <div className="w-full mb-5">
            <div className="text-3xl font-bold">
              Add Task
            </div>
          </div>
          <div className="w-full p-5 bg-white rounded-xl border border-gray-300">
            <div className="mb-5">
              <CustomFormBuilder 
                formID="taskForm"
                formConfig={formConfig}
                handleFormData={updateFormData}
                latestFormData={formData}
              />
            </div>
            <div className="flex flex-row justify-end items-center w-full">
              <Button className="rounded-xl border border-solid border-gray-300 text-gray-600 p-2 cursor-pointer hover:bg-gray-100 me-3 w-40">
                Cancel
              </Button>
              <Button className="rounded-lg bg-blue-500 text-white hover:bg-blue-400 p-2 cursor-pointer w-40" onClick={triggerConfirm}>
                Add Task
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
