const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "dice",
  description: "Roll a dice",

  data: new SlashCommandBuilder()
    .setName("dice")
    .setDescription("Roll a dice"),

  async execute(message) {
    const number = Math.floor(Math.random() * 6) + 1;

    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("🎲 Dice Roll")
      .setDescription(`You rolled: **${number}**`);

    message.channel.send({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const number = Math.floor(Math.random() * 6) + 1;

    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("🎲 Dice Roll")
      .setDescription(`You rolled: **${number}**`);

    interaction.reply({ embeds: [embed] });
  }
};
