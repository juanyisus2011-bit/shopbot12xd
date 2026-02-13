const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "avatar",

  async execute(message) {
    const user =
      message.mentions.users.first() || message.author;

    const avatar = user.displayAvatarURL({ size: 1024, dynamic: true });

    const embed = new EmbedBuilder()
      .setColor("#2f3136")
      .setTitle(`Avatar of ${user.username}`)
      .setImage(avatar)
      .setFooter({ text: `ID: ${user.id}` });

    message.channel.send({ embeds: [embed] });
  }
};
