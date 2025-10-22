import { useState, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { assignmentApi, Assignment } from "@/services/assignment.api";
import { useTranslation } from "react-i18next";

interface CalendarDay {
  date: Date;
  assignments: Assignment[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

export default function AssignmentCalendar() {
  const { t } = useTranslation(['assignment']);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<
    Record<string, Assignment[]>
  >({});

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterWorkerId, setFilterWorkerId] = useState<number | undefined>();
  const [filterProductionLineId, setFilterProductionLineId] = useState<
    number | undefined
  >();

  const [workers, setWorkers] = useState<{ id: number; name: string }[]>([]);
  const [productionLines, setProductionLines] = useState<
    { id: number; name: string }[]
  >([]);

  const MONTHS = [
  t('calendar.months.january'), t('calendar.months.february'), t('calendar.months.march'), t('calendar.months.april'),
  t('calendar.months.may'), t('calendar.months.june'), t('calendar.months.july'), t('calendar.months.august'),
  t('calendar.months.september'), t('calendar.months.october'), t('calendar.months.november'), t('calendar.months.december')
];

  const SHIFTS = ["morning", "afternoon", "night"];

  const SHIFT_COLORS = {
  morning:
    "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800",
  afternoon:
    "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800",
  night:
    "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800",
};

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // Generate calendar days
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

  // Fetch calendar data
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

      // Extract unique workers and production lines for filters
      const uniqueWorkers = new Map();
      const uniqueLines = new Map();

      Object.values(response.calendar)
        .flat()
        .forEach((assignment) => {
          uniqueWorkers.set(assignment.worker.id, assignment.worker);
          uniqueLines.set(
            assignment.productionLine.id,
            assignment.productionLine
          );
        });

      setWorkers(Array.from(uniqueWorkers.values()));
      setProductionLines(Array.from(uniqueLines.values()));
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCalendarData();
  }, [year, month, filterWorkerId, filterProductionLineId]);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const calendarDays = generateCalendarDays();
  const selectedDayAssignments = selectedDay
    ? calendarData[selectedDay.toISOString().split("T")[0]] || []
    : [];

  const formatShift = (shift: string) => {
    return t(`calendar.shifts.${shift}`);
  };

  const getShiftColor = (shift: string) => {
    return (
      SHIFT_COLORS[shift as keyof typeof SHIFT_COLORS] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

return (
  <div className="p-4 md:p-6 space-y-4 md:space-y-6">
    {/* Header */}
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary flex-shrink-0" />
           <h2 className="text-xl md:text-2xl font-bold truncate">
            {t('calendar.header.title')}
          </h2>
          </div>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {t('calendar.header.subtitle')}
          </p>
        </div>
      </div>

      {/* Filters - Stacked on mobile */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
        <Select
          value={filterWorkerId?.toString() ?? "all"}
          onValueChange={(value) =>
            setFilterWorkerId(value === "all" ? undefined : parseInt(value))
          }
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t('calendar.filters.allWorkers')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('calendar.filters.allWorkers')}</SelectItem>
            {workers.map((worker) => (
              <SelectItem key={worker.id} value={worker.id.toString()}>
                {worker.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterProductionLineId?.toString() ?? "all"}
          onValueChange={(value) =>
            setFilterProductionLineId(
              value === "all" ? undefined : parseInt(value)
            )
          }
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder={t('calendar.filters.allProductionLines')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('calendar.filters.allProductionLines')}</SelectItem>
            {productionLines.map((line) => (
              <SelectItem key={line.id} value={line.id.toString()}>
                {line.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <Tabs defaultValue="calendar" className="space-y-4">
      <TabsContent value="calendar" className="space-y-4">
        {/* Calendar Navigation */}
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex items-center justify-center sm:justify-start gap-2 md:gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="flex-shrink-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg md:text-xl font-semibold text-center sm:text-left min-w-0">
                  {MONTHS[month - 1]} {year}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="flex-shrink-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={goToToday} className="w-full sm:w-auto">
              {t('calendar.navigation.today')}
            </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-md h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-0.5 md:gap-1">
                {/* Day headers */}
               {[
                  t('calendar.dayHeaders.sun'), t('calendar.dayHeaders.mon'), t('calendar.dayHeaders.tue'), 
                  t('calendar.dayHeaders.wed'), t('calendar.dayHeaders.thu'), t('calendar.dayHeaders.fri'), t('calendar.dayHeaders.sat')
                ].map((day, index) => (
                  <div key={index} className="p-1 md:p-2 text-center text-xs md:text-sm font-medium text-gray-500">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div
                        className={`
                          min-h-16 sm:min-h-20 md:min-h-24 p-0.5 md:p-1 border rounded cursor-pointer transition-colors
                          ${
                            day.isCurrentMonth
                              ? "bg-card hover:bg-accent/50 border-border"
                              : "bg-muted/30 text-muted-foreground border-border/50"
                          }
                          ${
                            day.isToday
                              ? "ring-1 md:ring-2 ring-primary ring-inset"
                              : ""
                          }
                        `}
                        onClick={() => setSelectedDay(day.date)}
                      >
                        <div className="flex justify-between items-start mb-0.5 md:mb-1">
                          <span
                            className={`text-xs md:text-sm font-medium ${
                              day.isToday ? "text-primary" : ""
                            }`}
                          >
                            {day.date.getDate()}
                          </span>
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                          {day.assignments
                            .slice(0, window.innerWidth < 640 ? 1 : 2)
                            .map((assignment, idx) => (
                              <div
                                key={idx}
                                className={`text-xs px-0.5 md:px-1 py-0.5 rounded border ${getShiftColor(
                                  assignment.shift
                                )}`}
                              >
                                <div className="truncate text-xs">
                                  <span className="hidden sm:inline">
                                    {assignment.worker.name}
                                  </span>
                                  <span className="sm:hidden">
                                    {assignment.worker.name.split(' ')[0]}
                                  </span>
                                </div>
                              </div>
                            ))}
                          {day.assignments.length > (window.innerWidth < 640 ? 1 : 2) && (
                            <div className="text-xs text-muted-foreground px-0.5 md:px-1">
                            {t('calendar.calendarMore.more', { count: day.assignments.length - (window.innerWidth < 640 ? 1 : 2) })}
                          </div>
                          )}
                        </div>
                      </div>
                    </DialogTrigger>

                    <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto mx-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-start gap-2 text-left">
                          <Calendar className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <span className="min-w-0">
                            {t('calendar.dialog.assignmentsFor')}{" "}
                            <span className="block sm:inline">
                              {day.date.toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </span>
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 mt-4">
                        {selectedDayAssignments.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">
                            {t('calendar.dialog.noAssignments')}
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {SHIFTS.map((shift) => {
                              const shiftAssignments =
                                selectedDayAssignments.filter(
                                  (a) => a.shift === shift
                                );
                              if (shiftAssignments.length === 0) return null;

                              return (
                                <div key={shift} className="space-y-2">
                                  <h4 className="font-medium text-sm text-gray-600 flex items-center gap-2">
                                    <Clock className="h-4 w-4 flex-shrink-0" />
                                    <span>
                                      {formatShift(shift)} {t('calendar.dialog.shift')} ({shiftAssignments.length})
                                    </span>
                                  </h4>
                                  <div className="grid gap-2">
                                    {shiftAssignments.map((assignment) => (
                                      <Card
                                        key={assignment.id}
                                        className="p-3"
                                      >
                                        <div className="space-y-2">
                                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                              <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                              <span className="font-medium truncate">
                                                {assignment.worker.name}
                                              </span>
                                            </div>
                                            <Badge
                                              variant="outline"
                                              className={`${getShiftColor(
                                                assignment.shift
                                              )} flex-shrink-0`}
                                            >
                                              {formatShift(assignment.shift)}
                                            </Badge>
                                          </div>
                                          
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2 min-w-0">
                                              <MapPin className="h-3 w-3 flex-shrink-0" />
                                              <span className="truncate">
                                                {assignment.productionLine.name}
                                              </span>
                                            </div>
                                            <span className="hidden sm:inline">•</span>
                                            <span className="pl-5 sm:pl-0">
                                              {assignment.position}
                                            </span>
                                          </div>
                                          
                                          {assignment.productionLine.location && (
                                            <div className="text-xs text-gray-500 pl-5 sm:pl-0">
                                          {t('calendar.dialog.location')}: {assignment.productionLine.location}
                                        </div>
                                          )}
                                        </div>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);
}
