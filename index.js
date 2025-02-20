let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentTaskIndex = null; // Used by addTask() to determine whether a new task is being created or an existing task is being edited.
// If currentTaskIndex is null, a new task is added to the task list.

// Task loader on the page
function renderTasks(filter = "all") {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  checkUpcomingTasks();
  // If the tasks array is empty, display a "No Tasks" message and return
  if (tasks.length === 0) {
    const noTasksMessage = document.createElement("p");
    noTasksMessage.textContent = "No tasks added yet.";
    noTasksMessage.className = "no-tasks-message";
    taskList.appendChild(noTasksMessage);
    updateStats(); // Update statistics (e.g., progress bar, pie chart)
    return; // Exit the function early
  }


  const filteredTasks = tasks
    .map((task, index) => ({ ...task, originalIndex: index })) // Store original index
    .filter((task) => {
      if (filter === "completed") return task.completed;
      if (filter === "pending") return !task.completed;
      return true; // 'all'
    });

  filteredTasks.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.className = `task ${
      task.completed ? "completed" : task.priority
    }`;
    taskElement.innerHTML = `
        <div class="title">
          <label>
            <input name="complete-task" type="checkbox" ${
              task.completed ? "checked" : ""
            } onchange="toggleComplete(${task.originalIndex})">
            <span class="checkmark"></span>
          </label>
          <span class="task-title">${task.text}</span>
          <p class="task-priority ${task.priority}"><strong>Priority: ${
      task.priority
    }</strong></p>
          <p class="task-deadline">📅 ${task.date}</p>
        </div>
        <div class="task-actions">
          <button class="edit-btn" onclick="openEditForm(${
            task.originalIndex
          })" title="Edit"><ion-icon name="pencil-sharp"></ion-icon></button>
          <button class="delete-btn" onclick="deleteTask(${
            task.originalIndex
          })" title="Remove"><ion-icon name="trash-sharp"></ion-icon></button>
        </div>
      `;
    taskList.appendChild(taskElement);
  });
  updateStats();
}

// The below function filters the upcoming tasks
function checkUpcomingTasks() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  // Filter tasks that are due tomorrow and not completed
  const upcomingTasks = tasks.filter((task) => {
    const taskDate = new Date(task.date);
    return (
      taskDate.toDateString() === tomorrow.toDateString() && !task.completed
    );
  });

  const upcomingTasksList = document.getElementById("upcoming-task-list");
  upcomingTasksList.innerHTML = ""; // Clear the list before rendering

  if (upcomingTasks.length > 0) {
    // If there are upcoming tasks, display them
    upcomingTasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = "upcoming-task";
      taskElement.textContent = task.text;
      upcomingTasksList.appendChild(taskElement);
    });

    // Show the upcoming tasks section
    document.querySelector(".upcoming-tasks").style.display = "block";
  } else {
    // If there are no upcoming tasks, display a message
    const noTasksMessage = document.createElement("p");
    noTasksMessage.textContent = "No upcoming tasks for tomorrow.";
    noTasksMessage.className = "no-tasks-message";
    upcomingTasksList.appendChild(noTasksMessage);

    // Show the upcoming tasks section (to display the message)
    document.querySelector(".upcoming-tasks").style.display = "block";
  }
}

// Edit Task using this function
function openEditForm(index) {
  currentTaskIndex = index; // Set the current task index
  const taskInput = document.getElementById("task-input");
  const dateInput = document.getElementById("task-date");
  const priorityInput = document.getElementById("task-priority");
  dateInput.value = tasks[index].date;
  priorityInput.value = tasks[index].priority;
  taskInput.value = tasks[index].text;
  const overlay = document.getElementById("overlay");
  const formTitle = document.getElementById("form-title");
  const submitButton = document.getElementById("submit-button");

  formTitle.textContent = "Edit Task";
  submitButton.textContent = "Save Changes";
  submitButton.setAttribute("onclick", "addTask()");

  overlay.style.display = "flex";
}

