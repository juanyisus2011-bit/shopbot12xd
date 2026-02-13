const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "w",
  async execute(message) {
    // Target user (mention or author)
    const member =
      message.mentions.members.first() || message.member;

    const user = member.user;

    // Status
    const statusMap = {
      online: "🟢 Online",
      idle: "🌙 Idle",
      dnd: "⛔ Do Not Disturb",
      offline: "⚫ Offline",
    };

    const status =
      statusMap[member.presence?.status] || "⚫ Offline";

    // Roles (excluding @everyone)
    const roles = member.roles.cache
      .filter(r => r.id !== message.guild.id)
      .map(r => `<@&${r.id}>`)
      .join(" ") || "None";

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL(),
      })
      .setThumbnail(user.displayAvatarURL({ size: 512 }))
      .addFields(
        {
          name: "🟢 Status",
          value: status,
        },
        {
          name: "📅 Joined",
          value:
            `**Discord:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>\n` +
            `**Server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
        },
        {
          name: "🎭 Roles",
          value: roles,
        }
      )
      .setFooter({
        text: `ID: ${user.id}`,
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
