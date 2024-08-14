<template>
  <div class="container">
    <h1>Task Dashboard</h1>
    <div class="input-group mb-3">
      <input v-model="title" type="text" class="form-control" placeholder="Task Title">
      <input v-model="description" type="text" class="form-control" placeholder="Task Description">
      <div class="input-group-append">
        <button class="btn btn-outline-secondary" type="button" @click="addTask">Add Task</button>
      </div>
    </div>
    <TaskList />
  </div>
</template>

<script>
// eslint-disable-next-line vue/multi-word-component-names
export default {
  name: 'Dashboard',
  components: { TaskList },
  data() {
    return {
      title: '',
      description: ''
    };
  },
  methods: {
    addTask() {
      if (this.title && this.description) {
        const newTask = {
          id: Date.now(),
          title: this.title,
          description: this.description
        };
        this.$store.dispatch('addTask', newTask);
        this.title = '';
        this.description = '';
      }
    }
  }
};
</script>

<style scoped>
.container {
  margin-top: 50px;
}
</style>
