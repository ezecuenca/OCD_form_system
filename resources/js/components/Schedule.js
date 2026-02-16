import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import TasksModal from './TasksModal';

function Schedule() {

    const [tasks, setTasks] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [currentProfileId, setCurrentProfileId] = useState('');

    const [user, setUser] = useState(null);

    const getFirstName = (fullName) => {
        if (!fullName) return '—';
        return String(fullName).trim().split(/\s+/)[0] || '—';
    };

    const mapScheduleToTask = (item) => ({
        id: item.id,
        profileId: item.profile_id ? String(item.profile_id) : '',
        name: getFirstName(item.profile_name),
        fullName: item.profile_name || '—',
        task: item.task_description || '',
        date: item.task_date,
        status: item.status,
    });

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const [schedulesRes, profilesRes] = await Promise.all([
                    axios.get('/api/schedules'),
                    axios.get('/api/profiles'),
                ]);

                if (!isMounted) return;

                const scheduleItems = Array.isArray(schedulesRes.data) ? schedulesRes.data : [];
                const profileItems = Array.isArray(profilesRes.data) ? profilesRes.data : [];

                setTasks(scheduleItems.map(mapScheduleToTask));
                setProfiles(profileItems.map((profile) => ({
                    id: String(profile.id),
                    full_name: profile.full_name || '—',
                })));
            } catch (error) {
                if (!isMounted) return;
                setTasks([]);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

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
        axios.get('/api/profile')
            .then((res) => {
                const idValue = res.data?.id;
                setCurrentProfileId(idValue ? String(idValue) : '');
            })
            .catch(() => {
                setCurrentProfileId('');
            });
    }, []);

    useEffect(() => {
        let isMounted = true;

        const updatePendingCount = async () => {
            try {
                const response = await axios.get('/api/swapping-requests', {
                    params: { status: 'pending' },
                });
                if (!isMounted) return;
                const pendingCount = Array.isArray(response.data) ? response.data.length : 0;
                setPendingSwapCount(pendingCount);
            } catch (error) {
                if (!isMounted) return;
                setPendingSwapCount(0);
            }
        };

        updatePendingCount();

        return () => {
            isMounted = false;
        };
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

    const handleAddTask = async (taskData) => {
        try {
            const payload = {
                profile_id: Number(taskData.profileId),
                task_description: taskData.task,
                task_date: taskData.date,
                status: 'active',
            };
            const response = await axios.post('/api/schedules', payload);
            setTasks((prev) => [...prev, mapScheduleToTask(response.data)]);
            setShowTaskForm(false);
        } catch (error) {
            alert('Could not save schedule. Please try again.');
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setTaskToSwap(task);
        setModalMode('view');
        setShowTaskForm(true);
    };

    const submitSwapRequest = (payload) => {
        axios.post('/api/swapping-requests', payload)
            .then(() => {
                setPendingSwapCount((prev) => prev + 1);
            })
            .catch((error) => {
                const message = error?.response?.data?.message || 'Could not create swap request. Please try again.';
                alert(message);
            })
            .finally(() => {
                setShowTaskForm(false);
                setModalMode('add');
                setSelectedTask(null);
                setTaskToSwap(null);
            });
    };

    const handleSwapDayClick = (day) => {
        if (!day || !taskToSwap || modalMode !== 'swap') return;

        const targetDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        submitSwapRequest({
            requester_schedule_id: taskToSwap.id,
            target_date: targetDateStr,
        });
    };

    const handleSwapTaskClick = (event, targetTask) => {
        event.stopPropagation();
        if (!taskToSwap || modalMode !== 'swap') return;
        if (targetTask.id === taskToSwap.id) return;

        submitSwapRequest({
            requester_schedule_id: taskToSwap.id,
            target_schedule_id: targetTask.id,
        });
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
                                                onClick={(event) => {
                                                    if (modalMode === 'swap') {
                                                        handleSwapTaskClick(event, task);
                                                        return;
                                                    }
                                                    handleTaskClick(task);
                                                }}
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
                onUpdateTask={async (updateTask) => {
                    try {
                        const payload = {
                            profile_id: Number(updateTask.profileId),
                            task_description: updateTask.task,
                            task_date: updateTask.date,
                            status: updateTask.status || 'active',
                        };
                        const response = await axios.put(`/api/schedules/${updateTask.id}`, payload);
                        setTasks(prev => prev.map(t => t.id === updateTask.id ? mapScheduleToTask(response.data) : t));
                        setShowTaskForm(false);
                        setSelectedTask(null);
                        setModalMode('add');
                    } catch (error) {
                        alert('Could not update schedule. Please try again.');
                    }
                }}
                onSwitchToEdit={() => setModalMode('edit')}
                onSwitchToSwap={() => {
                    setModalMode('swap');
                    setShowTaskForm(false);
                }}
                userRole={user?.role_id}
                profileOptions={profiles}
                currentProfileId={currentProfileId}
            />
        </div>
    );
}

export default Schedule;