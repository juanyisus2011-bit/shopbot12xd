const { EmbedBuilder, AuditLogEvent } = require("discord.js");

const LOG_CHANNEL_ID = "1470808028772176039"; // Logs channel

module.exports = {
  execute: async (client) => {
    // =========================
    // 1️⃣ Ban
    // =========================
    client.on("guildBanAdd", async (ban) => {
      const { guild, user } = ban;

      let executor = { tag: "Unknown", id: "N/A" };
      let reason = "Not specified";

      try {
        const logs = await guild.fetchAuditLogs({
          type: AuditLogEvent.MemberBanAdd,
          limit: 1,
        });
        const entry = logs.entries.first();
        if (entry && entry.target.id === user.id) {
          executor = entry.executor;
          reason = entry.reason || reason;
        }
      } catch (err) {
        console.log("Could not fetch ban logs:", err);
      }

      const embed = new EmbedBuilder()
        .setTitle("🔒 Member Banned")
        .setColor("Red")
        .addFields(
          { name: "Banned User", value: `${user} (${user.tag})` },
          { name: "Banned By", value: `${executor.tag} (${executor.id})` },
          { name: "Reason", value: reason }
        )
        .setTimestamp();

      const channel = guild.channels.cache.get(LOG_CHANNEL_ID);
      if (channel) channel.send({ embeds: [embed] });
    });

    // =========================
    // 2️⃣ Unban
    // =========================
    client.on("guildBanRemove", async (ban) => {
      const { guild, user } = ban;

      let executor = { tag: "Unknown", id: "N/A" };
      let reason = "Not specified";

      try {
        const logs = await guild.fetchAuditLogs({
          type: AuditLogEvent.MemberBanRemove,
          limit: 1,
        });
        const entry = logs.entries.first();
        if (entry && entry.target.id === user.id) {
          executor = entry.executor;
          reason = entry.reason || reason;
        }
      } catch (err) {
        console.log("Could not fetch unban logs:", err);
      }

      const embed = new EmbedBuilder()
        .setTitle("🔓 Member Unbanned")
        .setColor("Green")
        .addFields(
          { name: "Unbanned User", value: `${user} (${user.tag})` },
          { name: "Unbanned By", value: `${executor.tag} (${executor.id})` },
          { name: "Reason", value: reason }
        )
        .setTimestamp();

      const channel = guild.channels.cache.get(LOG_CHANNEL_ID);
      if (channel) channel.send({ embeds: [embed] });
    });

    // =========================
    // 3️⃣ Kick
    // =========================
    client.on("guildMemberRemove", async (member) => {
      const { guild, user } = member;

      // Differentiate kick from voluntary leave
      let executor = { tag: "Unknown", id: "N/A" };
      let reason = "Not specified";

      try {
        const logs = await guild.fetchAuditLogs({
          type: AuditLogEvent.MemberKick,
          limit: 1,
        });
        const entry = logs.entries.first();
        if (entry && entry.target.id === user.id) {
          executor = entry.executor;
          reason = entry.reason || reason;
        } else {
          return; // voluntary leave
        }
      } catch (err) {
        console.log("Could not fetch kick logs:", err);
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle("👢 Member Kicked")
        .setColor("Orange")
        .addFields(
          { name: "Kicked User", value: `${user} (${user.tag})` },
          { name: "Kicked By", value: `${executor.tag} (${executor.id})` },
          { name: "Reason", value: reason }
        )
        .setTimestamp();

      const channel = guild.channels.cache.get(LOG_CHANNEL_ID);
      if (channel) channel.send({ embeds: [embed] });
    });
  },
};
