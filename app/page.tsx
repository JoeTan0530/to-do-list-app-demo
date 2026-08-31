"use client";

import { redirect, useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useState, useRef, useMemo } from "react";
import { Button } from "react-bootstrap";
import toast from "react-hot-toast";
import debounce from "lodash/debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faClock, faCircleCheck, faCalendarDays } from "@fortawesome/free-solid-svg-icons";

// Components
import DashboardCard from "./web/utilities/components/DashboardCard";
import CustomSearchBar from "./web/utilities/components/CustomSearchBar";
import CustomDraggableTable from "./web/utilities/components/CustomDraggableTable";
import CustomFileImporter from "./web/utilities/components/CustomFileImporter";
import CustomExportButton from "./web/utilities/components/CustomExportButton";

// Services
import {
  getTaskList,
  getTaskStatus,
  getTaskCategory,
  importTasks,
  removeTask,
  reorderingTask,
  getDashboardData,
  updateTaskStatus,
} from "./web/utilities/services/TodoService";

// ============================================================
// Types
// ============================================================
interface Task {
  taskID: string;
  taskName: string;
  taskDescription?: string;
  taskCategory: string;
  status: string;
  statusDisplay: string;
  dueDate?: string;
  completedDate?: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

interface PagingData {
  pageNumber: number;
  numRecord: number;
  totalRecord: number;
  totalPage: number;
}

// ✅ Changed icon type from JSX.Element to React.ReactNode
interface DashboardItem {
  id: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  label: string;
  value: string | number;
}

interface FilterForm {
  status?: string;
  task_category?: string;
  sort?: string;
  order?: string;
  limit?: number;
  taskDescription?: string;
  [key: string]: any;
}

// This type should match what CustomSearchBar expects.
// We'll define it exactly as CustomSearchBar's btnArr type.
interface SearchBarFilterItem {
  id: string;
  title: string;
  btnItemArr: Array<{ label: string; value: string | number }>;
}

// ============================================================
// Component
// ============================================================
export default function HomePage() {
  const router = useRouter();

  // -------------------- State --------------------
  const [dashboardConfig, setDashboardConfig] = useState<DashboardItem[]>([
    {
      id: "total",
      icon: <FontAwesomeIcon icon={faBars} />,
      label: "Total Task",
      value: "Hexagone",
    },
    {
      id: "incomplete",
      icon: <FontAwesomeIcon icon={faClock} />,
      iconBg: "bg-yellow-200",
      iconColor: "text-yellow-400",
      label: "Incomplete",
      value: "Digimon",
    },
    {
      id: "complete",
      icon: <FontAwesomeIcon icon={faCircleCheck} />,
      iconBg: "bg-green-200",
      iconColor: "text-green-400",
      label: "Completed",
      value: "Holington",
    },
  ]);

  const [searchBarFilterForm, setSearchBarFilterForm] = useState<FilterForm>({});
  const prevFilterRef = useRef<FilterForm>(searchBarFilterForm);

  const [searchBarFilterConfig, setSearchBarFilterConfig] = useState<SearchBarFilterItem[]>([
    {
      id: "status",
      title: "Status",
      btnItemArr: [
        { label: "Completed", value: "complete" },
        { label: "Incompleted", value: "incomplete" },
      ],
    },
    {
      id: "task_category",
      title: "Category",
      btnItemArr: [
        { label: "Completed", value: "complete" },
        { label: "Incompleted", value: "incomplete" },
      ],
    },
    {
      id: "sort",
      title: "Sort By",
      btnItemArr: [
        { label: "Created At", value: "createdAt" },
        { label: "Due Date", value: "due_date" },
        { label: "Priority", value: "order" },
      ],
    },
    {
      id: "order",
      title: "Order By",
      btnItemArr: [
        { label: "Ascending", value: "ascending" },
        { label: "Descending", value: "descending" },
      ],
    },
    {
      id: "limit",
      title: "Task Per Page",
      btnItemArr: [
        { label: "5 Tasks", value: 5 },
        { label: "10 Tasks", value: 10 },
        { label: "15 Tasks", value: 15 },
        { label: "20 Tasks", value: 20 },
      ],
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagingData, setPagingData] = useState<PagingData>({
    pageNumber: 1,
    numRecord: 10,
    totalRecord: 0,
    totalPage: 1,
  });

  // -------------------- Column Definitions --------------------
  const columns = [
    { key: "taskName", header: "Task Name" },
    { key: "taskDescription", header: "Task Description" },
    { key: "taskCategory", header: "Task Category" },
    { key: "statusDisplay", header: "Status" },
    { key: "dueDate", header: "Due Date" },
    { key: "completedDate", header: "Completed Date" },
    { key: "order", header: "Priority" },
  ];

  // -------------------- Listing API --------------------
  const triggerListingAPI = (pageNumber: number = 1) => {
    const apiParams = {
      page: pageNumber,
      limit: searchBarFilterForm.limit,
      filters: searchBarFilterForm,
    };
    getTaskList(apiParams, listingCallback);
  };

  const listingCallback = (data: any, msg: string) => {
    setTasks(data.listing || []);
    setPagingData(data.pagination || { pageNumber: 1, numRecord: 10, totalRecord: 0, totalPage: 1 });
    getDashboardData(displayDashboard);
  };

  // -------------------- Dashboard --------------------
  const displayDashboard = (data: Record<string, number>, msg: string) => {
    for (const [key, value] of Object.entries(data)) {
      setDashboardConfig((prev) =>
        prev.map((item) =>
          item.id === key ? { ...item, value } : item
        )
      );
    }
  };

  // -------------------- Filter / Search --------------------
  const updateFieldOptions = (fieldId: string) => (data: any[], msg: string) => {
    setSearchBarFilterConfig((prev) =>
      prev.map((item) =>
        item.id === fieldId
          ? { ...item, btnItemArr: data }
          : item
      )
    );
  };

  // -------------------- Reorder (with debounce) --------------------
  const debouncedReorder = useMemo(
    () =>
      debounce((newData: Task[]) => {
        const taskIDs = newData.map((item) => item.taskID);
        const page = pagingData.pageNumber || 1;
        const limit = pagingData.numRecord || 10;

        reorderingTask(
          { page, limit, reorderedTaskList: taskIDs },
          (data: any, msg: string) => {
            toast.success(msg);
            triggerListingAPI();
          }
        );
      }, 1000),
    [pagingData] // re-create when pagingData changes
  );

  const handleReorder = (newData: Task[]) => {
    debouncedReorder.cancel();
    debouncedReorder(newData);
  };

  // -------------------- Action Handlers --------------------
  const handleEdit = (item: Task) => {
    router.push(`/Form?taskID=${item.taskID}`);
  };

  const handleDelete = (item: Task) => {
    removeTask({ taskID: item.taskID }, (data: any, msg: string) => {
      toast.success(msg);
      triggerListingAPI();
    });
  };

  const handleToggleStatus = (item: Task) => {
    const newStatus = item.status === "complete" ? "incomplete" : "complete";
    updateTaskStatus(
      { taskID: item.taskID, status: newStatus },
      (data: any, msg: string) => {
        toast.success(msg);
        triggerListingAPI();
      }
    );
  };

  // -------------------- Navigation --------------------
  const redirectToForm = () => {
    redirect("/Form");
  };

  const redirectToCalendarView = () => {
    router.push("/Calendar");
  };

  // -------------------- Import / Export --------------------
  const handleFileImportParsed = (data: any[]) => {
    importTasks({ tasks: data }, (data: any, msg: string) => {
      toast.success(msg);
      triggerListingAPI();
    });
  };

  const handleImportError = (error: string) => {
    toast.error(error);
  };

  const fetchAllTasksForExport = async (): Promise<any[]> => {
    return new Promise((resolve) => {
      const payload = {
        page: 1,
        limit: 0,
        filter: searchBarFilterForm,
      };
      getTaskList(payload, (data: any, msg: string) => {
        if (data && data.listing) {
          resolve(data.listing);
        } else {
          resolve([]);
        }
      });
    });
  };

  // -------------------- Effects --------------------
  useLayoutEffect(() => {
    getTaskList({}, listingCallback);
    getTaskStatus(updateFieldOptions("status"));
    getTaskCategory(updateFieldOptions("task_category"));
  }, []);

  useEffect(() => {
    if (prevFilterRef.current === searchBarFilterForm) {
      return;
    }
    triggerListingAPI();
  }, [searchBarFilterForm]);

  // Update the ref after effect runs
  useEffect(() => {
    prevFilterRef.current = searchBarFilterForm;
  }, [searchBarFilterForm]);

  // -------------------- Render --------------------
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-5xl flex-col items-center justify-between py-6 md:py-12 px-6 md:px-16 bg-zinc-50 dark:bg-black sm:items-start">
        <div className="flex flex-col items-center w-full gap-6 text-center sm:items-start sm:text-left">
          <div className="flex flex-col md:flex-row md:justify-between items-center w-full md:mb-5">
            <div className="mb-5 md:mb-0">
              <div className="text-3xl font-bold">Todo Tasks</div>
              <div className="text-xl font-light text-gray-500">
                Stay organized, get things done.
              </div>
            </div>
            <div className="w-full md:w-auto">
              <Button
                className="rounded-lg bg-blue-500 text-white hover:bg-blue-400 p-2 cursor-pointer w-full md:w-40"
                onClick={redirectToCalendarView}
              >
                <FontAwesomeIcon icon={faCalendarDays} className="me-1" />
                <span>Calendar View</span>
              </Button>
            </div>
          </div>

          <div className="w-full mb-4">
            <DashboardCard
              dashboardID="customDashboardCard"
              cardConfig={dashboardConfig}
            />
          </div>

          <div className="w-full mb-3">
            <CustomSearchBar
              containerID="customSearch"
              searchInputID="taskDescription"
              redirectBtn={redirectToForm}
              btnArr={searchBarFilterConfig}
              formDataState={setSearchBarFilterForm}
            />
          </div>

          <div className="flex flex-row justify-between items-center w-full mb-1">
            <CustomFileImporter
              id="task-importer"
              onFileParsed={handleFileImportParsed}
              onError={handleImportError}
              accept=".csv"
              buttonText="Import Tasks"
              hasHeaderRow={true}
              showFileName={false}
            />
            <CustomExportButton
              fetchData={fetchAllTasksForExport}
              filename={`tasks-export-${new Date().toISOString().slice(0, 10)}.csv`}
              columns={["taskName", "taskDescription", "taskCategory", "status", "dueDate", "completedDate"]}
              columnHeaders={["Task Name", "Task Description", "Category", "Status", "Due Date", "Completed Date"]}
            />
          </div>

          <div className="w-full">
            <CustomDraggableTable
              tableId="tasks-table"
              columns={columns}
              data={tasks}
              rowKey="taskID"
              onReorder={handleReorder}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              showActions
              pagingData={pagingData}
              pagingFunction={triggerListingAPI}
            />
          </div>
        </div>
      </main>
    </div>
  );
}