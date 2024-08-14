Vue.component('todo-list', {
    data: function () {
        return {
            tasks: [],
            showModal: false,
            currentTask: null,
            labels: ['Work', 'Personal'], // Default labels
            newLabelInput: '',
            showLabelInput: false,
            labelColors: {}, // Store label colors
            selectedColor: '#f8f9fa', // Default color for new labels
            colorOptions: ['#f8f9fa', '#ffeb3b', '#8bc34a', '#03a9f4', '#e91e63'] // Available colors
        };
    },
    computed: {
        priorityTasks() {
            return this.tasks.filter(task => task.priority);
        },
        normalTasks() {
            return this.tasks.filter(task => !task.priority && !task.label);
        },
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
        saveTask() {
            if (this.currentTask.id) {
                const index = this.tasks.findIndex(t => t.id === this.currentTask.id);
                this.$set(this.tasks, index, this.currentTask);
            } else {
                this.currentTask.id = Date.now();
                this.tasks.push(this.currentTask);
            }
            this.showModal = false;
        },
        toggleCompletion(task) {
            task.completed = !task.completed;
        },
        removeTask(task) {
            this.tasks = this.tasks.filter(t => t.id !== task.id);
        },
        togglePriority(task) {
            task.priority = !task.priority;
            // Remove label if moved to priority
            if (task.priority) {
                task.label = '';
            }
        },
        addLabel() {
            if (this.newLabelInput && !this.labels.includes(this.newLabelInput)) {
                this.labels.push(this.newLabelInput);
                this.labelColors[this.newLabelInput] = this.selectedColor;
                this.newLabelInput = '';
                this.selectedColor = '#f8f9fa';
                this.showLabelInput = false;
            }
        },
        addLabelFromModal() {
            if (this.currentTask.label && !this.labels.includes(this.currentTask.label)) {
                this.labels.push(this.currentTask.label);
                this.labelColors[this.currentTask.label] = this.selectedColor;
            }
        },
        dragStart(event, task) {
            event.dataTransfer.setData('taskId', task.id);
        },
        dragOver(event) {
            event.preventDefault();
        },
        drop(event, section) {
            event.preventDefault();
            const taskId = event.dataTransfer.getData('taskId');
            const taskIndex = this.tasks.findIndex(task => task.id == taskId);
            if (taskIndex !== -1) {
                const task = this.tasks[taskIndex];
                this.tasks.splice(taskIndex, 1);
                if (section === 'priority') {
                    task.priority = true;
                    task.label = '';
                } else if (section === 'normal') {
                    task.priority = false;
                    task.label = '';
                } else if (this.labels.includes(section)) {
                    task.priority = false;
                    task.label = section;
                }
                this.tasks.push(task);
            }
        },
        changeLabelColor(label) {
            const newColor = prompt("Enter a color (e.g., #ffeb3b):", this.labelColors[label]);
            if (newColor) {
                this.$set(this.labelColors, label, newColor);
            }
        },
        calculateTextColor(color) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance > 0.5 ? 'dark-text' : 'light-text';
        }
    },
    template: `
        <div class="todo-list">
            <button @click="openModal()">Add Task</button>
            <button @click="showLabelInput = !showLabelInput">Add Label</button>
            <div v-if="showLabelInput" class="label-input">
                <input v-model="newLabelInput" placeholder="New Label">
                <select v-model="selectedColor">
                    <option v-for="color in colorOptions" :value="color" :key="color" :style="{background: color}">{{ color }}</option>
                </select>
                <button @click="addLabel">Save Label</button>
            </div>
            
            <div class="task-sections">
                <section class="priority-tasks" @dragover="dragOver" @drop="drop($event, 'priority')">
                    <h3>⭐ Priority Tasks</h3>
                    <ul>
                        <li v-for="(task, index) in priorityTasks" :key="task.id" :class="{ completed: task.completed }" draggable="true" @dragstart="dragStart($event, task)">
                            <div class="task-info">
                                <span>📋 {{ index + 1 }}. {{ task.title }}</span>
                                <small>📅 {{ task.dueDate }}</small>
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
                <section class="normal-tasks" @dragover="dragOver" @drop="drop($event, 'normal')">
                    <h3>🗒️ Normal Tasks</h3>
                    <ul>
                        <li v-for="(task, index) in normalTasks" :key="task.id" :class="{ completed: task.completed }" draggable="true" @dragstart="dragStart($event, task)">
                            <div class="task-info">
                                <span>📋 {{ index + 1 }}. {{ task.title }}</span>
                                <small>📅 {{ task.dueDate }}</small>
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
            <section class="labeled-tasks">
                <h3>🏷️ Labeled Tasks</h3>
                <div class="label-columns">
                    <div v-for="(tasks, label) in labeledTasks" :key="label" class="label-column" :style="{ backgroundColor: labelColors[label], color: calculateTextColor(labelColors[label]) }" @dragover="dragOver" @drop="drop($event, label)">
                        <h4>{{ label }} <button @click="changeLabelColor(label)">Settings</button></h4>
                        <ul>
                            <li v-for="(task, index) in tasks" :key="task.id" :class="{ completed: task.completed }" draggable="true" @dragstart="dragStart($event, task)">
                                <div class="task-info">
                                    <span>📋 {{ index + 1 }}. {{ task.title }}</span>
                                    <small>📅 {{ task.dueDate }}</small>
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
                    <button @click="showModal = false">Cancel</button>
                </div>
            </div>
        </div>
    `
});
