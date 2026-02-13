module.exports = {
  checkHierarchy(message, targetMember) {
    // Owner bypass
    if (message.author.id === message.guild.ownerId) return true;

    // Cannot act on the server owner
    if (targetMember.id === message.guild.ownerId) {
      message.channel.send("❌ You cannot punish the server owner.");
      return false;
    }

    // Role hierarchy comparison
    if (
      targetMember.roles.highest.position >=
      message.member.roles.highest.position
    ) {
      message.channel.send(
        "❌ You cannot punish this user (owner or protected role)."
      );
      return false;
    }

    return true;
  }
};
