const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const whitelist = require("../utils/whitelist");

const LOG_CHANNEL_ID = "1470979029162262610";
const SECURITY_OWNER_ID = "1402724870160257130";

module.exports = {
  name: "roleDelete",

  async execute(role, client) {
    const guild = role.guild;

    try {
      const logs = await guild.fetchAuditLogs({
        type: AuditLogEvent.RoleDelete,
        limit: 1
      });

      const entry = logs.entries.first();
      if (!entry) return;

      // ⏱ Ignorar logs viejos
      if (Date.now() - entry.createdTimestamp > 10000) return;

      const executor = entry.executor;
      if (!executor) return;

      const memberExec = await guild.members.fetch(executor.id).catch(() => null);
      if (!memberExec) return;

      // 🔐 IGNORE SYSTEM
      if (executor.id === guild.ownerId) return;
      if (executor.id === guild.members.me.id) return;

      // ✅ Whitelist por categoría
      if (whitelist.isWhitelistedUser(executor.id, "roleDelete")) return;
      if (whitelist.isWhitelistedRole(memberExec, "roleDelete")) return;

      // 🚨 CASTIGO INSTANTÁNEO
      await guild.members.ban(executor.id, {
        reason: "Anti Nuke: Deleting Roles"
      }).catch(() => {});

      const embed = new EmbedBuilder()
        .setColor("#3498DB")
        .setTitle("User Punished")
        .addFields(
          { name: "User", value: `${executor.tag}\n${executor.id}` },
          { name: "Action", value: "Role Delete" },
          { name: "Punishment Type", value: "Ban" }
        )
        .setTimestamp();

      const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) logChannel.send({ embeds: [embed] });

      // 📩 DM solo cuando castiga
      const securityUser = await client.users.fetch(SECURITY_OWNER_ID).catch(() => null);
      if (securityUser) {
        securityUser.send({ embeds: [embed] }).catch(() => {});
      }

    } catch (err) {
      console.log("AntiRoleDelete error:", err);
    }
  }
};
