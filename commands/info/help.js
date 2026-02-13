const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "help",
  aliases: ["ayuda"],

  async execute(message) {
    const member = message.member;

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle(" Help Panel")
      .setDescription("Here are the available commands based on your permissions.\n");

    // 🌍 PUBLIC COMMANDS
    embed.addFields({
      name: " fun commands",
      value:
        "` ,help ` → Show this panel\n" +
        "` ,price ` → Price calculator\n" +
        "` ,valor ` → Value calculator\n" +
        "` ,w ` → User information\n" +
        "` ,roles ` → View all server roles\n" +
        "` ,avatar ` → User avatar\n" +
        "` ,banner ` → User banner\n" +
        "` ,server ` → Server information\n" +
        "` ,flip / coinflip ` → Flip a coin\n" +
        "` ,ping ` → Check latency",
    });

    //  MODERATION
    if (
      member.permissions.has(PermissionsBitField.Flags.KickMembers) ||
      member.permissions.has(PermissionsBitField.Flags.BanMembers)
    ) {
      embed.addFields({
        name: " Moderation",
        value:
          "` ,kick @user reason `\n" +
          "` ,ban @user reason `\n" +
          "` ,unban ID reason `\n" +
          "` ,jail @user `\n" +
          "` ,unjail @user `\n" +
          "` ,c <amount> ` → Delete messages",
      });
    }

    // 🧹 ROLES
    if (member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      embed.addFields({
        name: " Roles",
        value:
          "` ,r @user @role ` → Add / remove role",
      });
    }

    embed
      .setFooter({ text: "Automatic help system" })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },
};
