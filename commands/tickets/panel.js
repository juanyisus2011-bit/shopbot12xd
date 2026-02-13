const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "panel",

  async execute(message) {
    // ✅ Verificar si el autor es administrador
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply({
        content: "❌ Solo administradores pueden usar este comando.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("📩 REMASTED | BOT - Centro de Atención")
      .setDescription(
        "🎫 Sistema de Tickets | Ticket System\n\n" +
        "🇪🇸 ¿Necesitás ayuda o asistencia?\n" +
        "Seleccioná una categoría a continuación para abrir un ticket y recibir atención personalizada por parte de nuestro equipo.\n\n" +
        "🇺🇸 Need help or assistance?\n" +
        "Choose a category below to open a ticket and receive personalized support from our staff.\n\n" +
        "🇧🇷 Precisa de ajuda ou suporte?\n" +
        "Selecione uma categoria abaixo para abrir um ticket e receber atendimento personalizado da nossa equipe.\n\n" +
        "🛡️ Nuestro equipo está listo para ayudarte de forma rápida, profesional y segura.\n\n" +
        "Sistema automatizado de atención — DC SHOP"
      )
      .setColor("#2f3136")
      .setImage("https://media.discordapp.net/attachments/1263544676779032713/1263553867933679706/standard.gif?ex=69501cbd&is=694ecb3d&hm=97b8b703457332674b9c75650fe909b2e3aa2f0ce87331184b38c60aa269ffd7&="); // aquí tu GIF

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("open_ticket")
        .setLabel(" Abrir Ticket")
        .setStyle(ButtonStyle.Success)
    );

    await message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
};
