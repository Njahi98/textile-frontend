import  { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, AlertTriangle, Clock, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { assignmentApi, Assignment, AssignmentConflict } from '@/services/assignment.api';

interface CalendarDay {
  date: Date;
  assignments: Assignment[];
  isCurrentMonth: boolean;
  isToday: boolean;
  hasConflicts: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHIFTS = ['morning', 'afternoon', 'night'];

const SHIFT_COLORS = {
  morning: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
  afternoon: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
  night: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800'
};

export default function AssignmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, Assignment[]>>({});
  const [conflicts, setConflicts] = useState<AssignmentConflict[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [conflictsLoading, setConflictsLoading] = useState(false);
  const [filterWorkerId, setFilterWorkerId] = useState<number | undefined>();
  const [filterProductionLineId, setFilterProductionLineId] = useState<number | undefined>();
  const [workers, setWorkers] = useState<{id: number, name: string}[]>([]);
  const [productionLines, setProductionLines] = useState<{id: number, name: string}[]>([]);

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
      
      const dateKey = date.toISOString().split('T')[0];
      const assignments = calendarData[dateKey] || [];
      const hasConflicts = conflicts.some(conflict => 
        conflict.date === dateKey
      );

      days.push({
        date: new Date(date),
        assignments,
        isCurrentMonth: date.getMonth() === month - 1,
        isToday: date.getTime() === today.getTime(),
        hasConflicts
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
        productionLineId: filterProductionLineId
      });
      setCalendarData(response.calendar);
      
      // Extract unique workers and production lines for filters
      const uniqueWorkers = new Map();
      const uniqueLines = new Map();
      
      Object.values(response.calendar).flat().forEach(assignment => {
        uniqueWorkers.set(assignment.worker.id, assignment.worker);
        uniqueLines.set(assignment.productionLine.id, assignment.productionLine);
      });
      
      setWorkers(Array.from(uniqueWorkers.values()));
      setProductionLines(Array.from(uniqueLines.values()));
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch conflicts
  const fetchConflicts = async () => {
    setConflictsLoading(true);
    try {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      const response = await assignmentApi.getAssignmentConflicts({
        startDate,
        endDate
      });
      setConflicts(response.conflicts);
    } catch (error) {
      console.error('Failed to fetch conflicts:', error);
    } finally {
      setConflictsLoading(false);
    }
  };

  useEffect(() => {
    void fetchCalendarData();
    void fetchConflicts();
  }, [year, month, filterWorkerId, filterProductionLineId]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
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
  const selectedDayAssignments = selectedDay ? calendarData[selectedDay.toISOString().split('T')[0]] || [] : [];

  const formatShift = (shift: string) => {
    return shift.charAt(0).toUpperCase() + shift.slice(1);
  };

  const getShiftColor = (shift: string) => {
    return SHIFT_COLORS[shift as keyof typeof SHIFT_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Assignment Calendar</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filterWorkerId?.toString() ?? 'all'} onValueChange={(value) => setFilterWorkerId(value === 'all' ? undefined : parseInt(value))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Workers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workers</SelectItem>
              {workers.map(worker => (
                <SelectItem key={worker.id} value={worker.id.toString()}>
                  {worker.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterProductionLineId?.toString() ?? 'all'} onValueChange={(value) => setFilterProductionLineId(value === 'all' ? undefined : parseInt(value))}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Production Lines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Production Lines</SelectItem>
              {productionLines.map(line => (
                <SelectItem key={line.id} value={line.id.toString()}>
                  {line.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertTitle className="text-destructive">Assignment Conflicts Detected</AlertTitle>
          <AlertDescription className="text-destructive/90">
            {conflicts.length} worker{conflicts.length > 1 ? 's are' : ' is'} double-booked this month. 
            <Button variant="link" className="p-0 h-auto text-destructive underline ml-1">
              View details in the Conflicts tab
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="conflicts">
            Conflicts ({conflicts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          {/* Calendar Navigation */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">
                    {MONTHS[month - 1]} {year}
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {calendarDays.map((day, index) => (
                    <Dialog key={index}>
                      <DialogTrigger asChild>
                        <div
                          className={`
                            min-h-24 p-1 border rounded cursor-pointer transition-colors
                            ${day.isCurrentMonth 
                              ? 'bg-card hover:bg-accent/50 border-border' 
                              : 'bg-muted/30 text-muted-foreground border-border/50'
                            }
                            ${day.isToday ? 'ring-2 ring-primary ring-inset' : ''}
                            ${day.hasConflicts ? 'border-destructive/50 bg-destructive/10' : ''}
                          `}
                          onClick={() => setSelectedDay(day.date)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-sm font-medium ${day.isToday ? 'text-primary' : ''}`}>
                              {day.date.getDate()}
                            </span>
                            {day.hasConflicts && (
                              <AlertTriangle className="h-3 w-3 text-destructive" />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            {day.assignments.slice(0, 2).map((assignment, idx) => (
                              <div
                                key={idx}
                                className={`text-xs px-1 py-0.5 rounded border ${getShiftColor(assignment.shift)}`}
                              >
                                <div className="truncate">{assignment.worker.name}</div>
                              </div>
                            ))}
                            {day.assignments.length > 2 && (
                              <div className="text-xs text-muted-foreground px-1">
                                +{day.assignments.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Assignments for {day.date.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {selectedDayAssignments.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No assignments for this day</p>
                          ) : (
                            <div className="space-y-3">
                              {SHIFTS.map(shift => {
                                const shiftAssignments = selectedDayAssignments.filter(a => a.shift === shift);
                                if (shiftAssignments.length === 0) return null;
                                
                                return (
                                  <div key={shift}>
                                    <h4 className="font-medium text-sm text-gray-600 mb-2 flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      {formatShift(shift)} Shift ({shiftAssignments.length})
                                    </h4>
                                    <div className="grid gap-2">
                                      {shiftAssignments.map(assignment => (
                                        <Card key={assignment.id} className="p-3">
                                          <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                              <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-500" />
                                                <span className="font-medium">{assignment.worker.name}</span>
                                                <Badge variant="outline" className={getShiftColor(assignment.shift)}>
                                                  {formatShift(assignment.shift)}
                                                </Badge>
                                              </div>
                                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin className="h-3 w-3" />
                                                <span>{assignment.productionLine.name}</span>
                                                <span>•</span>
                                                <span>{assignment.position}</span>
                                              </div>
                                              {assignment.productionLine.location && (
                                                <div className="text-xs text-gray-500">
                                                  Location: {assignment.productionLine.location}
                                                </div>
                                              )}
                                            </div>
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

        <TabsContent value="conflicts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Assignment Conflicts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {conflictsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
              ) : conflicts.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-green-800 mb-2">No Conflicts Found</h3>
                  <p className="text-green-600">All workers have unique assignments for the selected period.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conflicts.map((conflict, index) => (
                    <Alert key={index} className="border-destructive/50 bg-destructive/10">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <div className="space-y-2">
                        <AlertTitle className="text-destructive">
                          {conflict.worker.name} - Double Booking Detected
                        </AlertTitle>
                        <AlertDescription className="text-destructive/90">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <strong>Date:</strong> {new Date(conflict.date).toLocaleDateString()}
                              <strong>Shift:</strong> {formatShift(conflict.shift)}
                            </div>
                            <div className="mt-2">
                              <strong>Conflicting Assignments:</strong>
                              <div className="mt-1 space-y-1">
                                {conflict.assignments.map((assignment, idx) => (
                                  <div key={idx} className="ml-4 p-2 bg-card rounded border border-destructive/20">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium">{assignment.productionLineName}</span>
                                      <Badge variant="outline">{assignment.position}</Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </AlertDescription>
                      </div>
                    </Alert>
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