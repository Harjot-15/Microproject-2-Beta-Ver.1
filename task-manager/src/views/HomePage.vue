<template>
  <div class="container">
    <h1>Welcome to Task Manager</h1>
    <p>Organize your tasks efficiently and never miss a deadline!</p>
    <router-link to="/dashboard" class="btn btn-primary">Go to Dashboard</router-link>
  </div>
</template>

<script>
// eslint-disable-next-line vue/multi-word-component-names
export default {
  name: 'Home',
};
</script>

<style scoped>
.container {
  text-align: center;
  margin-top: 100px;
}
</style>
