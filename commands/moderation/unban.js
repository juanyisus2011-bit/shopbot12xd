const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const modActionEmbed = require("../../utils/modActionEmbed");
const usageEmbed = require("../../utils/usageEmbed");

const randomColor = () => Math.floor(Math.random() * 0xffffff);

module.exports = {
  name: "unban",

  async execute(message, args) {

    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      const embed = new EmbedBuilder()
        .setColor(randomColor())
        .setDescription(
          "⚠️ **Missing Permissions**\n\n" +
          "You don't have permission to unban members.\n\n" +
          "**Required Permission:**\n" +
          "`Ban Members`"
        );

      return message.channel.send({ embeds: [embed] });
    }

    if (!args[0]) {
      const embed = usageEmbed(",unban", "<id | name#1234> [reason]");
      embed.setColor(randomColor());
      return message.channel.send({ embeds: [embed] });
    }

    const reason = args.slice(1).join(" ") || "Not specified";

    const bans = await message.guild.bans.fetch();
    let bannedUser = null;

    // 1️⃣ ID
    if (/^\d{17,20}$/.test(args[0])) {
      bannedUser = bans.get(args[0]);
    }

    // 2️⃣ name#1234
    if (!bannedUser) {
      bannedUser = bans.find(b =>
        `${b.user.username}#${b.user.discriminator}`.toLowerCase() ===
        args[0].toLowerCase()
      );
    }

    // ❌ Not found
    if (!bannedUser) {
      const embed = new EmbedBuilder()
        .setColor(randomColor())
        .setDescription(
          "❌ **User Not Found**\n\n" +
          "That user is not in the ban list."
        );

      return message.channel.send({ embeds: [embed] });
    }

    await message.guild.members.unban(bannedUser.user.id, reason);

    const actionEmbed = modActionEmbed({
      action: "Unbanned",
      user: bannedUser.user,
      reason,
      moderator: message.author
    });

    actionEmbed.setColor(randomColor());

    await message.channel.send({ embeds: [actionEmbed] });
  }
};
