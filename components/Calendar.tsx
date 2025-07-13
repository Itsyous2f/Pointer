"use client";
import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Edit, Trash2, ChevronLeft, ChevronRight, X, Clock, Calendar as CalendarDate, RefreshCw, ExternalLink, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  color: string;
  googleEventId?: string;
  isGoogleEvent?: boolean;
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  colorId?: string;
}

const colorOptions = [
  { name: "Blue", value: "bg-blue-500", googleColorId: "1" },
  { name: "Green", value: "bg-green-500", googleColorId: "2" },
  { name: "Red", value: "bg-red-500", googleColorId: "3" },
  { name: "Yellow", value: "bg-yellow-500", googleColorId: "4" },
  { name: "Purple", value: "bg-purple-500", googleColorId: "5" },
  { name: "Pink", value: "bg-pink-500", googleColorId: "6" },
];

const googleColorMap: { [key: string]: string } = {
  "1": "bg-blue-500",
  "2": "bg-green-500", 
  "3": "bg-red-500",
  "4": "bg-yellow-500",
  "5": "bg-purple-500",
  "6": "bg-pink-500",
  "7": "bg-orange-500",
  "8": "bg-teal-500",
  "9": "bg-indigo-500",
  "10": "bg-gray-500",
  "11": "bg-blue-600",
  "12": "bg-green-600",
  "13": "bg-red-600",
  "14": "bg-yellow-600",
  "15": "bg-purple-600",
  "16": "bg-pink-600",
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: "",
    description: "",
    date: "",
    time: "",
    color: "bg-blue-500"
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [autoSyncNotificationShown, setAutoSyncNotificationShown] = useState(false);

  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    const savedSyncStatus = localStorage.getItem('google-calendar-sync');
    const savedLastSync = localStorage.getItem('google-calendar-last-sync');
    
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
    if (savedSyncStatus) {
      setIsGoogleConnected(JSON.parse(savedSyncStatus));
    }
    if (savedLastSync) {
      setLastSyncTime(savedLastSync);
    }

    // Check Google Calendar connection status and auto-sync
    const checkConnectionAndSync = async () => {
      setIsAutoSyncing(true);
      try {
        const response = await fetch('/api/google-calendar/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ events: savedEvents ? JSON.parse(savedEvents) : [] }),
        });

        const data = await response.json();
        
        if (data.success) {
          setIsGoogleConnected(true);
          localStorage.setItem('google-calendar-sync', 'true');
          setEvents(data.events);
          setLastSyncTime(new Date().toISOString());
          localStorage.setItem('google-calendar-last-sync', new Date().toISOString());
          console.log('Auto-synced with Google Calendar');
          
          // Show notification occasionally to inform users about auto-sync
          if (!autoSyncNotificationShown) {
            toast.success('Calendar auto-synced with Google Calendar', {
              duration: 3000,
            });
            setAutoSyncNotificationShown(true);
            // Reset notification flag after 1 hour
            setTimeout(() => {
              setAutoSyncNotificationShown(false);
            }, 60 * 60 * 1000);
          }
        } else if (data.error && data.error.includes('No access token')) {
          setIsGoogleConnected(false);
          localStorage.setItem('google-calendar-sync', 'false');
        }
      } catch (error) {
        console.error('Auto-sync failed:', error);
        setIsGoogleConnected(false);
        localStorage.setItem('google-calendar-sync', 'false');
      } finally {
        setIsAutoSyncing(false);
      }
    };

    // Auto-sync on mount if connected
    if (savedSyncStatus && JSON.parse(savedSyncStatus)) {
      checkConnectionAndSync();
    }

    // Check if we should show OAuth success/error messages
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'connected') {
      setIsGoogleConnected(true);
      localStorage.setItem('google-calendar-sync', 'true');
      toast.success('Successfully connected to Google Calendar!');
      // Automatically sync after successful connection
      setTimeout(() => {
        checkConnectionAndSync();
      }, 1000);
    } else if (error) {
      toast.error(`Failed to connect to Google Calendar: ${error}`);
    }

    // Set up periodic sync every 5 minutes
    const syncInterval = setInterval(() => {
      if (isGoogleConnected) {
        checkConnectionAndSync();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(syncInterval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
    localStorage.setItem('google-calendar-sync', JSON.stringify(isGoogleConnected));
    if (lastSyncTime) {
      localStorage.setItem('google-calendar-last-sync', lastSyncTime);
    }
  }, [events, isGoogleConnected, lastSyncTime]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return events.filter(event => event.date === dateStr);
  };

  const getUpcomingEvents = () => {
    const today = formatDate(new Date());
    return events
      .filter(event => event.date >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      toast.error("Please fill in the title and date");
      return;
    }

    const event: Event = {
      ...newEvent,
      id: Date.now().toString()
    };

    setEvents([...events, event]);
    setNewEvent({
      title: "",
      description: "",
      date: "",
      time: "",
      color: "bg-blue-500"
    });
    setIsAddDialogOpen(false);
    toast.success("Event added successfully");
  };

  const handleEditEvent = () => {
    if (!editingEvent || !editingEvent.title || !editingEvent.date) {
      toast.error("Please fill in the title and date");
      return;
    }

    setEvents(events.map(event => 
      event.id === editingEvent.id ? editingEvent : event
    ));
    setEditingEvent(null);
    setIsEditDialogOpen(false);
    toast.success("Event updated successfully");
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
    setSelectedEvent(null);
    toast.success("Event deleted successfully");
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent({ ...event });
    setIsEditDialogOpen(true);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Google Calendar Sync Functions
  const connectGoogleCalendar = async () => {
    try {
      const response = await fetch('/api/google-calendar/auth');
      const data = await response.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error("Failed to get Google Calendar auth URL");
      }
    } catch (error) {
      toast.error("Failed to connect to Google Calendar");
    }
  };

  const syncWithGoogleCalendar = async () => {
    if (!isGoogleConnected) {
      // Check if we have tokens in cookies (might be connected but state not updated)
      try {
        const response = await fetch('/api/google-calendar/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ events }),
        });

        const data = await response.json();
        
        if (data.success) {
          setEvents(data.events);
          setLastSyncTime(new Date().toISOString());
          setIsGoogleConnected(true);
          localStorage.setItem('google-calendar-sync', 'true');
          toast.success("Calendar synced successfully");
        } else if (data.error && data.error.includes('No access token')) {
          toast.error("Please connect to Google Calendar first");
        } else {
          toast.error(data.error || "Failed to sync calendar");
        }
      } catch (error) {
        toast.error("Failed to sync with Google Calendar");
      }
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch('/api/google-calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });

      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events);
        setLastSyncTime(new Date().toISOString());
        toast.success("Calendar synced successfully");
      } else {
        toast.error(data.error || "Failed to sync calendar");
      }
    } catch (error) {
      toast.error("Failed to sync with Google Calendar");
    } finally {
      setIsSyncing(false);
    }
  };

  const disconnectGoogleCalendar = async () => {
    try {
      // Clear cookies by setting them to expire
      document.cookie = 'google_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'google_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } catch (error) {
      console.error('Failed to clear cookies:', error);
    }
    
    setIsGoogleConnected(false);
    setLastSyncTime("");
    localStorage.removeItem('google-calendar-sync');
    localStorage.removeItem('google-calendar-last-sync');
    toast.success("Disconnected from Google Calendar");
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = getDaysInMonth(currentDate);
  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="h-full flex bg-background">
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Calendar</h1>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Event title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Event description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Time</label>
                      <Input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex gap-2 mt-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setNewEvent({ ...newEvent, color: color.value })}
                          className={`w-6 h-6 rounded-full ${color.value} ${
                            newEvent.color === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                          }`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleAddEvent} className="w-full">
                    Add Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              const isToday = day ? formatDate(day) === formatDate(new Date()) : false;
              const isSelected = day ? formatDate(day) === selectedDate : false;
              
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border rounded-lg ${
                    isToday ? 'bg-primary/10 border-primary' : 'bg-card'
                  } ${isSelected ? 'ring-2 ring-primary' : ''} ${
                    day ? 'cursor-pointer hover:bg-muted/50' : ''
                  }`}
                  onClick={() => day && setSelectedDate(formatDate(day))}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-2 ${
                        isToday ? 'text-primary' : ''
                      }`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded truncate ${event.color} text-white cursor-pointer ${
                              event.isGoogleEvent ? 'ring-1 ring-white/50' : ''
                            }`}
                            title={`${event.title}${event.isGoogleEvent ? ' (Google Calendar)' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                            }}
                          >
                            {event.title}
                            {event.isGoogleEvent && <ExternalLink className="w-2 h-2 ml-1 inline" />}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className={`w-80 bg-card border-l transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Events</h2>
              {isGoogleConnected && (
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isAutoSyncing ? 'bg-blue-500 animate-spin' : 'bg-green-500 animate-pulse'}`} title={isAutoSyncing ? "Auto-syncing..." : "Google Calendar connected"}></div>
                  <span className="text-xs text-muted-foreground">{isAutoSyncing ? 'Syncing...' : 'Auto-sync'}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Google Calendar Sync</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {!isGoogleConnected ? (
                      <div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Connect your Google Calendar to sync events between your local calendar and Google Calendar.
                        </p>
                        <Button onClick={connectGoogleCalendar} className="w-full">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Connect Google Calendar
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Status:</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Connected
                          </Badge>
                        </div>
                        {lastSyncTime && (
                          <div className="text-sm text-muted-foreground">
                            Last synced: {new Date(lastSyncTime).toLocaleString()}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          Auto-sync is enabled. Your calendar will sync automatically every 5 minutes and when you visit this page.
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={syncWithGoogleCalendar} 
                            disabled={isSyncing}
                            className="flex-1"
                          >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing...' : 'Sync Now'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={disconnectGoogleCalendar}
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Quick Add Event */}
          <div>
            <h3 className="text-sm font-medium mb-3">Quick Add Event</h3>
            <div className="space-y-3">
              <Input
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
              <Input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
              <Input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              />
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewEvent({ ...newEvent, color: color.value })}
                    className={`w-6 h-6 rounded-full ${color.value} ${
                      newEvent.color === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
              <Button 
                onClick={handleAddEvent} 
                className="w-full"
                disabled={!newEvent.title || !newEvent.date}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <div>
              <h3 className="text-sm font-medium mb-3">
                {formatDateForDisplay(selectedDate)}
              </h3>
              <div className="space-y-2">
                {getEventsForDate(new Date(selectedDate)).map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${
                      selectedEvent?.id === event.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3 h-3 rounded-full ${event.color}`} />
                          <span className="font-medium text-sm">{event.title}</span>
                          {event.isGoogleEvent && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                        </div>
                        {event.time && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </div>
                        )}
                        {event.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(event);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {getEventsForDate(new Date(selectedDate)).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No events on this date
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          <div>
            <h3 className="text-sm font-medium mb-3">Upcoming Events</h3>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${
                    selectedEvent?.id === event.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3 h-3 rounded-full ${event.color}`} />
                        <span className="font-medium text-sm">{event.title}</span>
                        {event.isGoogleEvent && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDate className="w-3 h-3" />
                        {formatDateForDisplay(event.date)}
                        {event.time && (
                          <>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(event);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming events
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      {!sidebarOpen && (
        <Button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 right-4 lg:hidden z-50"
          size="sm"
        >
          <CalendarIcon className="w-4 h-4" />
        </Button>
      )}

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder="Event title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  placeholder="Event description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <Input
                    type="time"
                    value={editingEvent.time}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setEditingEvent({ ...editingEvent, color: color.value })}
                      className={`w-6 h-6 rounded-full ${color.value} ${
                        editingEvent.color === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEditEvent} className="flex-1">
                  Update Event
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteEvent(editingEvent.id);
                    setIsEditDialogOpen(false);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 