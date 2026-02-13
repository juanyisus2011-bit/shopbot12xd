const jailedUsers = new Map();

module.exports = {
  save(userId, roles) {
    jailedUsers.set(userId, roles);
  },

  get(userId) {
    return jailedUsers.get(userId);
  },

  remove(userId) {
    jailedUsers.delete(userId);
  }
};