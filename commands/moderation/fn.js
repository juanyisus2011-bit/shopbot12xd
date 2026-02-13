const { PermissionsBitField, EmbedBuilder } = require("discord.js");

const RED = 0xED4245;

module.exports = {
  name: "fn",
  description: "Force a nickname to a user and protect it",

  async execute(message, args, client) {

    // ❌ No permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription(
              "⚠️ You do not have sufficient permissions to use this command.\n\n" +
              "**Required permission:** `Administrator`"
            )
        ]
      });
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription("❌ You must mention a valid user.")
        ]
      });
    }

    // ❌ Owner protection
    if (member.id === message.guild.ownerId) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription("❌ You cannot use this command on the server owner.")
        ]
      });
    }

    if (!client.fnData) client.fnData = new Map();

    const newName = args.slice(1).join(" ");
    const fnInfo = client.fnData.get(member.id);

    // ❌ No name provided → disable FN
    if (!newName) {
      if (!fnInfo) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(RED)
              .setDescription("ℹ️ This user does not have Force Nickname enabled.")
          ]
        });
      }

      // Restore original nickname
      await member.setNickname(fnInfo.oldNickname).catch(() => {});
      client.fnData.delete(member.id);

      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription(
              `🔓 Force Nickname disabled. ${member} now has their original nickname.`
            )
        ]
      });
    }

    // 🔒 Save original nickname and enable FN
    const oldNickname = member.nickname || member.user.username;
    let nickname = newName;
    if (nickname.length > 32) nickname = nickname.slice(0, 32);

    client.fnData.set(member.id, {
      oldNickname,
      nickname,
      protected: true
    });

    await member.setNickname(nickname).catch(() => {});

    message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(RED)
          .setDescription(
            `🔒 ${member} now has the forced nickname **${nickname}**.`
          )
      ]
    });
  }
};
