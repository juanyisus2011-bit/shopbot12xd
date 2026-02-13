const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const whitelist = require("../utils/whitelist");

const LOG_CHANNEL_ID = "1470979029162262610";
const SECURITY_OWNER_ID = "1402724870160257130";

const kickLimits = new Map();
const LIMIT = 1; // 1 warning, 2 ban
const RESET_TIME = 60 * 60 * 1000; // 1 hora

module.exports = {
  name: "guildMemberRemove",

  async execute(member, client) {
    const guild = member.guild;

    try {
      // Esperar un poco para que el audit log se actualice
      await new Promise(resolve => setTimeout(resolve, 1000));

      const logs = await guild.fetchAuditLogs({
        type: AuditLogEvent.MemberKick,
        limit: 5
      });

      const entry = logs.entries.find(
        log =>
          log.target.id === member.id &&
          Date.now() - log.createdTimestamp < 10000
      );

      if (!entry) return;

      const executor = entry.executor;
      if (!executor) return;

      const memberExec = await guild.members.fetch(executor.id).catch(() => null);
      if (!memberExec) return;

      // 🔐 IGNORE OWNER Y BOT
      if (executor.id === guild.ownerId) return;
      if (executor.id === guild.members.me.id) return;

      // ✅ Whitelist
      if (whitelist.isWhitelistedUser(executor.id, "kick")) return;
      if (whitelist.isWhitelistedRole(memberExec, "kick")) return;

      const now = Date.now();

      if (!kickLimits.has(executor.id)) {
        kickLimits.set(executor.id, { count: 0, timestamp: now });
      }

      const data = kickLimits.get(executor.id);

      if (now - data.timestamp > RESET_TIME) {
        data.count = 0;
        data.timestamp = now;
      }

      data.count++;

      const remaining = LIMIT - data.count;
      const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);

      // ⚠ WARNING
      if (data.count <= LIMIT) {
        const warningEmbed = new EmbedBuilder()
          .setColor("#3498DB")
          .setTitle("User Warning")
          .addFields(
            { name: "User", value: `${executor.tag}\n${executor.id}` },
            { name: "Reason", value: "Kicking Members" },
            { name: "Remaining Attempts", value: `${remaining >= 0 ? remaining : 0}` }
          )
          .setTimestamp();

        if (logChannel) logChannel.send({ embeds: [warningEmbed] });
      }

      // 🚨 BAN
      if (data.count > LIMIT) {

        await guild.members.ban(executor.id, {
          reason: "Anti Nuke: Kick Limit Exceeded"
        }).catch(() => {});

        const punishEmbed = new EmbedBuilder()
          .setColor("#3498DB")
          .setTitle("User Punished")
          .addFields(
            { name: "User", value: `${executor.tag}\n${executor.id}` },
            { name: "Reason", value: "Mass Kicking" },
            { name: "Punishment Type", value: "Ban" }
          )
          .setTimestamp();

        if (logChannel) logChannel.send({ embeds: [punishEmbed] });

        const securityUser = await client.users.fetch(SECURITY_OWNER_ID).catch(() => null);
        if (securityUser) {
          securityUser.send({ embeds: [punishEmbed] }).catch(() => {});
        }

        kickLimits.delete(executor.id);
      }

    } catch (err) {
      console.log("AntiKick error:", err);
    }
  }
};
