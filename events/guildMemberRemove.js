const { EmbedBuilder, AuditLogEvent } = require("discord.js");

module.exports = {
  name: "guildMemberRemove",

  async execute(member) {
    const guild = member.guild;

    
    const banLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBanAdd
    }).catch(() => null);

    const banLog = banLogs?.entries.first();

    if (banLog && banLog.target.id === member.id) {
      const moderator = banLog.executor;
      const reason = banLog.reason || "No especificado";

      const dmEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("⛔ Has sido baneado")
        .setDescription(`Has sido **baneado** del servidor **${guild.name}**`)
        .addFields(
          { name: "👮 Moderador", value: moderator.tag, inline: true },
          { name: "📄 Razón", value: reason, inline: true }
        )
        .setTimestamp();

      member.send({ embeds: [dmEmbed] }).catch(() => {});
      return; // importante
    }

    // =====================
    // 👢 KICK
    // =====================
    const kickLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberKick
    }).catch(() => null);

    const kickLog = kickLogs?.entries.first();

    if (kickLog && kickLog.target.id === member.id) {
      const moderator = kickLog.executor;
      const reason = kickLog.reason || "No especificado";

      const dmEmbed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("👢 Has sido expulsado")
        .setDescription(`Has sido **expulsado** del servidor **${guild.name}**`)
        .addFields(
          { name: "👮 Moderador", value: moderator.tag, inline: true },
          { name: "📄 Razón", value: reason, inline: true }
        )
        .setTimestamp();

      member.send({ embeds: [dmEmbed] }).catch(() => {});
    }
   }
}; 