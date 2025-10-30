import { useTranslation } from "react-i18next";
import CalendarHeader from "./components/CalendarHeader";
import CalendarFilters from "./components/CalendarFilters";
import CalendarView from "./components/CalendarView";
import { useAssignmentCalendar } from "./hooks/useAssignmentCalendar";

export default function AssignmentCalendar() {
  useTranslation(['assignment']);
  const {
    calendarDays,
    selectedDay,
    selectedDayAssignments,
    loading,
    filterWorkerId,
    filterProductionLineId,
    workers,
    productionLines,
    setSelectedDay,
    setFilterWorkerId,
    setFilterProductionLineId,
    navigateMonth,
    goToToday,
    year,
    month,
  } = useAssignmentCalendar();

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <CalendarHeader />
      <CalendarFilters
        workers={workers}
        productionLines={productionLines}
        filterWorkerId={filterWorkerId}
        filterProductionLineId={filterProductionLineId}
        setFilterWorkerId={setFilterWorkerId}
        setFilterProductionLineId={setFilterProductionLineId}
      />
      <CalendarView
        year={year}
        month={month}
        loading={loading}
        calendarDays={calendarDays}
        selectedDay={selectedDay}
        selectedDayAssignments={selectedDayAssignments}
        setSelectedDay={setSelectedDay}
        navigateMonth={navigateMonth}
        goToToday={goToToday}
      />
    </div>
  );
}
