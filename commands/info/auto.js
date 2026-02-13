const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "legit",

  async execute(message) {
    // ❌ Si no es admin, NO hacer absolutamente nada
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setDescription(
        "Are We Legit?\nYES\nNO ( no proof = ban)"
      );

    // Enviar el embed
    const sentMessage = await message.channel.send({ embeds: [embed] });

    // Reaccionar SOLO cuando el mensaje sí se envía
    await sentMessage.react("✅");
    await sentMessage.react("❌");
  },
};
