import React, { useState } from 'react';
import AddTaskModal from './AddTaskModal';
import { set } from 'lodash';

function Schedule() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [modalMode, setModalMode] = useState('add'); // 'add' | 'view' | 'edit'

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

    const handleDayClick = (day) => {
        if (!day) return;

        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
        setShowTaskForm(true);
    };

    //const handleAddTaskClick = () => {
    //    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), new Date().getDate());
    //    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    //    setSelectedDate(dateStr);
    //    setShowTaskForm(true);
    //};

    const handleAddTask = (taskData) => {
        setTasks([...tasks, taskData]);
        setShowTaskForm(false);
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setModalMode('view');
        setShowTaskForm(true);
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
                                    onClick={() => handleDayClick(day)}
                                    //Make it look clickable
                                    role="button"
                                    tabIndex={day ? 0 : -1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            handleDayClick(day);
                                        }
                                    }}
                                    // ----------------------------------------------
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
                        <button className="schedule__btn schedule__btn--tertiary">Swapping Form Requests</button>
                    </div>
                </div>
            </div>

            <AddTaskModal
                isOpen={showTaskForm}
                onClose={() => {
                    setShowTaskForm(false);
                    setSelectedTask(null);
                    setModalMode('add');
                }}
                selectedDate={selectedDate}
                currentMonth={currentDate}
                onAddTask={handleAddTask}
                initialTask={selectedTask}
                mode={modalMode}
                onUpdateTask={(updateTask) => {
                    setTask(prev => prev.map(t => t === selectedTask ? updateTask : t));
                    setShowTaskForm(false);
                    setSelectedTask(null);
                    setModalMode('add');
                }}
                onSwitchToEdit={() => setModalMode('edit')}
            />
        </div>
    );
}

export default Schedule;