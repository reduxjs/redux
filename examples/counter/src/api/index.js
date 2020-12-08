export default {
  fetchTasks: () => {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        reject(1);
      }, 1);
    });
  }
};
