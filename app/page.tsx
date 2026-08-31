"use client"

import { redirect, useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useState, useRef, useMemo } from 'react';

import DashboardCard from "./web/utilities/components/DashboardCard";
import CustomSearchBar from "./web/utilities/components/CustomSearchBar";
import CustomDraggableTable from './web/utilities/components/CustomDraggableTable';
import CustomFileImporter from './web/utilities/components/CustomFileImporter';
import CustomExportButton from './web/utilities/components/CustomExportButton';
import toast from 'react-hot-toast';
import debounce from 'lodash/debounce';
import { Button } from "react-bootstrap"

// Icon import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faClock, faCircleCheck, faCalendarDays } from "@fortawesome/free-solid-svg-icons";

import { getTaskList, getTaskStatus, getTaskCategory, importTasks, removeTask, reorderingTask, getDashboardData, updateTaskStatus } from "./web/utilities/services/TodoService"

export default function HomePage() {
  const router = useRouter();

  const [dashboardConfig, setDashboardConfig] = useState([
    {
      id: "total",
      icon: <FontAwesomeIcon icon={faBars} />,
      label: "Total Task",
      value: "Hexagone"
    },
    {
      id: "incomplete",
      icon: <FontAwesomeIcon icon={faClock} />,
      iconBg: "bg-yellow-200",
      iconColor: "text-yellow-400",
      label: "Incomplete",
      value: "Digimon"
    },
    {
      id: "complete",
      icon: <FontAwesomeIcon icon={faCircleCheck} />,
      iconBg: "bg-green-200",
      iconColor: "text-green-400",
      label: "Completed",
      value: "Holington"
    },
  ]);

  const [searchBarFilterForm, setSearchBarFilterForm] = useState({});
  const prevFilterRef = useRef(searchBarFilterForm);

  const [searchBarFilterConfig, setSearchBarFilterConfig] = useState([
    {
      id: "status",
      title: "Status",
      btnItemArr: [
        {
          label: "Completed",
          value: "complete" 
        },
        {
          label: "Incompleted",
          value: "incomplete" 
        }
      ]
    },
    {
      id: "task_category",
      title: "Category",
      btnItemArr: [
        {
          label: "Completed",
          value: "complete" 
        },
        {
          label: "Incompleted",
          value: "incomplete" 
        }
      ]
    },
    {
      id: "sort",
      title: "Sort By",
      btnItemArr: [
        {
          label: "Created At",
          value: "createdAt",
        },
        {
          label: "Due Date",
          value: "due_date",
        },
        {
          label: "Priority",
          value: "order",
        },
      ]
    },
    {
      id: "order",
      title: "Order By",
      btnItemArr: [
        {
          label: "Ascending",
          value: "ascending"
        },
        {
          label: "Descending",
          value: "descending"
        },
      ]
    },
    {
      id: "limit",
      title: "Task Per Page",
      btnItemArr: [
        {
          label: "5 Tasks",
          value: 5
        },
        {
          label: "10 Tasks",
          value: 10
        },
        {
          label: "15 Tasks",
          value: 15
        },
        {
          label: "20 Tasks",
          value: 20
        },
      ]
    }
  ]);

  const updateFieldOptions = (fieldId: string) => (data: any[], msg: string) => {
    setSearchBarFilterConfig((prev) =>
      prev.map((item) =>
        item.id === fieldId
          ? { ...item, btnItemArr: data }
          : item
      )
    );
  };

  const triggerListingAPI = (pageNumber = 1) => {
    const apiParams = {
      page: pageNumber,
      limit: searchBarFilterForm['limit'],
      filters: searchBarFilterForm
    }

    getTaskList(apiParams, listingCallback);
  }

  const displayDashboard = (data, msg) => {
    for (const [key, value] of Object.entries(data)) {
      setDashboardConfig((prev) =>
        prev.map((item) =>
          item.id === key
            ? { ...item, value: value }
            : item
        )
      );
    }
  }

  useLayoutEffect(() => {
    getTaskList({}, listingCallback);
    getTaskStatus(updateFieldOptions('status'));
    getTaskCategory(updateFieldOptions('task_category'));
  },[]);

  useEffect(() => {
    if (prevFilterRef.current === searchBarFilterForm) {
      return; // Skip this run
    }
    triggerListingAPI();
  },[searchBarFilterForm]);

  const listingCallback = (data, msg) => {
    setTasks(data.listing || []);
    setPagingData(data.pagination || {});
    getDashboardData(displayDashboard);
  }

  const [tasks, setTasks] = useState([]);
  const [pagingData, setPagingData] = useState({});

  const columns = [
    { key: 'taskName', header: 'Task Name' },
    { key: 'taskDescription', header: 'Task Description'},
    { key: 'taskCategory', header: 'Task Category' },
    { key: 'statusDisplay', header: 'Status' },
    { key: 'dueDate', header: 'Due Date' },
    { key: 'completedDate', header: 'Completed Date' },
    { key: 'order', header: 'Priority' }
  ];

  const debouncedReorder = useMemo(
    () =>
      debounce((newData: any[]) => {
        // 1. Extract task IDs in the new order
        const taskIDs = newData.map(item => item.taskID);

        // 2. Get current page and limit from pagingData state
        const page = pagingData.pageNumber || 1;
        const limit = pagingData.numRecord || 10;

        // 3. Call the reordering API with the new order for this page
        reorderingTask(
          { page, limit, reorderedTaskList: taskIDs },
          (data, msg) => {
            toast.success(msg);
            triggerListingAPI(); // refresh the list
          }
        );
      }, 1000), // 1 second delay after dragging stops
    [] // empty deps – function created once
  );

  const handleReorder = (newData) => {
    debouncedReorder.cancel(); // cancel any pending call
    debouncedReorder(newData);
  };

  const handleEdit = (item: any) => {
    router.push(`/Form?taskID=${item.taskID}`);
  };

  const handleDelete = (item: any) => {
    removeTask({taskID: item.taskID}, (data, msg) => {
      toast.success(msg);
      triggerListingAPI();
    });
  };

  const handleToggleStatus = (item: any) => {
    const newStatus = item.status === 'complete' ? 'incomplete' : 'complete';
    updateTaskStatus({taskID: item.taskID, status: newStatus}, (data, msg) => {
      toast.success(msg);
      triggerListingAPI();
    });
  }

  const redirectToForm = () => {
    redirect("/Form");
  }

  const handleFileImportParsed = (data: any[]) => {
    importTasks({tasks: data}, (data, msg) => {
      toast.success(msg);
      triggerListingAPI();
    });
  };

  const handleImportError = (error: string) => {
    toast.error(error);
  };

  const fetchAllTasksForExport = async () => {
    return new Promise((resolve, reject) => {
      const payload = {
        page: 1,
        limit: 0,
        filter: searchBarFilterForm, 
      };

      getTaskList(payload, (data, msg) => {
        if (data && data.listing) {
          resolve(data.listing);
        }
      });
    });
  }

  const redirectToCalendarView = () => {
    router.push("/Calendar");
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-5xl flex-col items-center justify-between py-6 md:py-12 px-6 md:px-16 bg-zinc-50 dark:bg-black sm:items-start">
          <div className="flex flex-col items-center w-full gap-6 text-center sm:items-start sm:text-left">
            <div className="flex flex-col md:flex-row md:justify-between items-center w-full md:mb-5">
              <div className="mb-5 md:mb-0">
                <div className="text-3xl font-bold">
                  Todo Tasks
                </div>
                <div className="text-xl font-light text-gray-500">
                  Stay organized, get things done.
                </div>
              </div>
              <div className="w-full md:w-auto">
                <Button className="rounded-lg bg-blue-500 text-white hover:bg-blue-400 p-2 cursor-pointer w-full md:w-40" onClick={redirectToCalendarView}>
                  <FontAwesomeIcon icon={faCalendarDays} className="me-1"/>
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
                filename={`tasks-export-${new Date().toISOString().slice(0,10)}.csv`}
                columns={['taskName', 'taskDescription', 'taskCategory', 'status', 'dueDate', 'completedDate']}
                columnHeaders={['Task Name', 'Task Description', 'Category', 'Status', 'Due Date', 'Completed Date']}
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