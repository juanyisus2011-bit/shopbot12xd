require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ==========================
// DISCORD CLIENT
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration
  ]
});

client.commands = new Collection();
client.slashCommands = new Collection();
client.prefix = ".";

// ==========================
// LOAD COMMANDS
const commandsPath = path.join(__dirname, "commands");
const slashCommandsData = [];

if (fs.existsSync(commandsPath)) {
  const folders = fs.readdirSync(commandsPath);

  for (const folder of folders) {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const files = fs
      .readdirSync(folderPath)
      .filter(file => file.endsWith(".js"));

    for (const file of files) {
      const command = require(path.join(folderPath, file));

      if (command.name) {
        client.commands.set(command.name, command);
      }

      if (command.data) {
        client.slashCommands.set(command.data.name, command);
        slashCommandsData.push(command.data.toJSON());
      }
    }
  }
}

// ==========================
// LOAD EVENTS
const eventsPath = path.join(__dirname, "events");

if (fs.existsSync(eventsPath)) {
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter(file => file.endsWith(".js"));

  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));

    if (event.name) {
      client.on(event.name, (...args) =>
        event.execute(...args, client)
      );
    }
  }
}

client.once("clientReady", async () => {
  console.log(`Bot logged in as ${client.user.tag}`);

  await client.user.setStatus("dnd");

  const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_TOKEN
  );

  try {
    console.log("Registering guild slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: slashCommandsData }
    );

    console.log("Guild slash commands registered successfully.");
  } catch (error) {
    console.error("Error registering slash commands:", error);
  }
});

// ==========================
// LOGIN
client.login(process.env.DISCORD_TOKEN).catch(err =>
  console.error("Login error:", err)
);
