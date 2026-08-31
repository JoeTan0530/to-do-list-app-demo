"use client"
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "react-bootstrap";

import CustomFormBuilder from "../utilities/components/CustomFormBuilder";
import CustomDatePicker from "../utilities/components/CustomDatePicker";

// Icon import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { addTask, editTask, getTaskStatus, getTaskCategory, getTaskItem } from "../utilities/services/TodoService"
import toast from 'react-hot-toast';

export default function Form() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('taskID');
  const action = (id && id !== "") ? 'edit' : 'add'; 

  const [formData, setFormData] = useState({
    taskName: "",
    taskCategory: "",
    taskDescription: "",
    status: "",
    dueDate: new Date().toISOString(),
  });

  const [errorMsg, setErrorMsg] = useState({});

  const [formConfig, setFormConfig] = useState([
    {
      id: "taskName",
      type: "text",
      label: "Task Name",
      isRequired: true
    },
    {
      id: "taskCategory",
      type: "select",
      label: "Task Category",
      value: formData['taskCategory'],
      options: [],
      isRequired: true
    },
    {
      id: "taskDescription",
      type: "textarea",
      label: "Task Description",
    },
    {
      id: "status",
      type: "select",
      label: "Status",
      options: [],
      isRequired: true
    },
    {
      id: "dueDate",
      type: "date",
      label: "Due Date",
    }
  ]);

  useEffect(() => {
    getTaskStatus(updateFieldOptions('status'));
    getTaskCategory(updateFieldOptions('taskCategory'));

    if (action === 'edit') {
      getTaskItem({taskID: id, editUse: true}, (data, msg) => {
        setFormData({
          taskID: id,
          taskName: data.taskName,
          taskCategory: data.taskCategory,
          taskDescription: data.taskDescription,
          status: data.status,
          dueDate: data.dueDate,
        });
      });
    }

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
    console.log('test');
    setFormData((prevData) => ({
      ...prevData,
      [id]: value
    }));
  }

  const triggerConfirm = () => {
    setErrorMsg({});

    if (action === "add") {
      addTask(formData, triggerAPICallback, setErrorMsg);
    } else if (action === "edit") {
      editTask(formData, triggerAPICallback, setErrorMsg)
    }
  }

  const triggerAPICallback = (data, msg) => {
    toast.success(msg);
    setTimeout(() => {
      router.push('/');
    }, 1500);
  }

  const returnToListing = () => {
    router.push('/')
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-5xl flex-col items-center justify-between py-6 md:py-12 px-6 md:px-16 bg-zinc-50 dark:bg-black sm:items-start">
        <div className="flex flex-col items-center w-full gap-6 text-center sm:items-start sm:text-left">
          <div className="w-full mb-1">
            <Button className="rounded-xl bg-white border border-solid border-gray-300 text-gray-600 p-2 cursor-pointer hover:bg-gray-100 me-3 w-40" onClick={returnToListing}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-1"/>
              <span>Back</span>
            </Button>
          </div>
          <div className="w-full mb-5">
            <div className="text-3xl font-bold">
              { action === "edit" ? (<span>Edit Task</span>) : (<span>Add Task</span>) }
            </div>
          </div>
          <div className="w-full p-5 bg-white rounded-xl border border-gray-300">
            <div className="mb-5">
              <CustomFormBuilder 
                formID="taskForm"
                formConfig={formConfig}
                handleFormData={updateFormData}
                latestFormData={formData}
                errorState={errorMsg}
              />
            </div>
            <div className="flex flex-row justify-end items-center w-full">
              <Button className="rounded-xl border border-solid border-gray-300 text-gray-600 p-2 cursor-pointer hover:bg-gray-100 me-3 w-40" onClick={returnToListing}>
                Cancel
              </Button>
              <Button className="rounded-lg bg-blue-500 text-white hover:bg-blue-400 p-2 cursor-pointer w-40" onClick={triggerConfirm}>
                { action === "edit" ? (<span>Edit Task</span>) : (<span>Add Task</span>) }
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
