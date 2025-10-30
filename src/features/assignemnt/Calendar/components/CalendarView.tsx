import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import type { CalendarDay } from "../hooks/useAssignmentCalendar";

interface Props {
  year: number;
  month: number;
  loading: boolean;
  calendarDays: CalendarDay[];
  selectedDay: Date | null;
  selectedDayAssignments: any[];
  setSelectedDay: (d: Date | null) => void;
  navigateMonth: (dir: "prev" | "next") => void;
  goToToday: () => void;
}

export default function CalendarView({ year, month, loading, calendarDays, selectedDayAssignments, setSelectedDay, navigateMonth, goToToday }: Props) {
  const { t } = useTranslation(["assignment"]);

  const SHIFTS = ["morning", "afternoon", "night"] as const;
  const SHIFT_COLORS = {
    morning: "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800",
    afternoon: "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800",
    night: "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800",
  } as const;

  const MONTHS = [
    t('calendar.months.january'), t('calendar.months.february'), t('calendar.months.march'), t('calendar.months.april'),
    t('calendar.months.may'), t('calendar.months.june'), t('calendar.months.july'), t('calendar.months.august'),
    t('calendar.months.september'), t('calendar.months.october'), t('calendar.months.november'), t('calendar.months.december')
  ];

  const formatShift = (shift: string) => t(`calendar.shifts.${shift}`);
  const getShiftColor = (shift: string) => SHIFT_COLORS[shift as keyof typeof SHIFT_COLORS] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <Tabs defaultValue="calendar" className="space-y-4">
      <TabsContent value="calendar" className="space-y-4">
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex items-center justify-center sm:justify-start gap-2 md:gap-4">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}
                  className="flex-shrink-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg md:text-xl font-semibold text-center sm:text-left min-w-0">
                  {MONTHS[month - 1]} {year}
                </h2>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} className="flex-shrink-0">
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-0.5 md:gap-1">
                {[ t('calendar.dayHeaders.sun'), t('calendar.dayHeaders.mon'), t('calendar.dayHeaders.tue'), t('calendar.dayHeaders.wed'), t('calendar.dayHeaders.thu'), t('calendar.dayHeaders.fri'), t('calendar.dayHeaders.sat') ].map((day, index) => (
                  <div key={index} className="p-1 md:p-2 text-center text-xs md:text-sm font-medium text-gray-500">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                  </div>
                ))}

                {calendarDays.map((day, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div
                        className={`
                          min-h-16 sm:min-h-20 md:min-h-24 p-0.5 md:p-1 border rounded cursor-pointer transition-colors
                          ${day.isCurrentMonth ? "bg-card hover:bg-accent/50 border-border" : "bg-muted/30 text-muted-foreground border-border/50"}
                          ${day.isToday ? "ring-1 md:ring-2 ring-primary ring-inset" : ""}
                        `}
                        onClick={() => setSelectedDay(day.date)}
                      >
                        <div className="flex justify-between items-start mb-0.5 md:mb-1">
                          <span className={`text-xs md:text-sm font-medium ${day.isToday ? "text-primary" : ""}`}>
                            {day.date.getDate()}
                          </span>
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                          {day.assignments
                            .slice(0, window.innerWidth < 640 ? 1 : 2)
                            .map((assignment, idx) => (
                              <div key={idx} className={`text-xs px-0.5 md:px-1 py-0.5 rounded border ${getShiftColor(assignment.shift)}`}>
                                <div className="truncate text-xs">
                                  <span className="hidden sm:inline">{assignment.worker.name}</span>
                                  <span className="sm:hidden">{assignment.worker.name.split(' ')[0]}</span>
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
                          <CalendarIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <span className="min-w-0">
                            {t('calendar.dialog.assignmentsFor')} {" "}
                            <span className="block sm:inline">
                              {day.date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </span>
                          </span>
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 mt-4">
                        {selectedDayAssignments.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">{t('calendar.dialog.noAssignments')}</p>
                        ) : (
                          <div className="space-y-4">
                            {SHIFTS.map((shift) => {
                              const shiftAssignments = selectedDayAssignments.filter((a) => a.shift === shift);
                              if (shiftAssignments.length === 0) return null;
                              return (
                                <div key={shift} className="space-y-2">
                                  <h4 className="font-medium text-sm text-gray-600 flex items-center gap-2">
                                    <Clock className="h-4 w-4 flex-shrink-0" />
                                    <span>
                                      {t(`calendar.shifts.${shift}`)} {t('calendar.dialog.shift')} ({shiftAssignments.length})
                                    </span>
                                  </h4>
                                  <div className="grid gap-2">
                                    {shiftAssignments.map((assignment: any) => (
                                      <Card key={assignment.id} className="p-3">
                                        <div className="space-y-2">
                                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                              <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                              <span className="font-medium truncate">{assignment.worker.name}</span>
                                            </div>
                                            <Badge variant="outline" className={`${getShiftColor(assignment.shift)} flex-shrink-0`}>
                                              {formatShift(assignment.shift)}
                                            </Badge>
                                          </div>
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2 min-w-0">
                                              <MapPin className="h-3 w-3 flex-shrink-0" />
                                              <span className="truncate">{assignment.productionLine.name}</span>
                                            </div>
                                            <span className="hidden sm:inline">•</span>
                                            <span className="pl-5 sm:pl-0">{assignment.position}</span>
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
  );
}


