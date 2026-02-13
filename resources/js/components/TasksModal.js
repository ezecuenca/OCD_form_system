import React, { useEffect, useState } from 'react';

function TasksModal({ isOpen, onClose, selectedDate, initialTask = null, mode = 'add', onAddTask , onUpdateTask, onSwitchToEdit, onSwitchToSwap, userRole }) {
    
    const isAddMode = mode === 'add';
    const isViewMode = mode === 'view';
    const isEditMode = mode === 'edit';

    const [name, setName] = useState('');
    const [task, setTask] = useState('');
    const [schedule, setSchedule] = useState('');
    const [errors, setErrors] = useState({}); // New state for inline errors

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
        setErrors({}); // Clear errors on open
    }, [isOpen, mode, initialTask, selectedDate]);

    const validateForm = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (!task.trim()) newErrors.task = 'Task description is required';
        if (!schedule) newErrors.schedule = 'Date is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isViewMode) return;

        if (!validateForm()) return;

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
                    <h2>{isAddMode ? 'Add Task' : isViewMode ? 'View Task' : isEditMode ? 'Edit Task' : 'Swap Task'}</h2>
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
                                required
                            />
                            {errors.name && <span className="error" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.name}</span>}
                        </div>

                        <div className="form__group">
                            <label>Task / Description</label>
                            <textarea
                                id="task"
                                value={task}
                                onChange={e => setTask(e.target.value)}
                                placeholder="Enter task details"
                                rows="5"
                                required
                            />
                            {errors.task && <span className="error" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.task}</span>}
                        </div>

                        <div className="form__group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={schedule}
                                readOnly={!isEditMode}
                                style={isEditMode ? {} : { backgroundColor: '#f9f9f9', cursor: 'default' }}
                                onChange={e => setSchedule(e.target.value)}
                                required
                            />
                            <small style={{ color: '#666', marginTop: '0.4rem', display: 'block' }}>
                                {formatDate(schedule)}
                            </small>
                            {errors.schedule && <span className="error" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.schedule}</span>}
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
                            <div className="value date" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {formatDate(schedule)}
                                {initialTask?.swappedAt && (
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: '#e8f5e9',
                                        color: '#2e7d32',
                                        fontWeight: 500
                                    }}>
                                        Swapped
                                    </span>
                                )}
                            </div>
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
                                {(userRole === 2 || userRole === 3) && (
                                    <button type="button" className="btn btn--primary" onClick={() => onSwitchToEdit()}>Edit Task</button>
                                )}
                                <button type="button" className="btn btn--secondary" onClick={() => onSwitchToSwap()}>Request Swap</button>
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

export default TasksModal;