const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const whitelist = require("../utils/whitelist");

const LOG_CHANNEL_ID = "1470979029162262610";
const SECURITY_OWNER_ID = "1402724870160257130";

const banLimits = new Map();

module.exports = {
  name: "guildBanAdd",

  async execute(ban, client) {
    const { guild, user } = ban;

    try {
      const logs = await guild.fetchAuditLogs({
        type: AuditLogEvent.MemberBanAdd,
        limit: 1
      });

      const entry = logs.entries.first();
      if (!entry) return;

      const executor = entry.executor;
      if (!executor) return;

      // ⏱ Ignore old audit logs (más de 5 segundos)
      if (Date.now() - entry.createdTimestamp > 10000) return;

      // 🔎 Asegurar que el log corresponde al usuario baneado
      if (entry.target.id !== user.id) return;

      const memberExec = await guild.members.fetch(executor.id).catch(() => null);
      if (!memberExec) return;

      // 🔐 IGNORE SYSTEM
      if (executor.id === guild.ownerId) return;
      if (executor.id === guild.members.me.id) return;

      if (whitelist.isWhitelistedUser(executor.id, "ban")) return;
      if (whitelist.isWhitelistedRole(memberExec, "ban")) return;

      const now = Date.now();
      const limit = 2;
      const resetTime = 60 * 60 * 1000; // 1 hora

      if (!banLimits.has(executor.id)) {
        banLimits.set(executor.id, { count: 1, timestamp: now });
      } else {
        const data = banLimits.get(executor.id);

        if (now - data.timestamp > resetTime) {
          banLimits.set(executor.id, { count: 1, timestamp: now });
        } else {
          data.count += 1;
          banLimits.set(executor.id, data);
        }
      }

      const userData = banLimits.get(executor.id);
      const remaining = limit - userData.count;

      const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);

      // ⚠ WARNING
      if (userData.count < limit) {
        const warningEmbed = new EmbedBuilder()
          .setColor("#3498DB")
          .setTitle("User Warning")
          .addFields(
            { name: "User", value: `${executor.tag}\n${executor.id}` },
            { name: "Reason", value: "Banning Members" },
            { name: "Remaining Attempts", value: `${remaining}` }
          )
          .setTimestamp();

        if (logChannel) logChannel.send({ embeds: [warningEmbed] });
      }

      // 🚨 PUNISH
      if (userData.count >= limit) {
        await guild.members.ban(executor.id, {
          reason: "Anti Nuke: Ban Limit Exceeded"
        }).catch(() => {});

        const punishEmbed = new EmbedBuilder()
          .setColor("#3498DB")
          .setTitle("User Punished")
          .addFields(
            { name: "User", value: `${executor.tag}\n${executor.id}` },
            { name: "Reason", value: "Mass Banning" },
            { name: "Punishment Type", value: "Ban" }
          )
          .setTimestamp();

        if (logChannel) logChannel.send({ embeds: [punishEmbed] });

        // 📩 DM SOLO CUANDO ES CASTIGO
        const securityUser = await client.users.fetch(SECURITY_OWNER_ID).catch(() => null);
        if (securityUser) {
          securityUser.send({ embeds: [punishEmbed] }).catch(() => {});
        }

        banLimits.delete(executor.id);
      }

    } catch (err) {
      console.log("AntiBan error:", err);
    }
  }
};

