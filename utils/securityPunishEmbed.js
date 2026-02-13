const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("./securityConfig");

module.exports = function securityPunishEmbed({
  user,
  reason,
  punishment
}) {
  return new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle(" User Punished")
    .addFields(
      {
        name: "User:",
        value: `${user.tag}\n${user.id}`,
        inline: false
      },
      {
        name: "Reason:",
        value: reason,
        inline: false
      },
      {
        name: "Punishment Type:",
        value: punishment,
        inline: false
      }
    )
    .setTimestamp();
};
