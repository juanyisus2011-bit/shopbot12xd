const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mines")
    .setDescription("Find 3 gems without hitting a bomb 💎"),

  async executeSlash(interaction) {

    const size = 5;
    const bombsCount = 5;
    const gemsToWin = 3;

    let revealed = 0;
    let revealedCells = new Set();

    // ===== Generate Board Safely =====
    let board = new Array(size * size).fill("gem");

    const bombPositions = [];
    while (bombPositions.length < bombsCount) {
      const random = Math.floor(Math.random() * board.length);
      if (!bombPositions.includes(random)) {
        bombPositions.push(random);
      }
    }

    for (const pos of bombPositions) {
      board[pos] = "bomb";
    }

    // ===== Create Grid =====
    const createGrid = (disableAll = false) => {
      const rows = [];

      for (let i = 0; i < size; i++) {
        const row = new ActionRowBuilder();

        for (let j = 0; j < size; j++) {
          const index = i * size + j;

          let label = "⬜";
          let style = ButtonStyle.Secondary;
          let disabled = disableAll;

          if (revealedCells.has(index)) {
            if (board[index] === "bomb") {
              label = "💣";
              style = ButtonStyle.Danger;
            } else {
              label = "💎";
              style = ButtonStyle.Success;
            }
            disabled = true;
          }

          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`mine_${index}`)
              .setLabel(label)
              .setStyle(style)
              .setDisabled(disabled)
          );
        }

        rows.push(row);
      }

      return rows;
    };

    await interaction.reply({
      content: "💎 Find 3 gems to win!",
      components: createGrid()
    });

    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000
    });

    collector.on("collect", async i => {

      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "This is not your game!",
          ephemeral: true
        });
      }

      const index = parseInt(i.customId.split("_")[1]);

      if (revealedCells.has(index)) return;

      revealedCells.add(index);

      // ===== Bomb =====
      if (board[index] === "bomb") {

        collector.stop("lost");

        return i.update({
          content: "💥 You hit a bomb! Game over.",
          components: createGrid(true)
        });

      }

      // ===== Gem =====
      revealed++;

      if (revealed >= gemsToWin) {
        collector.stop("won");

        return i.update({
          content: "🎉 You won the game!",
          components: createGrid(true)
        });
      }

      await i.update({
        content: `💎 Gems found: ${revealed}/${gemsToWin}`,
        components: createGrid()
      });

    });

    collector.on("end", async (_, reason) => {
      if (reason === "time") {
        await interaction.editReply({
          content: "⏰ Game expired.",
          components: createGrid(true)
        });
      }
    });
  }
};
