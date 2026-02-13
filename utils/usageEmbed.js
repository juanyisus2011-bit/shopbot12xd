const { EmbedBuilder } = require("discord.js");

module.exports = function usageEmbed(command, usage) {
  return new EmbedBuilder()
    .setColor("#ED4245")
    .setDescription(
      `⚠️ **Incorrect usage**\n\n` +
      `\`${command} ${usage}\``
    );
};
