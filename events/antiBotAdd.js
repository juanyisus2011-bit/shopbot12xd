const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const whitelist = require("../utils/whitelist");

const LOG_CHANNEL_ID = "1470979029162262610";
const SECURITY_OWNER_ID = "1402724870160257130";

module.exports = {
  name: "guildMemberAdd",

  async execute(member, client) {
    if (!member.user.bot) return;

    const guild = member.guild;

    try {
      const logs = await guild.fetchAuditLogs({
        type: AuditLogEvent.BotAdd,
        limit: 1
      });

      const entry = logs.entries.first();
      if (!entry) return;

      const executor = entry.executor;
      if (!executor) return;

      // ⏱ Ignore old audit log entries
      if (Date.now() - entry.createdTimestamp > 10000) return;

      // 🔎 Make sure this log matches the bot added
      if (entry.target.id !== member.id) return;

      const memberExec = await guild.members.fetch(executor.id).catch(() => null);
      if (!memberExec) return;

      // 🔐 IGNORE SYSTEM
      if (executor.id === guild.ownerId) return;
      if (executor.id === guild.members.me.id) return;

      if (whitelist.isWhitelistedUser(executor.id, "botAdd")) return;
      if (whitelist.isWhitelistedRole(memberExec, "botAdd")) return;

      // 🚨 Ban executor
      await guild.members.ban(executor.id, {
        reason: "Anti Nuke: Adding Bots"
      }).catch(() => {});

      // 🚨 Ban the added bot
      await guild.members.ban(member.id, {
        reason: "Unauthorized Bot"
      }).catch(() => {});

      const embed = new EmbedBuilder()
        .setColor("#3498DB")
        .setTitle("User Punished")
        .addFields(
          { name: "User", value: `${executor.tag}\n${executor.id}` },
          { name: "Reason", value: `Adding Bot (${member.user.tag})` },
          { name: "Punishment Type", value: "Ban" }
        )
        .setTimestamp();

      const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) logChannel.send({ embeds: [embed] });

      const securityUser = await client.users.fetch(SECURITY_OWNER_ID).catch(() => null);
      if (securityUser) securityUser.send({ embeds: [embed] }).catch(() => {});

    } catch (err) {
      console.log("AntiBotAdd error:", err);
    }
  }
};
