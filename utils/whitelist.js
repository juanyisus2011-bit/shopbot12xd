module.exports = {
  users: new Map(),
  roles: new Map(),

  // ================= USER =================
  addUser(userId, category) {
    if (!this.users.has(userId)) {
      this.users.set(userId, new Set());
    }
    this.users.get(userId).add(category);
  },

  removeUser(userId, category) {
    if (!this.users.has(userId)) return;

    if (category === "all") {
      this.users.delete(userId);
      return;
    }

    const set = this.users.get(userId);
    set.delete(category);

    if (set.size === 0) {
      this.users.delete(userId);
    }
  },

  // ================= ROLE =================
  addRole(roleId, category) {
    if (!this.roles.has(roleId)) {
      this.roles.set(roleId, new Set());
    }
    this.roles.get(roleId).add(category);
  },

  removeRole(roleId, category) {
    if (!this.roles.has(roleId)) return;

    if (category === "all") {
      this.roles.delete(roleId);
      return;
    }

    const set = this.roles.get(roleId);
    set.delete(category);

    if (set.size === 0) {
      this.roles.delete(roleId);
    }
  },

  // ================= CHECK USER =================
  isWhitelistedUser(userId, category) {
    if (!this.users.has(userId)) return false;
    const categories = this.users.get(userId);
    return categories.has("all") || categories.has(category);
  },

  // ================= CHECK ROLE =================
  isWhitelistedRole(member, category) {
    return member.roles.cache.some(role => {
      if (!this.roles.has(role.id)) return false;
      const categories = this.roles.get(role.id);
      return categories.has("all") || categories.has(category);
    });
  }
};
