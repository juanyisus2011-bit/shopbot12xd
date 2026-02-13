const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const messageDeleteEvent = require("../../events/messageDelete");

module.exports = {
  name: "snipe",
  description: "Shows manually deleted messages by number.",

  async execute(message, args) {

    // 🔒 Permission check
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      const embed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setDescription(
          "⚠️ **Missing Permissions**\n\n" +
          "You do not have permission to view deleted messages.\n\n" +
          "**Required Permission:**\n" +
          "`Manage Messages`"
        );

      return message.channel.send({ embeds: [embed] });
    }

    const snipes = messageDeleteEvent.snipesCollection;
    const channelSnipes = snipes.get(message.channel.id);

    // ❌ No deleted messages
    if (!channelSnipes || channelSnipes.length === 0) {
      const embed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setDescription("ℹ️ There are no recent deleted messages in this channel.");

      return message.channel.send({ embeds: [embed] });
    }

    // 📌 Snipe index
    const index = args[0] ? parseInt(args[0]) - 1 : 0;
    if (index < 0 || index >= channelSnipes.length) {
      const embed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setDescription(
          `ℹ️ There are only **${channelSnipes.length}** deleted messages available in this channel.`
        );

      return message.channel.send({ embeds: [embed] });
    }

    const sniped = channelSnipes[index];

    // 🔒 Ignore self-deleted messages
    if (sniped.authorId === sniped.deleter?.id) {
      const embed = new EmbedBuilder()
        .setColor(0xed4245)
        .setDescription("❌ This message was deleted by its author and cannot be sniped.");

      return message.channel.send({ embeds: [embed] });
    }

    const secondsAgo = Math.floor((Date.now() - sniped.deletedAt) / 1000);

    // 💬 SNIPE EMBED
    const embed = new EmbedBuilder()
      .setColor(0xffffff) // white embed like the screenshot
      .setTitle(`💬 Deleted Message (Snipe #${index + 1})`)
      .addFields(
        {
          name: "Author",
          value: `${sniped.author}`,
          inline: true
        },
        {
          name: "Deleted",
          value: `${secondsAgo} seconds ago`,
          inline: true
        },
        {
          name: "Deleted By",
          value: sniped.deleter ? sniped.deleter.tag : "Unknown",
          inline: true
        },
        {
          name: "Message Content",
          value: sniped.content || "`[Attachment / Embed]`",
          inline: false
        },
        {
          name: "Original Time",
          value: `<t:${Math.floor(sniped.createdAt.getTime() / 1000)}:F>`,
          inline: false
        }
      )
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });

    // 🧹 Remove sniped message so it can't be reused
    channelSnipes.splice(index, 1);
    snipes.set(message.channel.id, channelSnipes);
  },
};
