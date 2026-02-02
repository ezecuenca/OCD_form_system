export const SWAP_REQUESTS_KEY = 'swapRequests';
const SCHEDULED_TASKS_KEY = 'scheduledTasks';

export function getSwapRequests() {
    try {
        const saved = localStorage.getItem(SWAP_REQUESTS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function saveSwapRequest(request) {
    const requests = getSwapRequests();
    requests.unshift(request);
    localStorage.setItem(SWAP_REQUESTS_KEY, JSON.stringify(requests));
}

export function removeSwapRequest(id) {
    const requests = getSwapRequests().filter(r => r.id !== id);
    localStorage.setItem(SWAP_REQUESTS_KEY, JSON.stringify(requests));
}

export function updateSwapRequestStatus(id, status) {
    const requests = getSwapRequests().map(r =>
        r.id === id ? { ...r, status } : r
    );
    localStorage.setItem(SWAP_REQUESTS_KEY, JSON.stringify(requests));
}

export function executeSwapRequest(id) {
    const requests = getSwapRequests();
    const req = requests.find(r => r.id === id);
    if (!req || req.status !== 'pending') return false;

    const savedTasks = localStorage.getItem(SCHEDULED_TASKS_KEY);
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];

    const sourceTask = tasks.find(
        t => t.name === req.taskName && t.task === req.taskDescription && t.date === req.fromDate
    );
    if (!sourceTask) return false;

    const targetTaskOnDate = tasks.find(t => t.date === req.toDate);

    const swappedAt = new Date().toISOString();
    const newTasks = tasks.map(t => {
        if (t === sourceTask) {
            return { ...t, date: req.toDate, swappedAt };
        }
        if (targetTaskOnDate && t === targetTaskOnDate) {
            return { ...t, date: req.fromDate, swappedAt };
        }
        return t;
    });

    localStorage.setItem(SCHEDULED_TASKS_KEY, JSON.stringify(newTasks));
    updateSwapRequestStatus(id, 'approved');
    return true;
}