// Open the form for adding a new task
function openAddForm() {
  currentTaskIndex = null; // Reset the current task index
  const taskInput = document.getElementById("task-input");
  const dateInput = document.getElementById("task-date");
  const priorityInput = document.getElementById("task-priority");
  const overlay = document.getElementById("overlay");
  const formTitle = document.getElementById("form-title");
  const submitButton = document.getElementById("submit-button");
  dateInput.value = null;
  priorityInput.value = null; // Clear the form values
  taskInput.value = ""; // Clear the input field

  formTitle.textContent = "Add New Task";
  submitButton.textContent = "Add Task";
  submitButton.setAttribute("onclick", "addTask()");

  overlay.style.display = "flex";
}

// Update Stats Function
function updateStats() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Update Progress Bar
  const progressBar = document.getElementById("progress");
  progressBar.style.width = `${completionRate}%`;

  // Update Completion Rate Text
  document.getElementById(
    "completion-rate"
  ).textContent = `Completion Rate: ${completionRate}%`;

  // Update Pie Chart
  const ctx = document.getElementById("task-chart").getContext("2d");
  if (window.taskChart) {
    window.taskChart.destroy(); // Destroy existing chart instance
  }
  window.taskChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completed", "Pending"],
      datasets: [
        {
          data: [completedTasks, totalTasks - completedTasks],
          backgroundColor: ["#28a745", "#007bff"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// Add new Task or edit the existing
function addTask() {
  const taskInput = document.getElementById("task-input");
  const taskDate = document.getElementById("task-date");
  const taskPriority = document.getElementById("task-priority");
  const text = taskInput.value.trim();
  const date = taskDate.value;
  const priority = taskPriority.value;

  if (text && priority && date) {

    if (currentTaskIndex !== null) {
      tasks[currentTaskIndex].text = text;
      tasks[currentTaskIndex].date = date;
      tasks[currentTaskIndex].priority = priority;
      currentTaskIndex = null;
      showNotification("✅ Task edited successfully", "success");
    } else {
      tasks.push({ text, date, priority, completed: false });
      showNotification("✅ Task added successfully", "success");
    }

    tasks.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return 0;
    });

    saveTasks();
    renderTasks();
    closeTaskForm();
    return;
  }
  showNotification("Please fill in all fields ❌", "error");
}

// Toggle Complete 
function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

// Delete Task
function deleteTask(index) {
  // Ask the user for confirmation
  const isConfirmed = confirm("Are you sure you want to delete this task?");

  if (isConfirmed) {
    tasks.splice(index, 1); // Remove the task from the array
    saveTasks();
    renderTasks();
  }
}

// Save Tasks to Local Storage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Open Task Form
function openTaskForm() {
  document.getElementById("overlay").style.display = "flex";
}

// Close Task Form
function closeTaskForm() {
  document.getElementById("overlay").style.display = "none";
}

// Toggle Filters Menu (Mobile/Smaller devices)
function toggleFilters() {
  const filterOptions = document.getElementById("filter-options");
  filterOptions.classList.toggle("show");
}

// Show Success/ Error Notifications
function showNotification(message, type) {
  const notificationBox = document.getElementById("message");
  notificationBox.textContent = message;
  notificationBox.className = `notification ${type}`;
  notificationBox.style.display = "block";

  // Hide the notification after 3 seconds
  setTimeout(() => {
    notificationBox.style.display = "none";
  }, 3000);
}
// Initial Render
renderTasks();

// Close Form on Overlay Click
document.getElementById("overlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("overlay")) {
    closeTaskForm();
  }
});

// Close Filters When Clicking Outside the filters
document.addEventListener("click", (event) => {
  const filters = document.querySelector(".filters");
  const menuIcon = document.querySelector(".menu-icon");
  const filterOptions = document.getElementById("filter-options");

  // Check if the click is outside the filters and menu icon
  if (
    !filters.contains(event.target) ||
    (!menuIcon.contains(event.target) &&
      filterOptions.classList.contains("show"))
  ) {
    filterOptions.classList.remove("show");
  }
});
