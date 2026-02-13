const { EmbedBuilder } = require("discord.js");
const brainrots = require("../../utils/brainrots");

module.exports = {
  name: "precio",
  async execute(message, args) {
    const query = args[0]?.toLowerCase();
    const M = parseFloat(args[1]);

    if (!query || isNaN(M)) {
      return message.channel.send("Uso: `,price <brainrot> <M>`");
    }

    const b = brainrots.find(br =>
      br.aliases.includes(query)
    );

    if (!b) {
      return message.channel.send("❌ Brainrot no encontrado.");
    }

    const resultado = ((M - b.baseM) * b.multiplier + b.basePrice).toFixed(2);

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setAuthor({
        name: `Calculadora de Precios - ${b.name}`,
      })
      .setDescription(
        `**Conversión automática usando la fórmula de ${b.name}**`
      )
      .addFields(
        {
          name: "📐 Fórmula",
          value: `\`\`\`\n${b.formula}\n\`\`\``,
        },
        {
          name: "🧮 Operación",
          value: `\`\`\`\n( ${M} - ${b.baseM} ) × ${b.multiplier} + ${b.basePrice}\n\`\`\``,
        },
        {
          name: "💰 Resultado",
          value: `**$${resultado}**`,
        }
      )
      .setFooter({
        text: `Pedido por ${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};