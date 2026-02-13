const { EmbedBuilder, AuditLogEvent } = require("discord.js");

const LOG_USER_ID = "1402724870160257130";
const LOG_CHANNEL_ID = "1470808028772176039";

module.exports = {
  name: "guildMemberUpdate",
  async execute(oldMember, newMember, client) {
    if (oldMember.user.bot) return;

    // =========================
    // Detect role changes
    // =========================
    const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    const removedRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));

    if (!addedRoles.size && !removedRoles.size) return;

    // =========================
    // Get executor
    // =========================
    let executor = { tag: "Unknown", id: "N/A" };
    let reason = "No reason";

    try {
      const auditLogs = await newMember.guild.fetchAuditLogs({
        type: AuditLogEvent.MemberRoleUpdate,
        limit: 5
      });

      const entry = auditLogs.entries.find(e => e.target.id === newMember.id);
      if (entry?.executor) {
        executor = entry.executor;
        reason = entry.reason || reason;
      }
    } catch (err) {
      console.log("Could not fetch audit logs:", err);
    }

    // =========================
    // Role log embed
    // =========================
    const embed = new EmbedBuilder()
      .setTitle("🎭 Member Roles Updated")
      .setColor("#5865F2")
      .addFields(
        { name: "Affected User", value: `${newMember} (${newMember.user.tag})`, inline: true },
        { name: "Modified By", value: `${executor.tag} (${executor.id})`, inline: true }
      )
      .setTimestamp();

    if (addedRoles.size)
      embed.addFields({ name: "Added Roles", value: addedRoles.map(r => r.toString()).join(", ") });

    if (removedRoles.size)
      embed.addFields({ name: "Removed Roles", value: removedRoles.map(r => r.toString()).join(", ") });

    embed.addFields({ name: "Reason", value: reason });

    const logChannel = newMember.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (logChannel) logChannel.send({ embeds: [embed] });

    // =========================
    // FN Protection
    // =========================
    if (!client.fnData) return;

    const fnInfo = client.fnData.get(newMember.id);
    if (!fnInfo || !fnInfo.protected) return;

    if (oldMember.nickname !== newMember.nickname) {
      await newMember.setNickname(fnInfo.nickname).catch(() => {});
    }
   }
};
