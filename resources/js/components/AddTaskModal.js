import React, { useState } from 'react';

function AddTaskModal({ isOpen, onClose, selectedDate, currentMonth, onAddTask }) {
    const [name, setName] = useState('');
    const [task, setTask] = useState('');
    const [schedule, setSchedule] = useState(selectedDate || '');

    const handleAddTask = (e) => {
        e.preventDefault();
        
        if (!name.trim() || !task.trim() || !schedule) {
            alert('Please fill in all fields');
            return;
        }

        onAddTask({
            name,
            task,
            date: schedule
        });

        // Reset form
        setName('');
        setTask('');
        setSchedule(selectedDate || '');
    };

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', { 
            month: 'numeric',
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal__header">
                    <h2>Add Task</h2>
                    <button className="modal__close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleAddTask} className="modal__form">
                    <div className="form__group">
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter name"
                        />
                    </div>

                    <div className="form__group">
                        <label htmlFor="task">Task:</label>
                        <textarea
                            id="task"
                            value={task}
                            onChange={(e) => setTask(e.target.value)}
                            placeholder="Enter task details"
                            rows="4"
                        />
                    </div>

                    <div className="form__group">
                        <label htmlFor="schedule">Schedule:</label>
                        <input
                            type="date"
                            id="schedule"
                            value={schedule}
                            onChange={(e) => setSchedule(e.target.value)}
                        />
                    </div>

                    <div className="modal__actions">
                        <button type="submit" className="btn btn--primary">Add Task</button>
                        <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddTaskModal;
