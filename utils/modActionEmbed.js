const { EmbedBuilder } = require("discord.js");

module.exports = function modActionEmbed({
  action,       // "Banned", "Kicked", etc
  user,         // user object
  reason,       // string
  moderator     // message.author
}) {
  return new EmbedBuilder()
    .setColor("#ED4245")
    .setTitle(`⛔ User ${action}`)
    .addFields(
      {
        name: " User",
        value: `${user.tag}\n\`${user.id}\``,
        inline: false
      },
      {
        name: " Reason",
        value: reason || "No reason provided",
        inline: false
      }
    )
    .setFooter({
      text: `Action by ${moderator.tag} • ${new Date().toLocaleString()}`
    });
};
