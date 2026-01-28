import React, { useState } from 'react';
import AddTaskModal from './AddTaskModal';

function Schedule() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

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

    const handleAddTaskClick = () => {
        const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), new Date().getDate());
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        setSelectedDate(dateStr);
        setShowTaskForm(true);
    };

    const handleAddTask = (taskData) => {
        setTasks([...tasks, taskData]);
        setShowTaskForm(false);
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
                            return (
                                <div
                                    key={index}
                                    className={`schedule__day ${day ? 'schedule__day--active' : 'schedule__day--empty'}`}
                                >
                                    <div className="schedule__day-number">{day}</div>
                                    <div className="schedule__day-tasks">
                                        {dayTasks.map((task, taskIndex) => (
                                            <div key={taskIndex} className="schedule__task">
                                                <div className="schedule__task-name">{task.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="schedule__actions">
                        <button className="schedule__btn schedule__btn--primary" onClick={handleAddTaskClick}>Add Task</button>
                        <button className="schedule__btn schedule__btn--secondary">Swap Form</button>
                        <button className="schedule__btn schedule__btn--tertiary">Swapping Requests</button>
                    </div>
                </div>
            </div>

            <AddTaskModal
                isOpen={showTaskForm}
                onClose={() => setShowTaskForm(false)}
                selectedDate={selectedDate}
                currentMonth={currentDate}
                onAddTask={handleAddTask}
            />
        </div>
    );
}

export default Schedule;