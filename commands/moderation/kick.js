const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { checkHierarchy } = require("../../utils/moderationChecks");
const modActionEmbed = require("../../utils/modActionEmbed");
const usageEmbed = require("../../utils/usageEmbed");

const RED = 0xED4245;

module.exports = {
  name: "kick",

  async execute(message, args) {

    // ❌ No permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription(
              "⚠️ You do not have sufficient permissions to use this command.\n\n" +
              "**Required permission:** `Kick Members`"
            )
        ]
      });
    }

    // ❌ No arguments
    if (!args[0]) {
      const embed = usageEmbed(",kick", "<user/id/name#1234> [reason]");
      embed.setColor(RED);
      return message.channel.send({ embeds: [embed] });
    }

    let member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    // 🔍 Search by username or name#1234
    if (!member) {
      const search = args[0].toLowerCase();
      member = message.guild.members.cache.find(m =>
        m.user.username.toLowerCase() === search ||
        `${m.user.username.toLowerCase()}#${m.user.discriminator}` === search
      );
    }

    // ❌ User not found
    if (!member) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription("❌ User not found in this server.")
        ]
      });
    }

    // ❌ Self kick
    if (member.id === message.author.id) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription("❌ You cannot kick yourself.")
        ]
      });
    }

    // ❌ Server owner
    if (member.id === message.guild.ownerId) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription("❌ You cannot kick the server owner.")
        ]
      });
    }

    // 🔐 User hierarchy
    if (member.roles.highest.position >= message.member.roles.highest.position) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription(
              "❌ You cannot kick a member with an equal or higher role than yours."
            )
        ]
      });
    }

    // 🤖 Bot hierarchy
    if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription(
              "❌ I cannot kick this user because their role is higher than mine."
            )
        ]
      });
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      await member.send({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setTitle("🚪 You have been kicked")
            .addFields(
              { name: " Server", value: message.guild.name },
              { name: " Reason", value: reason },
              { name: " Moderator", value: message.author.tag }
            )
            .setFooter({
              text: "If you believe this was a mistake, please contact a server administrator."
            })
        ]
      });
    } catch (err) {
      console.log("Could not DM the user.");
    }

    await member.kick(reason);

    const actionEmbed = modActionEmbed({
      action: "Kicked",
      user: member.user,
      reason,
      moderator: message.author
    });

    actionEmbed.setColor(RED);

    await message.channel.send({
      embeds: [actionEmbed]
    });
  }
};
