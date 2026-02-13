const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "vouch1",

  async execute(message) {
    const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setDescription(
        "+rep 879100606135033896 (product) in [0.00$] | Ltc"
      );

    await message.channel.send({ embeds: [embed] });
    await message.react("✅").catch(() => {});
  },
};
