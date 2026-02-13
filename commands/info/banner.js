const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "banner",

  async execute(message) {
    const user =
      message.mentions.users.first() || message.author;

    const fetchedUser = await message.client.users.fetch(user.id, {
      force: true
    });

    if (!fetchedUser.banner) {
      return message.channel.send("❌ This user does not have a banner.");
    }

    const bannerURL = fetchedUser.bannerURL({ size: 1024, dynamic: true });

    const embed = new EmbedBuilder()
      .setColor("#2f3136")
      .setTitle(`Banner of ${fetchedUser.username}`)
      .setImage(bannerURL);

    message.channel.send({ embeds: [embed] });
  }
};
