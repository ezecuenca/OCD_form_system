import axios from 'axios';

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

export function updateSwapRequestStatus(id, status, extra = {}) {
    const requests = getSwapRequests().map(r =>
        r.id === id ? { ...r, status, ...extra } : r
    );
    localStorage.setItem(SWAP_REQUESTS_KEY, JSON.stringify(requests));
}

export function restoreSwapRequest(id) {
    return axios.post(`/api/swapping-requests/${id}/restore`)
        .catch(error => {
            console.error('Error restoring swap request:', error);
            throw error;
        });
}
