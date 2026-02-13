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
    fs.writeFileSync(leaderboardPath, JSON.stringify({ solo: {}, duel: {} }));
  }
  return JSON.parse(fs.readFileSync(leaderboardPath));
}

function saveLeaderboard(data) {
  fs.writeFileSync(leaderboardPath, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trivia-duel")
    .setDescription("Challenge someone to a trivia duel")
    .addUserOption(option =>
      option.setName("opponent")
        .setDescription("Choose your opponent")
        .setRequired(true)
    )
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

    const opponent = interaction.options.getUser("opponent");
    const difficulty = interaction.options.getString("difficulty");
    const category = interaction.options.getString("category");

    if (opponent.bot || opponent.id === interaction.user.id) {
      return interaction.reply({ content: "Invalid opponent.", flags: 64 });
    }

    const acceptRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("accept_duel")
        .setLabel("Accept")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("decline_duel")
        .setLabel("Decline")
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      content: `${opponent}, you have been challenged by ${interaction.user}!\nDifficulty: ${difficulty.toUpperCase()}\n⏳ You have 1 minute to respond.`,
      components: [acceptRow]
    });

    const duelMessage = await interaction.fetchReply();

    // 🔒 Only opponent can accept/decline
    const collector = duelMessage.createMessageComponentCollector({
      time: 60000,
      filter: async i => {
        if (i.user.id !== opponent.id) {
          await i.reply({
            content: "❌ Only the challenged user can respond!",
            flags: 64
          });
          return false;
        }
        return true;
      }
    });

    collector.on("collect", async i => {

      if (i.customId === "decline_duel") {
        collector.stop();
        return i.update({ content: "Duel declined.", components: [] });
      }

      if (i.customId === "accept_duel") {

        collector.stop("accepted");

        try {

          const res = await fetch(
            `https://opentdb.com/api.php?amount=1&category=${category}&difficulty=${difficulty}&type=multiple`
          );
          const data = await res.json();

          if (!data || data.response_code !== 0 || !data.results.length) {
            return interaction.editReply({
              content: "⚠️ Trivia API error. Try again.",
              components: []
            });
          }

          const questionData = data.results[0];

          const answers = [
            ...questionData.incorrect_answers,
            questionData.correct_answer
          ].sort(() => Math.random() - 0.5);

          const row = new ActionRowBuilder();
          answers.forEach((answer, index) => {
            row.addComponents(
              new ButtonBuilder()
                .setCustomId(`answer_${index}`)
                .setLabel(answer)
                .setStyle(ButtonStyle.Secondary)
            );
          });

          const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("⚔️ Trivia Duel")
            .setDescription(
              `**${questionData.question}**\n\nFirst correct answer wins!\nDifficulty: ${difficulty.toUpperCase()}\n⏳ 1 minute to answer.`
            );

          await i.update({ embeds: [embed], components: [row], content: "" });

          const duelGameMessage = await interaction.fetchReply();

          const players = [interaction.user.id, opponent.id];
          const wrongPlayers = new Set();
          const correctAnswer = questionData.correct_answer;

          // 🔒 Only the 2 players can answer
          const answerCollector = duelGameMessage.createMessageComponentCollector({
            time: 60000,
            filter: async btn => {
              if (!players.includes(btn.user.id)) {
                await btn.reply({
                  content: "❌ You're not part of this duel!",
                  flags: 64
                });
                return false;
              }
              return true;
            }
          });

          answerCollector.on("collect", async btn => {

            if (wrongPlayers.has(btn.user.id)) {
              return btn.reply({
                content: "❌ You already answered incorrectly!",
                flags: 64
              });
            }

            const chosen = answers[parseInt(btn.customId.split("_")[1])];

            if (chosen === correctAnswer) {

              answerCollector.stop("winner");

              const leaderboard = getLeaderboard();
              const userId = btn.user.id;

              if (!leaderboard.duel[userId]) {
                leaderboard.duel[userId] = { easy: 0, medium: 0, hard: 0 };
              }

              leaderboard.duel[userId][difficulty]++;
              saveLeaderboard(leaderboard);

              const finalRow = new ActionRowBuilder();
              answers.forEach((answer, idx) => {
                finalRow.addComponents(
                  new ButtonBuilder()
                    .setCustomId(`end_${idx}`)
                    .setLabel(answer)
                    .setDisabled(true)
                    .setStyle(
                      answer === correctAnswer
                        ? ButtonStyle.Primary
                        : ButtonStyle.Secondary
                    )
                );
              });

              await btn.update({
                content: `🏆 ${btn.user} wins the duel!`,
                embeds: [embed],
                components: [finalRow]
              });

            } else {

              wrongPlayers.add(btn.user.id);

              await btn.reply({
                content: `❌ Wrong answer!`,
                flags: 64
              });

              if (wrongPlayers.size === 2) {

                answerCollector.stop("draw");

                const finalRow = new ActionRowBuilder();
                answers.forEach((answer, idx) => {
                  finalRow.addComponents(
                    new ButtonBuilder()
                      .setCustomId(`end_${idx}`)
                      .setLabel(answer)
                      .setDisabled(true)
                      .setStyle(
                        answer === correctAnswer
                          ? ButtonStyle.Primary
                          : ButtonStyle.Secondary
                      )
                  );
                });

                await interaction.editReply({
                  content: `🤝 It's a draw! The correct answer was: **${correctAnswer}**`,
                  embeds: [embed],
                  components: [finalRow]
                });
              }
            }
          });

          answerCollector.on("end", async (_, reason) => {
            if (reason !== "winner" && reason !== "draw") {

              const finalRow = new ActionRowBuilder();
              answers.forEach((answer, idx) => {
                finalRow.addComponents(
                  new ButtonBuilder()
                    .setCustomId(`end_${idx}`)
                    .setLabel(answer)
                    .setDisabled(true)
                    .setStyle(
                      answer === correctAnswer
                        ? ButtonStyle.Primary
                        : ButtonStyle.Secondary
                    )
                );
              });

              await interaction.editReply({
                content: `⏰ Time's up! The correct answer was: **${correctAnswer}**`,
                embeds: [embed],
                components: [finalRow]
              });
            }
          });

        } catch (err) {
          console.error(err);
          interaction.editReply({
            content: "⚠️ Something went wrong.",
            components: []
          });
        }
      }
    });

    collector.on("end", async (_, reason) => {
      if (reason !== "accepted") {
        await interaction.editReply({
          content: "⏰ Duel request expired.",
          components: []
        });
      }
    });

  }
};
