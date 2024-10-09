document.addEventListener('DOMContentLoaded', function() {
    const taskTable = document.getElementById('task-tbody');
    const addTaskButton = document.getElementById('add-task');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const completedTasksList = document.getElementById('completed-tasks');
    const printButton = document.getElementById('print-button');
    const dateInput = document.getElementById('date');
    const topPriorities = document.getElementById('top-priorities');
    const brainDump = document.getElementById('brain-dump');

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Load saved data from localStorage
    function loadSavedData() {
        const savedDate = localStorage.getItem('selectedDate');
        if (savedDate) {
            dateInput.value = savedDate;
        }

        topPriorities.value = localStorage.getItem('topPriorities') || '';
        brainDump.value = localStorage.getItem('brainDump') || '';

        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        savedTasks.forEach(task => {
            const newRow = createTaskRow(task.startTime, task.endTime, task.description, task.done);
            taskTable.appendChild(newRow);
        });

        updateProgress();
        updateCompletedTasks();
    }

    // Save data to localStorage
    function saveData() {
        localStorage.setItem('selectedDate', dateInput.value);
        localStorage.setItem('topPriorities', topPriorities.value);
        localStorage.setItem('brainDump', brainDump.value);

        const tasks = Array.from(taskTable.querySelectorAll('tr')).map(row => ({
            startTime: row.querySelector('.start-time').value,
            endTime: row.querySelector('.end-time').value,
            description: row.querySelector('.task-description').value,
            done: row.querySelector('.task-done').checked
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function createTaskRow(startTime = '', endTime = '', description = '', done = false) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Time">
                <input type="time" class="start-time" value="${startTime}"> to 
                <input type="time" class="end-time" value="${endTime}">
            </td>
            <td data-label="Task"><input type="text" class="task-description" placeholder="Enter task" value="${description}"></td>
            <td data-label="Done"><input type="checkbox" class="task-done" ${done ? 'checked' : ''}></td>
            <td data-label="Remove"><button class="minus-sign">−</button></td>
        `;
        return row;
    }

    function updateProgress() {
        const totalTasks = taskTable.querySelectorAll('tr').length;
        const completedTasks = taskTable.querySelectorAll('.task-done:checked').length;
        const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        progressFill.style.width = `${progressPercentage}%`;
        progressText.textContent = `${Math.round(progressPercentage)}% Complete`;
    }

    function updateCompletedTasks() {
        completedTasksList.innerHTML = '';
        taskTable.querySelectorAll('tr').forEach(row => {
            const checkbox = row.querySelector('.task-done');
            const taskDescription = row.querySelector('.task-description').value;
            if (checkbox.checked && taskDescription.trim() !== '') {
                const li = document.createElement('li');
                li.textContent = taskDescription;
                completedTasksList.appendChild(li);
            }
        });
    }

    addTaskButton.addEventListener('click', function() {
        const newRow = createTaskRow();
        taskTable.appendChild(newRow);
        updateProgress();
        saveData();
    });

    taskTable.addEventListener('click', function(e) {
        if (e.target.classList.contains('minus-sign')) {
            e.target.closest('tr').remove();
            updateProgress();
            updateCompletedTasks();
            saveData();
        }
    });

    taskTable.addEventListener('change', function(e) {
        if (e.target.classList.contains('task-done') || e.target.classList.contains('task-description') ||
            e.target.classList.contains('start-time') || e.target.classList.contains('end-time')) {
            updateProgress();
            updateCompletedTasks();
            saveData();
        }
    });

    printButton.addEventListener('click', function() {
        window.print();
    });

    dateInput.addEventListener('change', function() {
        saveData();
        loadSavedData();
    });

    topPriorities.addEventListener('input', saveData);
    brainDump.addEventListener('input', saveData);

    // Initialize with saved data or create empty rows if no data
    loadSavedData();
    if (taskTable.children.length === 0) {
        for (let i = 0; i < 3; i++) {
            taskTable.appendChild(createTaskRow());
        }
        saveData();
    }
});
