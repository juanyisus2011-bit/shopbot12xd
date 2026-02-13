const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("./securityConfig");

module.exports = function securityBanDMEmbed({
  server,
  user,
  action
}) {
  return new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle("User Punished")
    .setDescription(
      "**Security responded in no time!**\n" +
      "If you found our quick response helpful, we'd appreciate your feedback.\n\n" +
      "**Anti-Nuke has punished a user, details:**"
    )
    .addFields(
      { name: "Server:", value: server, inline: false },
      { name: "User:", value: user, inline: false },
      { name: "Action:", value: action, inline: false },
      { name: "Punishment Type:", value: "Ban", inline: false }
    )
    .setTimestamp();
};
