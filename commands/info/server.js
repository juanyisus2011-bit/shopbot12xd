const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "server",

  async execute(message) {
    const { guild } = message;

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: "🆔 ID", value: guild.id, inline: true },
        { name: "👑 Owner", value: `<@${guild.ownerId}>`, inline: true },
        { name: "👥 Members", value: `${guild.memberCount}`, inline: true },
        {
          name: "📊 Channels",
          value: `${guild.channels.cache.filter(c => c.isTextBased()).size} text\n${guild.channels.cache.filter(c => c.type === 2).size} voice`,
          inline: true
        },
        { name: "🎭 Roles", value: `${guild.roles.cache.size}`, inline: true },
        { name: "🚀 Boosts", value: `Level ${guild.premiumTier}\n${guild.premiumSubscriptionCount || 0} boosts`, inline: true },
        { name: "📅 Created", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
