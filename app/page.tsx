"use client"

import { redirect } from 'next/navigation';
import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import DashboardCard from "./web/utilities/components/DashboardCard";
import CustomSearchBar from "./web/utilities/components/CustomSearchBar";
import CustomDraggableTable from './web/utilities/components/CustomDraggableTable';

// Icon import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faClock, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

import { getTaskList, getTaskStatus, getTaskCategory } from "./web/utilities/services/TodoService"

export default function HomePage() {
  const [dashboardConfig, setDashboardConfig] = useState([
    {
      icon: <FontAwesomeIcon icon={faBars} />,
      label: "Total Task",
      value: "Hexagone"
    },
    {
      icon: <FontAwesomeIcon icon={faClock} />,
      iconBg: "bg-yellow-200",
      iconColor: "text-yellow-400",
      label: "Incomplete",
      value: "Digimon"
    },
    {
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

    // console.log("apiParams: ", apiParams);
    getTaskList(apiParams, listingCallback);
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
  }

  const [tasks, setTasks] = useState([]);

  const columns = [
    { key: 'taskName', header: 'Task Name' },
    { key: 'taskDescription', header: 'Task Description'},
    { key: 'taskCategory', header: 'Task Category' },
    { key: 'status', header: 'Status' },
    { key: 'dueDate', header: 'Due Date' },
    { key: 'order', header: 'Priority' }
  ];

  const handleEdit = (item: any) => {
    console.log("Edit", item);
  };

  const handleView = (item: any) => {
    console.log('View', item);
  };

  const handleDelete = (item: any) => {
    console.log('Delete', item);
  };

  const redirectToForm = () => {
    redirect("/Form");
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-5xl flex-col items-center justify-between py-6 md:py-12 px-6 md:px-16 bg-zinc-50 dark:bg-black sm:items-start">
          <div className="flex flex-col items-center w-full gap-6 text-center sm:items-start sm:text-left">
            <div className="w-full mb-5">
              <div className="text-3xl font-bold">
                Todo Tasks
              </div>
              <div className="text-xl font-light text-gray-500">
                Stay organized, get things done.
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
            <div className="w-full">
              <CustomDraggableTable
                tableId="tasks-table"
                columns={columns}
                data={tasks}
                rowKey="taskID"
                // onReorder={handleReorder}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
                showActions
              />
            </div>
          </div>
      </main>
    </div>
  );  
}