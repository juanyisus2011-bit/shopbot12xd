const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "vouch",

  async execute(message) {
    const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setDescription(
        "+rep 1402724870160257130 (product) in [0.00$] | Ltc"
      );

    await message.channel.send({ embeds: [embed] });
    await message.react("✅").catch(() => {});
  },
};
