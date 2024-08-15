Vue.component('todo-list', {
    data: function () {
        // Initialize the component's data properties
        const colors = ['#2de6da', '#dfa4a4', '#5becc0', '#3bf75a']; // Array of color options for labels
        return {
            tasks: [], // Array to store all tasks
            showModal: true, // Boolean to control the visibility of the task modal
            currentTask: null, // Object to hold the task being created or edited
            showDescriptionModal: false, // Boolean to control the visibility of the description modal
            labels: ['Work', 'Personal', 'Home', 'Urgent'], // Default labels for tasks
            newLabelInput: '', // String to hold the input value for a new label
            showLabelInput: false, // Boolean to control the visibility of the label input form
            labelColors: {
                // Object to map each label to a randomly selected color
                'Work': colors[Math.floor(Math.random() * colors.length)],
                'Personal': colors[Math.floor(Math.random() * colors.length)],
                'Home': colors[Math.floor(Math.random() * colors.length)],
                'Urgent': colors[Math.floor(Math.random() * colors.length)]
            },
            selectedColor: '#f8f9fa', // Default color for new labels
            draggedLabelIndex: null // To track the index of the label being dragged
        };
    },
    computed: {
        // Computed property to filter and return tasks with priority set to true
        priorityTasks() {
            return this.tasks.filter(task => task.priority);
        },
        // Computed property to filter and return tasks without priority or labels
        normalTasks() {
            return this.tasks.filter(task => !task.priority && !task.label);
        },
        // Computed property to group tasks by their labels
        labeledTasks() {
            const labels = this.tasks.reduce((acc, task) => {
                if (task.label && !task.priority) {
                    if (!acc[task.label]) acc[task.label] = [];
                    acc[task.label].push(task);
                }
                return acc;
            }, {});
            return labels;
        }
    },
    methods: {
        // Method to open the modal for adding or editing a task
        openModal(task) {
            this.currentTask = task ? { ...task } : {
                title: '',
                description: '',
                dueDate: '',
                label: '',
                priority: false,
                reminder: false
            };
            this.showModal = true;
        },
        // Method to save the task, either updating an existing one or adding a new one
        saveTask() {
            if (this.currentTask.id) {
                const index = this.tasks.findIndex(t => t.id === this.currentTask.id);
                this.$set(this.tasks, index, this.currentTask);
            } else {
                this.currentTask.id = Date.now(); // Assign a unique ID based on the current timestamp
                this.tasks.push(this.currentTask);
            }
            this.showModal = false;
        },
        // Method to toggle the completion status of a task
        toggleCompletion(task) {
            task.completed = !task.completed;
        },
        // Method to remove a task from the list
        removeTask(task) {
            this.tasks = this.tasks.filter(t => t.id !== task.id);
        },
        // Method to toggle the priority status of a task
        togglePriority(task) {
            task.priority = !task.priority;
            if (task.priority && task.label) {
                task.backgroundColor = this.labelColors[task.label];
            } else if (!task.priority && task.label) {
                task.backgroundColor = this.labelColors[task.label];
            }
        },
        // Method to display the task description in a modal
        showDescription(task) {
            this.currentTask = task;
            this.showDescriptionModal = true;
        },
        // Method to close the description modal
        closeDescriptionModal() {
            this.showDescriptionModal = false;
            this.currentTask = null;
        },
        // Method to add a new label to the list
        addLabel() {
            if (this.newLabelInput && !this.labels.includes(this.newLabelInput)) {
                this.labels.push(this.newLabelInput);
                this.$set(this.labelColors, this.newLabelInput, this.selectedColor); // Add real-time color change support
                this.newLabelInput = ''; // Reset input field
                this.selectedColor = '#f8f9fa'; // Reset selected color
                this.showLabelInput = false; // Hide the label input form
            }
        },
        // Method to add a label from within the task modal
        addLabelFromModal() {
            if (this.currentTask.label && !this.labels.includes(this.currentTask.label)) {
                this.labels.push(this.currentTask.label);
                this.labelColors[this.currentTask.label] = this.selectedColor;
            }
        },
        // Method to edit an existing label
        editLabel(index) {
            const newLabel = prompt("Enter a new name for the label:", this.labels[index]);
            if (newLabel && !this.labels.includes(newLabel)) {
                const oldLabel = this.labels[index];
                this.$set(this.labels, index, newLabel);
                this.$set(this.labelColors, newLabel, this.labelColors[oldLabel]);
                this.$delete(this.labelColors, oldLabel);

                // Update tasks with the new label
                this.tasks.forEach(task => {
                    if (task.label === oldLabel) {
                        task.label = newLabel;
                    }
                });
            }
        },
        // Method to delete a label and remove it from associated tasks
        deleteLabel(index) {
            const labelToDelete = this.labels[index];
            if (confirm(`Are you sure you want to delete the label '${labelToDelete}'?`)) {
                this.labels.splice(index, 1);
                this.$delete(this.labelColors, labelToDelete);

                // Remove label from tasks
                this.tasks.forEach(task => {
                    if (task.label === labelToDelete) {
                        task.label = '';
                    }
                });
            }
        },
        // Method to handle the start of a label drag event
        dragStartLabel(event, index) {
            this.draggedLabelIndex = index;
        },
        // Method to handle the drop event after dragging a label
        dropLabel(event, index) {
            const draggedLabel = this.labels[this.draggedLabelIndex];
            this.labels.splice(this.draggedLabelIndex, 1);
            this.labels.splice(index, 0, draggedLabel);
            this.draggedLabelIndex = null;
        },
        // Method to allow a label to be dragged over another label
        dragOverLabel(event) {
            event.preventDefault();
        },
        // Method to handle the start of a task drag event
        dragStart(event, task) {
            event.dataTransfer.setData('taskId', task.id);
        },
        // Method to allow a task to be dragged over a different section
        dragOver(event) {
            event.preventDefault();
        },
        // Method to handle the drop event after dragging a task
        drop(event, section) {
            event.preventDefault();
            const taskId = event.dataTransfer.getData('taskId');
            const taskIndex = this.tasks.findIndex(task => task.id == taskId);
            if (taskIndex !== -1) {
                const task = this.tasks[taskIndex];
                this.tasks.splice(taskIndex, 1);
                if (section === 'priority') {
                    task.priority = true;
                    if (task.label) {
                        task.backgroundColor = this.labelColors[task.label];
                    }
                } else if (section === 'normal') {
                    task.priority = false;
                    task.label = '';
                } else if (this.labels.includes(section)) {
                    task.priority = false;
                    task.label = section;
                    task.backgroundColor = this.labelColors[task.label];
                }
                this.tasks.push(task);
            }
        },
        // Method to change the color of a specific label
        changeLabelColor(label) {
            const newColor = prompt("Enter a color (e.g., #ffeb3b):", this.labelColors[label]);
            if (newColor) {
                this.$set(this.labelColors, label, newColor);
            }
        },
        // Method to calculate the appropriate text color based on the label background color
        calculateTextColor(color) {
            if (!color) return 'dark-text';
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance > 0.5 ? 'dark-text' : 'light-text';
        },
        // Method to clear the modal and reset currentTask
        clearModal() {
            this.showModal = false;
            this.currentTask = null;
        }
    },
    template: `
        <div class="todo-list">
            <!-- Button to open the task modal -->
            <button @click="openModal()">Add Task</button>
            <!-- Button to toggle the visibility of the label input form -->
            <button @click="showLabelInput = !showLabelInput">Add Label</button>
            <!-- Label input form -->
            <div v-if="showLabelInput" class="label-input">
                <input v-model="newLabelInput" placeholder="New Label">
                <input type="color" v-model="selectedColor">
                <button @click="addLabel">Save Label</button>
            </div>

            <!-- Label settings section -->
            <section class="label-settings">
                <h3>🎨 Label Settings</h3>
                <div class="label-card">
                    <div class="label-item" v-for="(label, index) in labels" :key="label">
                        <span>{{ label }}</span>
                        <input type="color" v-model="labelColors[label]" @change="changeLabelColor(label)">
                        <button class="edit-button" @click="editLabel(index)">Edit</button>
                        <button class="delete-button" @click="deleteLabel(index)">Delete</button>
                    </div>
                </div>
            </section>

            <!-- Task sections -->
            <div class="task-sections">
                <!-- Priority tasks section -->
                <section class="priority-tasks" @dragover="dragOver" @drop="drop($event, 'priority')">
                    <h3>⭐ Priority Tasks</h3>
                    <ul>
                        <li v-for="(task, index) in priorityTasks" :key="task.id" :style="{ backgroundColor: task.label ? labelColors[task.label] : '' }" :class="{ completed: task.completed }" draggable="true" @dragstart="dragStart($event, task)">
                            <div class="task-info">
                                <span>📋 {{ index + 1 }}. {{ task.title }}</span>
                                <small>📅 {{ task.dueDate }}</small>
                                <button class="description-button" @click="showDescription(task)">Description</button>
                                <div @click="togglePriority(task)" class="star-icon" :class="{ filled: task.priority }">
                                    <svg v-if="task.priority" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="green"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.983 1.455 8.311-7.391-4.002-7.391 4.002 1.455-8.311-6.064-5.983 8.332-1.151z"/></svg>
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.983 1.455 8.311-7.391-4.002-7.391 4.002 1.455-8.311-6.064-5.983 8.332-1.151z"/></svg>
                                </div>
                            </div>
                            <div class="task-actions">
                                <button @click="openModal(task)">Edit</button>
                                <button @click="removeTask(task)">Delete</button>
                            </div>
                        </li>
                    </ul>
                </section>
                <!-- Normal tasks section -->
                <section class="normal-tasks" @dragover="dragOver" @drop="drop($event, 'normal')">
                    <h3>🗒️ Normal Tasks</h3>
                    <ul>
                        <li v-for="(task, index) in normalTasks" :key="task.id" :class="{ completed: task.completed }" draggable="true" @dragstart="dragStart($event, task)">
                            <div class="task-info">
                                <span>📋 {{ index + 1 }}. {{ task.title }}</span>
                                <small>📅 {{ task.dueDate }}</small>
                                <button class="description-button" @click="showDescription(task)">Description</button>
                                <div @click="togglePriority(task)" class="star-icon" :class="{ filled: task.priority }">
                                    <svg v-if="task.priority" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="green"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.983 1.455 8.311-7.391-4.002-7.391 4.002 1.455-8.311-6.064-5.983 8.332-1.151z"/></svg>
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.983 1.455 8.311-7.391-4.002-7.391 4.002 1.455-8.311-6.064-5.983 8.332-1.151z"/></svg>
                                </div>
                            </div>
                            <div class="task-actions">
                                <button @click="openModal(task)">Edit</button>
                                <button @click="removeTask(task)">Delete</button>
                            </div>
                        </li>
                    </ul>
                </section>
            </div>
            <!-- Labeled tasks section -->
            <section class="labeled-tasks">
                <h3>🏷️ Labeled Tasks</h3>
                <div class="label-columns">
                    <div v-for="(tasks, label) in labeledTasks" :key="label" class="label-column" :style="{ backgroundColor: labelColors[label], color: calculateTextColor(labelColors[label]) }" @dragover="dragOver" @drop="drop($event, label)">
                        <h4>{{ label }}</h4>
                        <ul>
                            <li v-for="(task, index) in tasks" :key="task.id" :class="{ completed: task.completed }" draggable="true" @dragstart="dragStart($event, task)">
                                <div class="task-info">
                                    <span>📋 {{ index + 1 }}. {{ task.title }}</span>
                                    <small>📅 {{ task.dueDate }}</small>
                                    <button class="description-button" @click="showDescription(task)">Description</button>
                                    <div @click="togglePriority(task)" class="star-icon" :class="{ filled: task.priority }">
                                        <svg v-if="task.priority" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="green"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.983 1.455 8.311-7.391-4.002-7.391 4.002 1.455-8.311-6.064-5.983 8.332-1.151z"/></svg>
                                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.983 1.455 8.311-7.391-4.002-7.391 4.002 1.455-8.311-6.064-5.983 8.332-1.151z"/></svg>
                                    </div>
                                </div>
                                <div class="task-actions">
                                    <button @click="openModal(task)">Edit</button>
                                    <button @click="removeTask(task)">Delete</button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- Task modal for adding/editing a task -->
            <div v-if="showModal" class="modal">
                <div class="modal-content">
                    <h3>{{ currentTask.id ? 'Edit Task' : 'Add Task' }}</h3>
                    <input v-model="currentTask.title" placeholder="Title">
                    <textarea v-model="currentTask.description" placeholder="Description"></textarea>
                    <input type="date" v-model="currentTask.dueDate">
                    <select v-model="currentTask.label" @change="addLabelFromModal">
                        <option value="">No Label</option>
                        <option v-for="label in labels" :key="label" :value="label">{{ label }}</option>
                    </select>
                    <div class="priority-toggle">
                        <span>⭐ Priority</span>
                        <div @click="togglePriority(currentTask)" class="star-icon" :class="{ filled: currentTask.priority }">
                            <svg v-if="currentTask.priority" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="green"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.983 1.455 8.311-7.391-4.002-7.391 4.002 1.455-8.311-6.064-5.983 8.332-1.151z"/></svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.983 1.455 8.311-7.391-4.002-7.391 4.002 1.455-8.311-6.064-5.983 8.332-1.151z"/></svg>
                        </div>
                    </div>
                    <label>Set Reminder</label>
                    <label class="toggle-switch">
                        <input type="checkbox" v-model="currentTask.reminder">
                        <span class="slider"></span>
                    </label>
                    <button @click="saveTask">{{ currentTask.id ? 'Save Changes' : 'Add Task' }}</button>
                    <button @click="clearModal">Cancel</button>
                </div>
            </div>

            <!-- Modal to display the task description -->
            <div v-if="showDescriptionModal" class="modal">
                <div class="modal-content">
                    <h3>Description</h3>
                    <p>{{ currentTask.description }}</p>
                    <button @click="closeDescriptionModal">Close</button>
                </div>
            </div>
        </div>
    `
});
