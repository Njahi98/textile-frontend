import { useEffect, useState } from "react";
import { assignmentApi, type Assignment } from "@/services/assignment.api";

export interface CalendarDay {
  date: Date;
  assignments: Assignment[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function useAssignmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, Assignment[]>>({});
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterWorkerId, setFilterWorkerId] = useState<number | undefined>();
  const [filterProductionLineId, setFilterProductionLineId] = useState<number | undefined>();
  const [workers, setWorkers] = useState<{ id: number; name: string }[]>([]);
  const [productionLines, setProductionLines] = useState<{ id: number; name: string }[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const generateCalendarDays = (): CalendarDay[] => {
    const firstDay = new Date(year, month - 1, 1);
    const firstCalendarDay = new Date(firstDay);
    firstCalendarDay.setDate(firstCalendarDay.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(firstCalendarDay);
      date.setDate(firstCalendarDay.getDate() + i);

      const dateKey = date.toISOString().split("T")[0];
      const assignments = calendarData[dateKey] || [];

      days.push({
        date: new Date(date),
        assignments,
        isCurrentMonth: date.getMonth() === month - 1,
        isToday: date.getTime() === today.getTime(),
      });
    }

    return days;
  };

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const response = await assignmentApi.getAssignmentsCalendar({
        year,
        month,
        workerId: filterWorkerId,
        productionLineId: filterProductionLineId,
      });
      setCalendarData(response.calendar);

      const uniqueWorkers = new Map<number, { id: number; name: string }>();
      const uniqueLines = new Map<number, { id: number; name: string }>();

      Object.values(response.calendar)
        .flat()
        .forEach((assignment) => {
          uniqueWorkers.set(assignment.worker.id, assignment.worker);
          uniqueLines.set(assignment.productionLine.id, assignment.productionLine);
        });

      setWorkers(Array.from(uniqueWorkers.values()));
      setProductionLines(Array.from(uniqueLines.values()));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCalendarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, filterWorkerId, filterProductionLineId]);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") newDate.setMonth(newDate.getMonth() - 1);
    else newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const calendarDays = generateCalendarDays();
  const selectedDayAssignments = selectedDay
    ? calendarData[selectedDay.toISOString().split("T")[0]] || []
    : [];

  return {
    // state
    currentDate,
    calendarData,
    selectedDay,
    loading,
    filterWorkerId,
    filterProductionLineId,
    workers,
    productionLines,
    year,
    month,
    // derived
    calendarDays,
    selectedDayAssignments,
    // actions
    setSelectedDay,
    setFilterWorkerId,
    setFilterProductionLineId,
    navigateMonth,
    goToToday,
  };
}


