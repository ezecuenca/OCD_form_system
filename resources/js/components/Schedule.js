import React, { useState } from 'react';
import TasksModal from './TasksModal';
import { set } from 'lodash';

function Schedule() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [modalMode, setModalMode] = useState('add'); // 'add' | 'view' | 'edit' | 'swap'
    const [taskToSwap, setTaskToSwap] = useState(null);

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

        setTasks(prevTasks => {
            let newTasks = [...prevTasks];

            if (existingTaskOnTarget) {
                newTasks = newTasks.map(t => {
                    if (t === taskToSwap) {
                        return { ...t, date: targetDateStr };
                    }
                    if (t === existingTaskOnTarget) {
                        return { ...t, date: taskToSwap.date };
                    }
                    return t;
                });
            } else {
                newTasks = newTasks.map(t =>
                    t === taskToSwap ? { ...t, date: targetDateStr } : t
                );
            }

            return newTasks;
        });

        // Reset and close
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

    console.log('Current modalMode:', modalMode);

    return (
        <div className="schedule">
            {modalMode === 'swap' && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#fff8e1',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    {console.log('Banner is rendering now')}
                    <p style={{ margin: 0, fontWeight: 500 }}>
                        Click a day to swap/move the task - Current: {formatDate(taskToSwap.date)}
                    </p>
                    <button
                        onClick={() => {
                            setModalMode('add');
                        }}
                        style={{
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
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
                                                style={{ cursor: 'pointer' }}
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
                        <button className="schedule__btn schedule__btn--secondary">Swapping Form</button>
                        <button className="schedule__btn schedule__btn--tertiary" onClick={() => window.location.href = '/swap-form'}>Swapping Form Requests</button>
                    </div>
                </div>
            </div>

            <TasksModal
                isOpen={showTaskForm}
                onClose={() => {
                    setShowTaskForm(false);
                    setSelectedTask(null);
                    if (!isSwapClose) {
                        setModalMode('add');
                    }
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
                    console.log('Swap mode triggered');
                    setModalMode('swap')
                }}
            />
        </div>
    );
}

export default Schedule;