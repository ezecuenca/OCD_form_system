import React, { useEffect, useState } from 'react';

function AddTaskModal({ isOpen, onClose, selectedDate, initialTask = null, mode = 'add', onAddTask , onUpdateTask, onSwitchToEdit }) {
    
    const isAddMode = mode === 'add';
    const isViewMode = mode === 'view';
    const isEditMode = mode === 'edit';

    const [name, setName] = useState('');
    const [task, setTask] = useState('');
    const [schedule, setSchedule] = useState('');

    useEffect(() => {
        if (!isOpen) return;

        if (isAddMode) {
            setName('');
            setTask('');
            setSchedule(selectedDate || '');
        } else if (initialTask) {
            setName(initialTask.name || '');
            setTask(initialTask.task || '');
            setSchedule(initialTask.date || '');
        }
    }, [isOpen, mode, initialTask, selectedDate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isViewMode) return;

        const taskData = {
            name: name.trim(),
            task: task.trim(),
            date: schedule,
        };
        if (isEditMode) {
            onUpdateTask({ ...initialTask, ...taskData });
        } else {
            onAddTask(taskData);
        }

        onClose();
    }

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

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const [y, m, d] = dateStr.split('-');
        return new Date(y, m-1, d).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal__header">
                    <h2>{isAddMode ? 'Add Task' : isViewMode ? 'View Task' : 'Edit Task'}</h2>
                    <button className="modal__close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal__form">
                    {isAddMode || isEditMode ? (
                    <>
                        <div className="form__group">
                            <label>Name</label>
                            <input
                                type="text"
                                id='name'
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Enter name"
                            />
                        </div>

                        <div className="form__group">
                            <label>Task / Description</label>
                            <textarea
                                id="task"
                                value={task}
                                onChange={e => setTask(e.target.value)}
                                placeholder="Enter task details"
                                rows="5"
                            />
                        </div>

                        <div className="form__group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={schedule}
                                readOnly={!isEditMode}
                                style={isEditMode ? {} : { backgroundColor: '#f9f9f9', cursor: 'default' }}
                            />
                            <small style={{ color: '#666', marginTop: '0.4rem', display: 'block' }}>
                                {formatDate(schedule)}
                            </small>
                        </div>
                    </>
                    ) : isViewMode && (

                        <div className="view-task">
                            <div className="view-task__row">
                            <label>Name</label>
                            <div className="value strong">{name || '—'}</div>
                        </div>

                        <div className="view-task__row">
                            <label>Task / Description</label>
                            <div className="value description">
                                {task || 'No description provided'}
                            </div>
                        </div>

                        <div className="view-task__row">
                            <label>Date</label>
                            <div className="value date">{formatDate(schedule)}</div>
                        </div>
                    </div>
                )}

                    <div className="modal__actions">
                        {isAddMode && (
                            <>
                                <button type="submit" className="btn btn--primary">Add Task</button>
                            </>
                        )}

                        {isViewMode && (
                            <>
                                <button type="button" className="btn btn--primary" onClick={onSwitchToEdit}>Edit Task</button>
                                <button type="button" className="btn btn--secondary">Swap Task</button>
                            </>
                        )}

                        {isEditMode && (
                            <>
                                <button type="submit" className="btn btn--primary">Save Changes</button>
                                <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddTaskModal;
