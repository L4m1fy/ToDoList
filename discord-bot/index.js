const { Client, GatewayIntentBits, Events } = require('discord.js');
const mongoose = require('mongoose');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Discord bot connected to MongoDB'))
  .catch(console.error);

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  if (message.content.startsWith('!todo')) {
    const args = message.content.slice(6).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
      switch (command) {
        case 'create':
          // !todo create "Project Name" "Task Name" "Description"
          if (args.length < 3) {
            return message.reply('Usage: !todo create "Project Name" "Task Name" "Description"');
          }
          const project = await Project.findOne({ name: args[0] });
          if (!project) {
            return message.reply('Project not found');
          }
          
          const task = new Task({
            title: args[1],
            description: args[2],
            project: project._id,
            createdBy: message.author.id
          });
          await task.save();
          message.reply(`Task created: ${task.title}`);
          break;

        case 'list':
          // !todo list "Project Name"
          if (args.length < 1) {
            return message.reply('Usage: !todo list "Project Name"');
          }
          const projectToList = await Project.findOne({ name: args[0] });
          if (!projectToList) {
            return message.reply('Project not found');
          }
          
          const tasks = await Task.find({ project: projectToList._id })
            .select('title status progress');
          
          const taskList = tasks.map(t => 
            `• ${t.title} (${t.status} - ${t.progress}%)`
          ).join('\n');
          
          message.reply(taskList || 'No tasks found');
          break;

        case 'help':
          message.reply(
            'Available commands:\n' +
            '!todo create "Project Name" "Task Name" "Description"\n' +
            '!todo list "Project Name"\n' +
            '!todo help'
          );
          break;

        default:
          message.reply('Unknown command. Use !todo help for available commands');
      }
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while processing your command');
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
