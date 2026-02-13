const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("./securityConfig");

module.exports = function securityWarningEmbed({
  user,
  reason,
  remaining
}) {
  return new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle(" User Warning")
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
        name: "Remaining Attempts:",
        value: `${remaining}`,
        inline: false
      }
    )
    .setTimestamp();
};
