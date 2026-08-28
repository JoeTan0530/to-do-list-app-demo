"use client"

import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardCard from "./web/utilities/components/DashboardCard";
import CustomSearchBar from "./web/utilities/components/CustomSearchBar";

// Icon import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faClock, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

export default function HomePage() {
  const [dashboardConfig, setDashboardConfig] = useState([
    {
      icon: <FontAwesomeIcon icon={faBars} />,
      label: "Test",
      value: "Hexagone"
    },
    {
      icon: <FontAwesomeIcon icon={faClock} />,
      iconBg: "bg-yellow-200",
      iconColor: "text-yellow-400",
      label: "Test 2",
      value: "Digimon"
    },
    {
      icon: <FontAwesomeIcon icon={faCircleCheck} />,
      iconBg: "bg-green-200",
      iconColor: "text-green-400",
      label: "Test 3",
      value: "Holington"
    },
  ]);

  const [searchBarFilterConfig, setSearchBarFilterConfig] = useState([
    {
      title: "Filter By",
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
      title: "Sort By",
      btnItemArr: [
        {
          label: "Created At",
          value: "created_at",
        },
        {
          label: "Due Date",
          value: "due_date",
        },
        {
          label: "Custom Order",
          value: "order",
        },
      ]
    },
    {
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
    }
  ]);

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
            <div className="w-full">
              <CustomSearchBar 
                containerID="customSearch"
                searchInputID="searchBar"
                redirectBtn={redirectToForm}
                btnArr={searchBarFilterConfig}
              />
            </div>
          </div>
      </main>
    </div>
  );  
}