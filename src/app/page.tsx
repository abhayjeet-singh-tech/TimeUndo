'use client'; // ✅ This tells Next.js this component runs in the browser (client-side)

import { useState } from 'react';
import { Clock, Plus, Trash2, Calendar, Loader2 } from 'lucide-react';

// -------------------------------
// Types (define structure of data)
// -------------------------------
interface Task {
  id: number;
  name: string;
  estimatedHours: number;
}

interface ScheduleBlock {
  time: string;
  activity: string;
  duration: string;
  type: 'task' | 'break';
}

export default function HomePage() {
  // -------------------------------
  // State Variables (reactive data)
  // -------------------------------
  const [tasks, setTasks] = useState<Task[]>([]); // User’s task list
  const [hoursLeft, setHoursLeft] = useState<number>(8); // Available hours today
  const [newTaskName, setNewTaskName] = useState<string>(''); // Input for new task name
  const [newTaskHours, setNewTaskHours] = useState<number>(1); // Input for new task hours
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]); // AI-generated schedule
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading spinner state

  // -------------------------------
  // Functions
  // -------------------------------

  // Add a new task
  const addTask = () => {
    if (newTaskName.trim() === '') return; // prevent empty tasks
    
    const newTask: Task = {
      id: Date.now(), // unique id
      name: newTaskName,
      estimatedHours: newTaskHours,
    };

    setTasks([...tasks, newTask]); // update tasks
    setNewTaskName(''); // reset input
    setNewTaskHours(1); // reset hours
  };

  // Remove a task by ID
  const removeTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // Call API to generate AI schedule
  const generateSchedule = async () => {
    if (tasks.length === 0) {
      alert('⚠️ Please add some tasks first!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, hoursLeft }),
      });

      if (!response.ok) throw new Error('Failed to generate schedule');

      const data = await response.json();
      setSchedule(data.schedule);
    } catch (error) {
      console.error('❌ Error generating schedule:', error);
      alert('Failed to generate schedule. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* ---------- HEADER ---------- */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TimeUndo</h1>
            <p className="text-sm text-gray-600">AI-powered daily scheduler</p>
          </div>
        </div>
      </header>

      {/* ---------- MAIN CONTENT ---------- */}
      <main className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT SIDE → Input & Tasks */}
        <div className="space-y-6">
          
          {/* Hours Available */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hours Available Today</h2>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="1"
                max="16"
                value={hoursLeft}
                onChange={(e) => setHoursLeft(Number(e.target.value))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="text-gray-600">hours</span>
            </div>
          </div>

          {/* Add Task */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Tasks</h2>
            <div className="space-y-4">
              
              {/* Task Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
                <input
                  type="text"
                  placeholder="e.g., Review presentation slides"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Task Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
                <input
                  type="number"
                  min="0.5"
                  max="8"
                  step="0.5"
                  value={newTaskHours}
                  onChange={(e) => setNewTaskHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Add Button */}
              <button
                onClick={addTask}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Task List */}
          {tasks.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Your Tasks</h2>
                <span className="text-sm text-gray-500">
                  {tasks.reduce((sum, task) => sum + task.estimatedHours, 0)} hours total
                </span>
              </div>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{task.name}</p>
                      <p className="text-sm text-gray-600">{task.estimatedHours} hours</p>
                    </div>
                    <button
                      onClick={() => removeTask(task.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Generate Button */}
              <button
                onClick={generateSchedule}
                disabled={isLoading}
                className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                <span>{isLoading ? 'Generating...' : 'Generate AI Schedule'}</span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT SIDE → Generated Schedule */}
        <div className="space-y-6">
          {schedule.length > 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your AI-Generated Schedule</h2>
              <div className="space-y-3">
                {schedule.map((block, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      block.type === 'task'
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-green-50 border-green-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{block.activity}</p>
                        <p className="text-sm text-gray-600 mt-1">{block.duration}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-500">{block.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !isLoading && (
              <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedule Yet</h3>
                <p className="text-gray-600">Add some tasks and generate your AI-powered schedule!</p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
