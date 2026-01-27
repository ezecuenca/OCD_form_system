import React, { useState } from 'react';

function Schedule() {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // January 1, 2026
    const [tasks, setTasks] = useState([]);
    const [showTaskForm, setShowTaskForm] = useState(false);

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
                        {days.map((day, index) => (
                            <div
                                key={index}
                                className={`schedule__day ${day ? 'schedule__day--active' : 'schedule__day--empty'}`}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="schedule__actions">
                        <button className="schedule__btn schedule__btn--primary">Add Task</button>
                        <button className="schedule__btn schedule__btn--secondary">Swap Task</button>
                        <button className="schedule__btn schedule__btn--tertiary">Swapping Form List</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Schedule;