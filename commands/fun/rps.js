const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const choices = ["rock", "paper", "scissors"];

function getResult(user, bot) {
  if (user === bot) return "It's a tie 🤝";

  if (
    (user === "rock" && bot === "scissors") ||
    (user === "paper" && bot === "rock") ||
    (user === "scissors" && bot === "paper")
  ) {
    return "You win 🎉";
  }

  return "You lose 😢";
}

module.exports = {
  name: "rps",
  description: "Play Rock Paper Scissors",

  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Play Rock Paper Scissors")
    .addStringOption(option =>
      option
        .setName("choice")
        .setDescription("Choose rock, paper or scissors")
        .setRequired(true)
        .addChoices(
          { name: "Rock", value: "rock" },
          { name: "Paper", value: "paper" },
          { name: "Scissors", value: "scissors" }
        )
    ),

  async execute(message, args) {
    const userChoice = args[0]?.toLowerCase();

    if (!choices.includes(userChoice)) {
      return message.reply("Use: ,rps rock/paper/scissors");
    }

    const botChoice = choices[Math.floor(Math.random() * 3)];
    const result = getResult(userChoice, botChoice);

    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("✊ Rock Paper Scissors")
      .setDescription(
        `You: **${userChoice}**\nBot: **${botChoice}**\n\n${result}`
      );

    message.channel.send({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const userChoice = interaction.options.getString("choice");
    const botChoice = choices[Math.floor(Math.random() * 3)];
    const result = getResult(userChoice, botChoice);

    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("✊ Rock Paper Scissors")
      .setDescription(
        `You: **${userChoice}**\nBot: **${botChoice}**\n\n${result}`
      );

    interaction.reply({ embeds: [embed] });
  }
};
