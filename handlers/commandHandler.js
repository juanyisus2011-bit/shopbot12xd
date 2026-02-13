const fs = require("fs");

module.exports = (client) => {
  const commandFolders = fs.readdirSync("./commands");

  for (const folder of commandFolders) {
    const files = fs
      .readdirSync(`./commands/${folder}`)
      .filter(f => f.endsWith(".js"));

    for (const file of files) {
      const command = require(`../commands/${folder}/${file}`);
      client.commands.set(command.name, command);
    }
  }

  console.log("✅ Commands loaded");
};
