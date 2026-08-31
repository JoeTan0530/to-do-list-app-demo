'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomCalendar from '../utilities/components/CustomCalendar';
import { getTaskList } from '../utilities/services/TodoService';
import toast from 'react-hot-toast';
import { Button } from "react-bootstrap";

// Icon import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function CalendarPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);

  const fetchTasks = () => {
    // Fetch all tasks (no pagination, filter by due date if needed)
    getTaskList({ limit: 0 }, (data, msg) => {
      setTasks(data.listing || []);
    });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskClick = (task: any) => {
    // Navigate to edit form
    router.push(`/Form?taskID=${task.taskID}`);
  };

  const returnToListing = () => {
    router.push('/')
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-5xl flex-col items-center py-6 md:py-12 px-6 md:px-16 bg-zinc-50 dark:bg-black">
        <div className="w-full mb-5">
          <Button className="rounded-xl bg-white border border-solid border-gray-300 text-gray-600 p-2 cursor-pointer hover:bg-gray-100 me-3 w-40" onClick={returnToListing}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-1"/>
            <span>Back</span>
          </Button>
        </div>
        <div className="w-full mb-5">
          <div className="text-3xl font-bold">Calendar View</div>
          <div className="text-xl font-light text-gray-500">
            See your tasks organized by due date.
          </div>
        </div>
        <CustomCalendar calendarID="calendarDisplay" tasks={tasks} onTaskClick={handleTaskClick} />
      </main>
    </div>
  );
}