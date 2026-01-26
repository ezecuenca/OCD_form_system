import router from './routers';

function renderADRForm(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="adr-form">
            <div class="adr-form__header">
                <div class="adr-form__header-left">
                    <h1 class="adr-form__title">ADR Form</h1>
                    <button class="adr-form__header-btn">
                        <img src="${window.location.origin}/images/create_icon.svg" alt="Create">
                        Create
                    </button>
                    <button class="adr-form__header-btn">
                        <img src="${window.location.origin}/images/view_icon.svg" alt="PDF">
                        PDF
                    </button>
                </div>
                <button class="adr-form__header-btn adr-form__header-btn--return" data-route="/adr-reports">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Return
                </button>
            </div>

            <div class="adr-form__content">
                <div class="adr-form__top-fields">
                    <div class="adr-form__field">
                        <label>For:</label>
                        <input type="text">
                    </div>
                    <div class="adr-form__field">
                        <label>Thru:</label>
                        <input type="text">
                    </div>
                    <div class="adr-form__field">
                        <label>From:</label>
                        <input type="text">
                    </div>
                    <div class="adr-form__field">
                        <label>Subject:</label>
                        <input type="text">
                    </div>
                </div>

                <div class="adr-form__section">
                    <label class="adr-form__section-label">1. Status</label>
                    <select class="adr-form__select">
                        <option>WHITE ALERT</option>
                        <option>BLUE ALERT</option>
                        <option>RED ALERT</option>
                    </select>
                </div>

                <div class="adr-form__section adr-form__section--grey adr-form__section--reports">
                    <label class="adr-form__section-label">3. Reports and Advisories</label>
                    <div class="adr-form__reports-list">
                        <div class="adr-form__reports-item">
                            <div class="adr-form__field">
                                <label>Reports and Advisories released:</label>
                                <textarea rows="3"></textarea>
                            </div>
                            <div class="adr-form__field">
                                <label>Remarks:</label>
                                <input type="text">
                            </div>
                        </div>
                    </div>
                    <div class="adr-form__add-line">
                        <hr>
                        <button class="adr-form__add-btn adr-form__add-btn--reports" type="button">
                            <img src="${window.location.origin}/images/create_icon.svg" alt="Add">
                        </button>
                    </div>
                </div>

                <div class="adr-form__section adr-form__section--grey adr-form__section--attendance">
                    <label class="adr-form__section-label">2. Attendance</label>
                    <div class="adr-form__attendance-list">
                        <div class="adr-form__attendance-item">
                            <div class="adr-form__field">
                                <label>Name:</label>
                                <input type="text">
                            </div>
                            <div class="adr-form__field">
                                <label>Task:</label>
                                <textarea rows="2"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="adr-form__add-line">
                        <hr>
                        <button class="adr-form__add-btn adr-form__add-btn--attendance" type="button">
                            <img src="${window.location.origin}/images/create_icon.svg" alt="Add">
                        </button>
                    </div>
                </div>

                <div class="adr-form__section">
                    <label class="adr-form__section-label">4. Administrative</label>
                    <div class="adr-form__customize-group">
                        <label>Status of Communication Lines</label>
                        <button class="adr-form__customize-btn" data-modal="communication-lines">CUSTOMIZE</button>
                    </div>
                    <div class="adr-form__customize-group">
                        <label>Status of Other Items</label>
                        <button class="adr-form__customize-btn" data-modal="other-items">CUSTOMIZE</button>
                    </div>
                </div>
            </div>
            
            <div class="adr-form__modal" id="communication-lines-modal">
                <div class="adr-form__modal-content">
                    <div class="adr-form__modal-header">
                        <h2>Status of Communication Lines</h2>
                        <button class="adr-form__modal-close" type="button">&times;</button>
                    </div>
                    <div class="adr-form__modal-body">
                        <table class="adr-form__modal-table">
                            <thead>
                                <tr>
                                    <th>Particulars</th>
                                    <th>No. of Items</th>
                                    <th>Contact No. / Freq / Channel</th>
                                    <th>Status / Remarks</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody class="adr-form__modal-table-body">
                                <tr class="adr-form__modal-table-row">
                                    <td>
                                        <input type="text" class="adr-form__modal-input" placeholder="Enter particulars">
                                    </td>
                                    <td>
                                        <div class="adr-form__counter">
                                            <button class="adr-form__counter-btn" type="button" data-action="decrease">−</button>
                                            <input type="number" class="adr-form__counter-input" value="0" min="0">
                                            <button class="adr-form__counter-btn" type="button" data-action="increase">+</button>
                                        </div>
                                    </td>
                                    <td>
                                        <input type="text" class="adr-form__modal-input" placeholder="Enter contact/freq/channel">
                                    </td>
                                    <td>
                                        <input type="text" class="adr-form__modal-input" placeholder="Enter status/remarks">
                                    </td>
                                    <td>
                                        <button class="adr-form__modal-action-btn" type="button" data-action="delete">
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                                                <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <button class="adr-form__modal-add-row" type="button">Add Row</button>
                    </div>
                    <div class="adr-form__modal-footer">
                        <button class="adr-form__modal-confirm" type="button">Confirm</button>
                    </div>
                </div>
            </div>
            
            <div class="adr-form__signature-fields">
                <div class="adr-form__signature-item">
                    <div class="adr-form__field">
                        <label>Prepared By:</label>
                        <input type="text">
                    </div>
                    <div class="adr-form__field">
                        <label>Position:</label>
                        <input type="text" class="adr-form__position-line">
                    </div>
                </div>
                <div class="adr-form__signature-item">
                    <div class="adr-form__field">
                        <label>Received By:</label>
                        <input type="text">
                    </div>
                    <div class="adr-form__field">
                        <label>Position:</label>
                        <input type="text" class="adr-form__position-line">
                    </div>
                </div>
                <div class="adr-form__signature-item">
                    <div class="adr-form__field">
                        <label>Noted By:</label>
                        <input type="text">
                    </div>
                    <div class="adr-form__field">
                        <label>Position:</label>
                        <input type="text" class="adr-form__position-line">
                    </div>
                </div>
                <div class="adr-form__signature-item">
                    <div class="adr-form__field">
                        <label>Approved By:</label>
                        <input type="text">
                    </div>
                    <div class="adr-form__field">
                        <label>Position:</label>
                        <input type="text" class="adr-form__position-line">
                    </div>
                </div>
            </div>
        </div>
    `;

    const returnBtn = container.querySelector('.adr-form__header-btn--return');
    if (returnBtn) {
        returnBtn.addEventListener('click', function() {
            const route = this.getAttribute('data-route');
            if (route) {
                router.navigate(route);
            }
        });
    }

    const attendanceSection = container.querySelector('.adr-form__section--attendance');
    const attendanceList = attendanceSection ? attendanceSection.querySelector('.adr-form__attendance-list') : null;
    const attendanceAddBtn = attendanceSection ? attendanceSection.querySelector('.adr-form__add-btn--attendance') : null;

    const reportsSection = container.querySelector('.adr-form__section--reports');
    const reportsList = reportsSection ? reportsSection.querySelector('.adr-form__reports-list') : null;
    const reportsAddBtn = reportsSection ? reportsSection.querySelector('.adr-form__add-btn--reports') : null;

    function addAttendanceItem() {
        if (!attendanceList) return;

        const attendanceItem = document.createElement('div');
        attendanceItem.className = 'adr-form__attendance-item';

        const itemCount = attendanceList.children.length;
        const showRemoveBtn = itemCount > 0;

        attendanceItem.innerHTML = `
            ${showRemoveBtn ? '<button class="adr-form__remove-btn" type="button">−</button>' : ''}
            <div class="adr-form__field">
                <label>Name:</label>
                <input type="text">
            </div>
            <div class="adr-form__field">
                <label>Task:</label>
                <textarea rows="2"></textarea>
            </div>
        `;

        attendanceList.appendChild(attendanceItem);

        if (showRemoveBtn) {
            const removeBtn = attendanceItem.querySelector('.adr-form__remove-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    attendanceItem.remove();
                    updateAttendanceRemoveButtons();
                });
            }
        }

        updateAttendanceRemoveButtons();
    }

    function updateAttendanceRemoveButtons() {
        if (!attendanceList) return;
        const items = attendanceList.querySelectorAll('.adr-form__attendance-item');
        
        items.forEach((item, index) => {
            let removeBtn = item.querySelector('.adr-form__remove-btn');
            
            if (items.length > 1) {
                if (!removeBtn) {
                    removeBtn = document.createElement('button');
                    removeBtn.className = 'adr-form__remove-btn';
                    removeBtn.type = 'button';
                    removeBtn.textContent = '−';
                    item.insertBefore(removeBtn, item.firstChild);
                    
                    removeBtn.addEventListener('click', function() {
                        item.remove();
                        updateAttendanceRemoveButtons();
                    });
                }
            } else {
                if (removeBtn) {
                    removeBtn.remove();
                }
            }
        });
    }

    function addReportsItem() {
        if (!reportsList) return;

        const reportsItem = document.createElement('div');
        reportsItem.className = 'adr-form__reports-item';

        const itemCount = reportsList.children.length;
        const showRemoveBtn = itemCount > 0;

        reportsItem.innerHTML = `
            ${showRemoveBtn ? '<button class="adr-form__remove-btn" type="button">−</button>' : ''}
            <div class="adr-form__field">
                <label>Reports and Advisories released:</label>
                <textarea rows="3"></textarea>
            </div>
            <div class="adr-form__field">
                <label>Remarks:</label>
                <input type="text">
            </div>
        `;

        reportsList.appendChild(reportsItem);

        if (showRemoveBtn) {
            const removeBtn = reportsItem.querySelector('.adr-form__remove-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    reportsItem.remove();
                    updateReportsRemoveButtons();
                });
            }
        }

        updateReportsRemoveButtons();
    }

    function updateReportsRemoveButtons() {
        if (!reportsList) return;
        const items = reportsList.querySelectorAll('.adr-form__reports-item');
        
        items.forEach((item, index) => {
            let removeBtn = item.querySelector('.adr-form__remove-btn');
            
            if (items.length > 1) {
                if (!removeBtn) {
                    removeBtn = document.createElement('button');
                    removeBtn.className = 'adr-form__remove-btn';
                    removeBtn.type = 'button';
                    removeBtn.textContent = '−';
                    item.insertBefore(removeBtn, item.firstChild);
                    
                    removeBtn.addEventListener('click', function() {
                        item.remove();
                        updateReportsRemoveButtons();
                    });
                }
            } else {
                if (removeBtn) {
                    removeBtn.remove();
                }
            }
        });
    }

    if (attendanceAddBtn) {
        attendanceAddBtn.addEventListener('click', addAttendanceItem);
        updateAttendanceRemoveButtons();
    }

    if (reportsAddBtn) {
        reportsAddBtn.addEventListener('click', addReportsItem);
        updateReportsRemoveButtons();
    }

    const customizeBtns = container.querySelectorAll('.adr-form__customize-btn');
    const communicationModal = container.querySelector('#communication-lines-modal');
    const modalClose = communicationModal ? communicationModal.querySelector('.adr-form__modal-close') : null;
    const modalTableBody = communicationModal ? communicationModal.querySelector('.adr-form__modal-table-body') : null;
    const modalAddRowBtn = communicationModal ? communicationModal.querySelector('.adr-form__modal-add-row') : null;
    const modalConfirmBtn = communicationModal ? communicationModal.querySelector('.adr-form__modal-confirm') : null;

    customizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            if (modalId === 'communication-lines' && communicationModal) {
                communicationModal.classList.add('adr-form__modal--active');
            }
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', function() {
            if (communicationModal) {
                communicationModal.classList.remove('adr-form__modal--active');
            }
        });
    }

    if (communicationModal) {
        communicationModal.addEventListener('click', function(e) {
            if (e.target === communicationModal) {
                communicationModal.classList.remove('adr-form__modal--active');
            }
        });
    }

    function addModalRow() {
        if (!modalTableBody) return;

        const row = document.createElement('tr');
        row.className = 'adr-form__modal-table-row';

        row.innerHTML = `
            <td>
                <input type="text" class="adr-form__modal-input" placeholder="Enter particulars">
            </td>
            <td>
                <div class="adr-form__counter">
                    <button class="adr-form__counter-btn" type="button" data-action="decrease">−</button>
                    <input type="number" class="adr-form__counter-input" value="0" min="0">
                    <button class="adr-form__counter-btn" type="button" data-action="increase">+</button>
                </div>
            </td>
            <td>
                <input type="text" class="adr-form__modal-input" placeholder="Enter contact/freq/channel">
            </td>
            <td>
                <input type="text" class="adr-form__modal-input" placeholder="Enter status/remarks">
            </td>
            <td>
                <button class="adr-form__modal-action-btn" type="button" data-action="delete">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                        <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </td>
        `;

        modalTableBody.appendChild(row);

        const deleteBtn = row.querySelector('button[data-action="delete"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                row.remove();
            });
        }

        const counterBtns = row.querySelectorAll('.adr-form__counter-btn');
        counterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const counterInput = row.querySelector('.adr-form__counter-input');
                let value = parseInt(counterInput.value) || 1;
                if (this.getAttribute('data-action') === 'increase') {
                    value++;
                } else if (this.getAttribute('data-action') === 'decrease' && value > 0) {
                    value--;
                }
                counterInput.value = value;
            });
        });
    }

    if (modalAddRowBtn) {
        modalAddRowBtn.addEventListener('click', addModalRow);
    }

    if (modalTableBody) {
        const existingRows = modalTableBody.querySelectorAll('.adr-form__modal-table-row');
        existingRows.forEach(row => {
            const deleteBtn = row.querySelector('button[data-action="delete"]');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    row.remove();
                });
            }

            const counterBtns = row.querySelectorAll('.adr-form__counter-btn');
            counterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const counterInput = row.querySelector('.adr-form__counter-input');
                    let value = parseInt(counterInput.value) || 1;
                    if (this.getAttribute('data-action') === 'increase') {
                        value++;
                    } else if (this.getAttribute('data-action') === 'decrease' && value > 1) {
                        value--;
                    }
                    counterInput.value = value;
                });
            });
        });
    }

    if (modalConfirmBtn) {
        modalConfirmBtn.addEventListener('click', function() {
            if (communicationModal) {
                communicationModal.classList.remove('adr-form__modal--active');
            }
        });
    }
}

router.route('/adr-reports/create', renderADRForm);

export { renderADRForm };
