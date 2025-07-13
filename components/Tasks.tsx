"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle,
  Filter,
  Search
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  notes?: string;
}

type FilterType = 'all' | 'active' | 'completed';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      completed: false,
      priority: 'medium',
      createdAt: new Date().toISOString(),
    };
    
    setTasks([...tasks, task]);
    setNewTask("");
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const updateTaskPriority = (taskId: string, priority: Task['priority']) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, priority }
        : task
    ));
  };

  const updateTaskDueDate = (taskId: string, dueDate: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, dueDate }
        : task
    ));
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityLabel = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Medium';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'active' && !task.completed) || 
      (filter === 'completed' && task.completed);
    
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const activeCount = tasks.filter(task => !task.completed).length;

  return (
    <div className="h-full flex flex-col p-6 gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Tasks</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{activeCount} active</span>
          <span>•</span>
          <span>{completedCount} completed</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6">
        {/* Task Input and Filters */}
        <div className="flex flex-col gap-4">
          {/* Add Task */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
            <div className="flex gap-2">
              <Input
                placeholder="What needs to be done?"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
              <Button onClick={addTask} disabled={!newTask.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Filters */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('active')}
                  >
                    Active
                  </Button>
                  <Button
                    variant={filter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('completed')}
                  >
                    Completed
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-completed"
                  checked={showCompleted}
                  onCheckedChange={(checked) => setShowCompleted(checked as boolean)}
                />
                <label htmlFor="show-completed" className="text-sm">
                  Show completed tasks
                </label>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={clearCompleted}
                disabled={completedCount === 0}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Completed
              </Button>
            </div>
          </Card>
        </div>

        {/* Task List */}
        <div className="col-span-2">
          <Card className="p-4 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4">
              {filter === 'all' ? 'All Tasks' : filter === 'active' ? 'Active Tasks' : 'Completed Tasks'}
              <span className="text-sm text-muted-foreground ml-2">
                ({filteredTasks.length})
              </span>
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredTasks.length === 0 ? (
                <div className="text-center text-muted-foreground mt-8">
                  {searchQuery ? 'No tasks match your search.' : 'No tasks yet. Add one above!'}
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 border rounded-lg transition-all ${
                      task.completed 
                        ? 'bg-muted/50 border-muted' 
                        : 'bg-background border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium truncate ${
                            task.completed ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {task.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full bg-muted ${getPriorityColor(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <select
                          value={task.priority}
                          onChange={(e) => updateTaskPriority(task.id, e.target.value as Task['priority'])}
                          className="text-xs border rounded px-1 py-0.5 bg-background"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 