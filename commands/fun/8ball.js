const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const responses = [
  "Yes.",
  "No.",
  "Maybe.",
  "Definitely.",
  "I don't think so.",
  "Ask again later.",
  "Without a doubt.",
  "Very unlikely."
];

module.exports = {
  name: "8ball",
  description: "Ask the magic 8ball",

  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8ball")
    .addStringOption(option =>
      option
        .setName("question")
        .setDescription("Your question")
        .setRequired(true)
    ),

  async execute(message, args) {
    if (!args.length) {
      return message.reply("Ask a full question.");
    }

    const response =
      responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("🎱 Magic 8Ball")
      .addFields(
        { name: "Question", value: args.join(" ") },
        { name: "Answer", value: response }
      );

    message.channel.send({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const question = interaction.options.getString("question");

    const response =
      responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("🎱 Magic 8Ball")
      .addFields(
        { name: "Question", value: question },
        { name: "Answer", value: response }
      );

    interaction.reply({ embeds: [embed] });
  }
};
