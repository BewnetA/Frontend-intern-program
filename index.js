let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Render Tasks
// Render Tasks
function renderTasks(filter = 'all') {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
  
    const filteredTasks = tasks
      .map((task, index) => ({ ...task, originalIndex: index })) // Store original index
      .filter(task => {
        if (filter === 'completed') return task.completed;
        if (filter === 'pending') return !task.completed;
        return true; // 'all'
      });
  
    filteredTasks.forEach(task => {
      const taskElement = document.createElement('div');
      taskElement.className = `task ${task.completed ? 'completed' : ''}`;
      taskElement.innerHTML = `
        <span>${task.text}</span>
        <div>
          <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleComplete(${task.originalIndex})">
          <button class="edit-btn" onclick="updateTask()">🖊</button> 
          <button onclick="deleteTask(${task.originalIndex})">Delete</button>
        </div>
      `;
      taskList.appendChild(taskElement);
    });
    updateStats();
  }
  

  function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
  
    const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const failureRate = totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0;
  
    document.getElementById('success-rate').textContent = `Success Rate: ${successRate}%`;
    document.getElementById('failure-rate').textContent = `Failure Rate: ${failureRate}%`;
  }

// Add Task
function addTask() {
  const taskInput = document.getElementById('task-input');
  const text = taskInput.value.trim();
  if (text) {
    tasks.push({ text, completed: false });
    taskInput.value = '';
    saveTasks();
    renderTasks();
    closeTaskForm();
  }
}

// Toggle Complete
function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

// Delete Task
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

// Save Tasks to Local Storage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Open Task Form
function openTaskForm() {
  document.getElementById('overlay').style.display = 'flex';
}

// Close Task Form
function closeTaskForm() {
  document.getElementById('overlay').style.display = 'none';
}

// Filter Tasks
function filterTasks(filter) {
  renderTasks(filter);
}

// Toggle Filters Menu (Mobile)
function toggleFilters() {
  const filterOptions = document.getElementById('filter-options');
  filterOptions.classList.toggle('show');
}

// Initial Render
renderTasks();

// Close Form on Overlay Click
document.getElementById('overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('overlay')) {
    closeTaskForm();
  }
});