let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentTaskIndex = null;
// Render Tasks
// Render Tasks
function renderTasks(filter = "all") {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

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
        <span>${task.text}</span>
        <p>Deadline: ${task.date}</p>
        </div>
        <div>
        <label>Done
          <input name="complete-task" type="checkbox" ${
            task.completed ? "checked" : ""
          } onchange="toggleComplete(${task.originalIndex})"></label>
          <button class="edit-btn" onclick="openEditForm(${
            task.originalIndex
          })">🖊</button> 
          <button onclick="deleteTask(${task.originalIndex})">Delete</button>
        </div>
      `;
    taskList.appendChild(taskElement);
  });
  updateStats();
}

// Edit Task using this function
function openEditForm(index) {
  currentTaskIndex = index; // Set the current task index
  const taskInput = document.getElementById("task-input");
  const dateInput = document.getElementById("task-date");
  const priorityInput = document.getElementById("task-priority");
  dateInput.value = tasks[index].date
  priorityInput.value = tasks[index].priority; // Pre-fill the form with the current task priority
  taskInput.value = tasks[index].text; // Pre-fill the form with the current task text
  console.log("In the openEditForm method");
  openTaskForm("edit"); // Open the form in "edit" mode
}

// Open the form for adding a new task
function openAddForm() {
  currentTaskIndex = null; // Reset the current task index
  const taskInput = document.getElementById("task-input");
  const dateInput = document.getElementById("task-date");
  const priorityInput = document.getElementById("task-priority");
  dateInput.value = null;
  priorityInput.value = null; // Clear the form values
  taskInput.value = ""; // Clear the input field
  console.log("In the openAddForm method");

  openTaskForm(); // Open the form in "add" mode
  console.log("In the openAddForm method after calling openTaskForm");
}

// Open the form (general function)
function openTaskForm(mode = "add") {
  console.log("Entering openTaskForm");
  const overlay = document.getElementById("overlay");
  const formTitle = document.getElementById("form-title");
  const submitButton = document.getElementById("submit-button");
  console.log("In the openTaskForm method");

  if (!formTitle || !submitButton) {
    console.error("Form elements not found!");
    return;
  }

  if (mode === "edit") {
    formTitle.textContent = "Edit Task";
    submitButton.textContent = "Save Changes";
    submitButton.setAttribute("onclick", "addTask()");
    console.log("In the openTaskForm method inside if statement");
  } // else {
  //   formTitle.textContent = 'Add New Task';
  //   submitButton.textContent = 'Add Task';
  //   submitButton.setAttribute('onclick', 'addTask()');
  //   console.log("In the openTaskForm method inside else statement");

  // }

  overlay.style.display = "block";
  console.log("In the openTaskForm method final line");
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

// Add Task
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
      showNotification("✅ Task edited successfully", "success")
    } else {
      tasks.push({ text, date, priority, completed: false });
      showNotification("✅ Task added successfully", "success")
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
    return
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
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
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

// Filter Tasks
function filterTasks(filter) {
  renderTasks(filter);
}

// Toggle Filters Menu (Mobile)
// Toggle Filters Menu (Mobile)
function toggleFilters() {
  const filterOptions = document.getElementById("filter-options");
  filterOptions.classList.toggle("show");
}


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
    !menuIcon.contains(event.target) &&
    filterOptions.classList.contains("show")
  ) {
    filterOptions.classList.remove("show");
  }
});