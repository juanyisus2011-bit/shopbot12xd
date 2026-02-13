const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const modActionEmbed = require("../../utils/modActionEmbed");
const usageEmbed = require("../../utils/usageEmbed");

const EMBED_COLOR = "#ED4245"; // 🔴 Red for all embeds

module.exports = {
  name: "ban",

  async execute(message, args) {
    if (message.author.bot) return;

    // =====================
    // PERMISSIONS
    // =====================
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription(
              "⚠️ **You do not have sufficient permissions to use this command.**\n\n" +
              "**Required permission:** `Ban Members`"
            )
        ]
      });
    }

    // =====================
    // USAGE
    // =====================
    if (!args[0]) {
      return message.channel.send({
        embeds: [usageEmbed(",ban", "<user | id> [reason]")]
      });
    }

    const reason = args.slice(1).join(" ") || "Not specified";
    const query = args[0];

    let member = null;
    let user = null;

    // =====================
    // MENTION
    // =====================
    member = message.mentions.members.first();

    // =====================
    // ID
    // =====================
    if (!member && /^\d{17,20}$/.test(query)) {
      user = await message.client.users.fetch(query).catch(() => null);
      if (user) {
        member = await message.guild.members.fetch(user.id).catch(() => null);
      }
    }

    // =====================
    // USERNAME (cache)
    // =====================
    if (!member && !user) {
      user = message.client.users.cache.find(u =>
        u.username.toLowerCase() === query.toLowerCase()
      );
      if (user) {
        member = await message.guild.members.fetch(user.id).catch(() => null);
      }
    }

    if (!member && !user) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription(
              " User not found.\nUse **ID**, **mention**, or the user must be in the bot cache."
            )
        ]
      });
    }

    // =====================
    // HIERARCHY CHECKS
    // =====================
    if (member) {
      if (member.id === message.guild.ownerId) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(" You cannot ban the server owner.")
          ]
        });
      }

      if (
        member.roles.highest.position >= message.member.roles.highest.position &&
        message.author.id !== message.guild.ownerId
      ) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(
                " You cannot ban a user with an equal or higher role than you."
              )
          ]
        });
      }

      if (
        member.roles.highest.position >=
        message.guild.members.me.roles.highest.position
      ) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(
                " I cannot ban this user due to role hierarchy."
              )
          ]
        });
      }
    }

    // =====================
    // 📩 DM (only if in server)
    // =====================
    if (member) {
      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle("🚫 You have been banned")
          .setColor(EMBED_COLOR)
          .addFields(
            { name: "Server", value: message.guild.name },
            { name: "Reason", value: reason }
          )
          .setTimestamp();

        await member.send({ embeds: [dmEmbed] });
      } catch {
        // DMs closed
      }
    }

    // =====================
    // 🔨 FINAL BAN
    // =====================
    if (member) {
      await member.ban({ reason, deleteMessageDays: 7 });
    } else {
      await message.guild.bans.create(user.id, {
        reason,
        deleteMessageDays: 7
      });
    }

    // =====================
    // ✅ CONFIRMATION
    // =====================
    await message.channel.send({
      embeds: [
        modActionEmbed({
          action: "User Banned",
          user: member?.user || user,
          reason,
          moderator: message.author,
          color: EMBED_COLOR
        })
      ]
    });
  }
};
