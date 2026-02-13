const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "flip",
  aliases: ["coinflip"],

  async execute(message) {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";

    const embed = new EmbedBuilder()
      .setColor("Gold")
      .setTitle("🪙 Coin Flip")
      .setDescription(`The result was: **${result}**`)
      .setFooter({ text: `Requested by ${message.author.username}` })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
};
