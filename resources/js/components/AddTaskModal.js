import React, { useEffect, useState } from 'react';

function AddTaskModal({ isOpen, onClose, selectedDate, currentMonth, onAddTask }) {
    const [name, setName] = useState('');
    const [task, setTask] = useState('');
    const [schedule, setSchedule] = useState('');

    useEffect(() => {
        if (isOpen && selectedDate) {
            setSchedule(selectedDate);
        }
    }, [isOpen, selectedDate]);

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
        onClose();
    };

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return 'No data selected';
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
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
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#f9f9f9',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px',
                            minHeight: '50px', 
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            {formatDateForDisplay(schedule)}
                        </div>
                    </div>

                    <small style={{ color: '#777', marginTop: '0.4rem', fontSize: '0.8rem'}}>
                        Selected Date: {formatDateForDisplay(schedule)}
                    </small>

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
