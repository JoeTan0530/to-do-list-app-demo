"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "react-bootstrap";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

// Components
import CustomFormBuilder from "../utilities/components/CustomFormBuilder";

// Services
import { addTask, editTask, getTaskStatus, getTaskCategory, getTaskItem } from "../utilities/services/TodoService";

// ============================================================
// Types
// ============================================================
interface FormData {
  taskID?: string;          // only present in edit mode
  taskName: string;
  taskCategory: string;
  taskDescription: string;
  status: string;
  dueDate: string;
}

interface FormConfigItem {
  id: string;
  type: string;
  label: string;
  isRequired?: boolean;
  value?: string;
  options?: Array<{ label: string; value: string }>;
}

// ============================================================
// Component
// ============================================================
export default function Form() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("taskID");
  const action = id && id !== "" ? "edit" : "add";

  const [formData, setFormData] = useState<FormData>({
    taskName: "",
    taskCategory: "",
    taskDescription: "",
    status: "",
    dueDate: new Date().toISOString().slice(0, 10), // keep only date part
  });

  const [errorMsg, setErrorMsg] = useState<Record<string, string>>({});

  const [formConfig, setFormConfig] = useState<FormConfigItem[]>([
    {
      id: "taskName",
      type: "text",
      label: "Task Name",
      isRequired: true,
    },
    {
      id: "taskCategory",
      type: "select",
      label: "Task Category",
      value: "", // will be updated later
      options: [],
      isRequired: true,
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
      isRequired: true,
    },
    {
      id: "dueDate",
      type: "date",
      label: "Due Date",
    },
  ]);

  // -------------------- Effects --------------------
  useEffect(() => {
    // Fetch dropdown options
    getTaskStatus(updateFieldOptions("status"));
    getTaskCategory(updateFieldOptions("taskCategory"));

    // If editing, fetch the task data
    if (action === "edit" && id) {
      getTaskItem(
        { taskID: id, editUse: true },
        (data: any, msg: string) => {
          setFormData({
            taskID: id,
            taskName: data.taskName || "",
            taskCategory: data.taskCategory || "",
            taskDescription: data.taskDescription || "",
            status: data.status || "",
            dueDate: data.dueDate || new Date().toISOString().slice(0, 10),
          });
        }
      );
    }
  }, []);

  // -------------------- Handlers --------------------
  // Generic updater for select options (called from service callbacks)
  const updateFieldOptions =
    (fieldId: string) =>
    (data: any[], msg: string) => {
      setFormConfig((prev) =>
        prev.map((item) =>
          item.id === fieldId && item.type === "select"
            ? { ...item, options: data }
            : item
        )
      );
      // Set the first option as the default value if available
      if (data && data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          [fieldId]: data[0].value,
        }));
      }
    };

  // Update form data on user input
  const updateFormData = (
    events:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | { target: { id: string; value: any } }
  ) => {
    const { id, value } = events.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Submit form (add or edit)
  const triggerConfirm = () => {
    setErrorMsg({});
    if (action === "add") {
      addTask(formData, triggerAPICallback, setErrorMsg);
    } else if (action === "edit") {
      editTask(formData, triggerAPICallback, setErrorMsg);
    }
  };

  // Callback after API success
  const triggerAPICallback = (data: any, msg: string) => {
    toast.success(msg);
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  // Navigate back to listing
  const returnToListing = () => {
    router.push("/");
  };

  // -------------------- Render --------------------
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-5xl flex-col items-center justify-between py-6 md:py-12 px-6 md:px-16 bg-zinc-50 dark:bg-black sm:items-start">
        <div className="flex flex-col items-center w-full gap-6 text-center sm:items-start sm:text-left">
          {/* Back button */}
          <div className="w-full mb-1">
            <Button
              className="rounded-xl bg-white border border-solid border-gray-300 text-gray-600 p-2 cursor-pointer hover:bg-gray-100 me-3 w-40"
              onClick={returnToListing}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
              <span>Back</span>
            </Button>
          </div>

          {/* Title */}
          <div className="w-full mb-5">
            <div className="text-3xl font-bold">
              {action === "edit" ? "Edit Task" : "Add Task"}
            </div>
          </div>

          {/* Form */}
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

            {/* Action buttons */}
            <div className="flex flex-row justify-end items-center w-full">
              <Button
                className="rounded-xl border border-solid border-gray-300 text-gray-600 p-2 cursor-pointer hover:bg-gray-100 me-3 w-40"
                onClick={returnToListing}
              >
                Cancel
              </Button>
              <Button
                className="rounded-lg bg-blue-500 text-white hover:bg-blue-400 p-2 cursor-pointer w-40"
                onClick={triggerConfirm}
              >
                {action === "edit" ? "Edit Task" : "Add Task"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}