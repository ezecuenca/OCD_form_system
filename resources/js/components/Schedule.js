import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import TasksModal from './TasksModal';
import { saveSwapRequest, getSwapRequests } from '../utils/swapRequests';

function Schedule() {

    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem('scheduledTasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    });

    const [user, setUser] = useState(null);

    useEffect(() => {
        localStorage.setItem('scheduledTasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        axios.get('/api/auth/me')
            .then((res) => {
                setUser(res.data);
            })
            .catch(() => {
                setUser(null);
            });
    }, []);

    useEffect(() => {
        const updatePendingCount = () => {
            const requests = getSwapRequests();
            const pendingCount = requests.filter(r => r.status === 'pending').length;
            setPendingSwapCount(pendingCount);
        };
        
        updatePendingCount();
        
        const handleStorage = () => updatePendingCount();
        window.addEventListener('storage', handleStorage);
        
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [modalMode, setModalMode] = useState('add'); // 'add' | 'view' | 'edit' | 'swap'
    const [taskToSwap, setTaskToSwap] = useState(null);
    const [pendingSwapCount, setPendingSwapCount] = useState(0);

    const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getDaysArray = () => {
        const days = [];
        const totalDays = daysInMonth(currentDate);
        const firstDay = firstDayOfMonth(currentDate);

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let i = 1; i <= totalDays; i++) {
            days.push(i);
        }

        // Add empty cells after month ends to complete the final week
        const remaining = (7 - (days.length % 7)) % 7;
        for (let i = 0; i < remaining; i++) {
            days.push(null);
        }

        return days;
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const [y, m, d] = dateStr.split('-');
        return new Date(y, m - 1, d).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleDayClick = (day) => {
        if (!day) return;
        
        if (user?.role_id !== 2 && user?.role_id !== 3) return;

        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
        setShowTaskForm(true);
    };

    const handleAddTask = (taskData) => {
        setTasks([...tasks, taskData]);
        setShowTaskForm(false);
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setTaskToSwap(task);
        setModalMode('view');
        setShowTaskForm(true);
    };

    const handleSwapDayClick = (day) => {
        if (!day || !taskToSwap || modalMode !== 'swap') return;

        const targetDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const existingTaskOnTarget = tasks.find(t => t.date === targetDateStr);

        const swapRequest = {
            id: `swap-${Date.now()}`,
            taskName: taskToSwap.name,
            taskDescription: taskToSwap.task,
            fromDate: taskToSwap.date,
            toDate: targetDateStr,
            targetTaskName: existingTaskOnTarget ? existingTaskOnTarget.name : null,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        saveSwapRequest(swapRequest);

        setShowTaskForm(false);
        setModalMode('add');
        setSelectedTask(null);
        setTaskToSwap(null);
    };

    const getTasksForDate = (day) => {
        if (!day) return [];
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return tasks.filter(task => task.date === dateStr);
    };

    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const days = getDaysArray();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <div className="schedule">
            {modalMode === 'swap' && taskToSwap && (
                <div className="schedule__swap-banner">
                    <p className="schedule__swap-banner-text">
                        Request Swap: Click a day to select target date — Moving &quot;{taskToSwap?.name}&quot; from {formatDate(taskToSwap?.date)}
                    </p>
                    <button
                        className="schedule__swap-cancel"
                        onClick={() => {
                            setModalMode('add');
                            setSelectedTask(null);
                            setTaskToSwap(null);
                            setShowTaskForm(false);
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}

            <div className="schedule__content">
                <div className="schedule__card">
                    <div className="schedule__month-header">
                        <button className="schedule__month-btn" onClick={previousMonth}>
                            ← Previous
                        </button>
                        <h2 className="schedule__month-title">{monthName}</h2>
                        <button className="schedule__month-btn" onClick={nextMonth}>
                            Next →
                        </button>
                    </div>

                    <div className="schedule__weekdays">
                        {dayNames.map((day) => (
                            <div key={day} className="schedule__weekday">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="schedule__grid">
                        {days.map((day, index) => {
                            const dayTasks = getTasksForDate(day);
                            const isToday =
                                day &&
                                currentDate.getFullYear() === new Date().getFullYear() &&
                                currentDate.getMonth() === new Date().getMonth() &&
                                day === new Date().getDate();

                            return (
                                <div
                                    key={index}
                                    className={`schedule__day 
                                        ${day ? 'schedule__day--active' : 'schedule__day--empty'}
                                        ${isToday ? 'schedule__day--today' : ''}`}
                                    onClick={() => {
                                        if (modalMode === 'swap') {
                                            handleSwapDayClick(day);
                                        } else {
                                            handleDayClick(day);
                                        }
                                    }}
                                    role="button"
                                    tabIndex={day ? 0 : -1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            if (modalMode === 'swap') {
                                                handleSwapDayClick(day);
                                            } else {
                                                handleDayClick(day);
                                            }
                                        }
                                    }}
                                >
                                    <div className="schedule__day-number">{day}</div>
                                    <div className="schedule__day-tasks">
                                        {dayTasks.map((task, taskIndex) => (
                                            <div 
                                                key={taskIndex} 
                                                className="schedule__task"
                                                onClick={() => handleTaskClick(task)}
                                                role='button'
                                                tabIndex={0}
                                                >
                                                <div className="schedule__task-name">{task.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="schedule__actions">
                        {(user?.role_id === 2 || user?.role_id === 3) && (
                            <button
                            className="schedule__btn schedule__btn--primary"
                            onClick={() => {
                                const today = new Date();
                                const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                setSelectedDate(dateStr);
                                setShowTaskForm(true);
                            }}
                            >
                            Add Task (Today)
                            </button>
                        )}
                        {(user?.role_id === 2 || user?.role_id === 3) && (
                            <div className="schedule__swap-btn-container">
                                <Link to="/swap-form" className="schedule__btn schedule__btn--tertiary">Swapping Form Requests</Link>
                                {pendingSwapCount > 0 && (
                                    <span className="schedule__notification-badge">{pendingSwapCount}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <TasksModal
                isOpen={showTaskForm}
                onClose={() => {
                    setModalMode('add');
                    setSelectedTask(null);
                    setTaskToSwap(null);
                    setShowTaskForm(false);
                }}
                selectedDate={selectedDate}
                currentMonth={currentDate}
                onAddTask={handleAddTask}
                initialTask={selectedTask}
                mode={modalMode}
                onUpdateTask={(updateTask) => {
                    setTasks(prev => prev.map(t => t === selectedTask ? updateTask : t));
                    setShowTaskForm(false);
                    setSelectedTask(null);
                    setModalMode('add');
                }}
                onSwitchToEdit={() => setModalMode('edit')}
                onSwitchToSwap={() => {
                    setModalMode('swap');
                    setShowTaskForm(false);
                }}
                userRole={user?.role_id}
            />
        </div>
    );
}

export default Schedule;