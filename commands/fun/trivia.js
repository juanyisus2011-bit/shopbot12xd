const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const leaderboardPath = path.join(__dirname, "../../database/leaderboard.json");

function getLeaderboard() {
  if (!fs.existsSync(leaderboardPath)) {
    fs.writeFileSync(
      leaderboardPath,
      JSON.stringify({ solo: {}, duel: {} })
    );
  }
  return JSON.parse(fs.readFileSync(leaderboardPath));
}

function saveLeaderboard(data) {
  fs.writeFileSync(leaderboardPath, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trivia")
    .setDescription("Play trivia (single player)")
    .addStringOption(option =>
      option.setName("difficulty")
        .setDescription("Choose difficulty")
        .setRequired(true)
        .addChoices(
          { name: "Easy", value: "easy" },
          { name: "Medium", value: "medium" },
          { name: "Hard", value: "hard" }
        )
    )
    .addStringOption(option =>
      option.setName("category")
        .setDescription("Choose category")
        .setRequired(true)
        .addChoices(
          { name: "General Knowledge", value: "9" },
          { name: "Science", value: "17" },
          { name: "Computers", value: "18" },
          { name: "Math", value: "19" },
          { name: "Sports", value: "21" }
        )
    ),

  async executeSlash(interaction) {

    const difficulty = interaction.options.getString("difficulty");
    const category = interaction.options.getString("category");

    try {

      const res = await fetch(
        `https://opentdb.com/api.php?amount=1&category=${category}&difficulty=${difficulty}&type=multiple`
      );

      const data = await res.json();

      // 🔒 API safety check
      if (!data || data.response_code !== 0 || !data.results || !data.results.length) {
        return interaction.reply({
          content: "⚠️ Trivia API error. Try again.",
          flags: 64
        });
      }

      const questionData = data.results[0];

      const answers = [
        ...questionData.incorrect_answers,
        questionData.correct_answer
      ].sort(() => Math.random() - 0.5);

      const row = new ActionRowBuilder();
      answers.forEach((answer, i) => {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`answer_${i}`)
            .setLabel(answer)
            .setStyle(ButtonStyle.Secondary)
        );
      });

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("🧠 Trivia")
        .setDescription(
          `**${questionData.question}**\n\nDifficulty: ${difficulty.toUpperCase()}\n⏳ You have 1 minute to answer.`
        );

      // Send message
      await interaction.reply({
        embeds: [embed],
        components: [row]
      });

      const message = await interaction.fetchReply();

      // Collector (ONLY the user who executed the command)
      const collector = message.createMessageComponentCollector({
        time: 60000,
        filter: async i => {
          if (i.user.id !== interaction.user.id) {
            await i.reply({
              content: "❌ You can't answer this trivia!",
              flags: 64
            });
            return false;
          }
          return true;
        }
      });

      collector.on("collect", async i => {

        collector.stop("answered");

        const chosen = answers[parseInt(i.customId.split("_")[1])];
        const correct = questionData.correct_answer;

        const newRow = new ActionRowBuilder();
        answers.forEach((answer, index) => {
          newRow.addComponents(
            new ButtonBuilder()
              .setCustomId(`answer_${index}`)
              .setLabel(answer)
              .setDisabled(true)
              .setStyle(
                answer === correct
                  ? ButtonStyle.Primary
                  : ButtonStyle.Secondary
              )
          );
        });

        if (chosen === correct) {

          const leaderboard = getLeaderboard();
          const userId = i.user.id;

          if (!leaderboard.solo) leaderboard.solo = {};
          if (!leaderboard.solo[userId]) {
            leaderboard.solo[userId] = { easy: 0, medium: 0, hard: 0 };
          }

          leaderboard.solo[userId][difficulty]++;
          saveLeaderboard(leaderboard);

          await i.update({
            content: "✅ Correct!",
            embeds: [embed],
            components: [newRow]
          });

        } else {

          await i.update({
            content: `❌ You failed! The correct answer was: **${correct}**`,
            embeds: [embed],
            components: [newRow]
          });
        }

      });

      // ⏰ If time runs out
      collector.on("end", async (_, reason) => {

        if (reason !== "answered") {

          const newRow = new ActionRowBuilder();
          answers.forEach((answer, index) => {
            newRow.addComponents(
              new ButtonBuilder()
                .setCustomId(`answer_${index}`)
                .setLabel(answer)
                .setDisabled(true)
                .setStyle(
                  answer === questionData.correct_answer
                    ? ButtonStyle.Primary
                    : ButtonStyle.Secondary
                )
            );
          });

          await interaction.editReply({
            content: `⏰ Time's up! The correct answer was: **${questionData.correct_answer}**`,
            embeds: [embed],
            components: [newRow]
          });
        }

      });

    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "⚠️ Something went wrong while fetching the question.",
        flags: 64
      });
    }
  }
};
