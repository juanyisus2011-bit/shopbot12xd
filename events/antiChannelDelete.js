const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const whitelist = require("../utils/whitelist");

const LOG_CHANNEL_ID = "1470979029162262610";
const SECURITY_OWNER_ID = "1402724870160257130";

module.exports = {
  name: "channelDelete",

  async execute(channel, client) {
    const guild = channel.guild;

    try {
      const logs = await guild.fetchAuditLogs({
        type: AuditLogEvent.ChannelDelete,
        limit: 1
      });

      const entry = logs.entries.first();
      if (!entry) return;

      const executor = entry.executor;
      if (!executor) return;

      const memberExec = await guild.members.fetch(executor.id).catch(() => null);
      if (!memberExec) return;

      // 🔐 IGNORE SYSTEM
      if (executor.id === guild.ownerId) return;
      if (executor.id === guild.members.me.id) return;
      if (whitelist.isWhitelistedUser(executor.id, "channelDelete")) return;
      if (whitelist.isWhitelistedRole(memberExec, "channelDelete")) return;

      await guild.members.ban(executor.id, {
        reason: "Anti Nuke: Deleting Channels"
      }).catch(() => {});

      const embed = new EmbedBuilder()
        .setColor("#3498DB")
        .setTitle("User Punished")
        .addFields(
          { name: "User", value: `${executor.tag}\n${executor.id}` },
          { name: "Reason", value: "Deleting Channels" },
          { name: "Punishment Type", value: "Ban" }
        )
        .setTimestamp();

      const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) logChannel.send({ embeds: [embed] });

      const securityUser = await client.users.fetch(SECURITY_OWNER_ID).catch(() => null);
      if (securityUser) securityUser.send({ embeds: [embed] }).catch(() => {});

    } catch (err) {
      console.log("AntiChannelDelete error:", err);
    }
  }
};

