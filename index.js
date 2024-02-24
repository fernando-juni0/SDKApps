//TODO-------------importes------------
const Discord = require("discord.js");
const { Events, GatewayIntentBits } = require('discord.js');
let commandsExec = require('./handler/commands')

//TODO------------Configs--------------

require('dotenv').config()

const client = new Discord.Client({ intents: [GatewayIntentBits.Guilds] })
client.slashCommands = new Discord.Collection();

client.login(process.env.TOKEN)

commandsExec(client)



//TODO------------Clients--------------


client.on('interactionCreate', interaction => {
    console.log(interaction);
    if (!interaction.isChatInputCommand()) return;
	
});

client.on('messageCreate',(message)=>{
    console.log(message);
})
//TODO------------Listen--------------

client.on('ready',()=>{
    console.log([
        `[LOGS] ${client.user.tag} está online!`,
        `[LOGS] Estou em ${client.guilds.cache.size} servidores.`,
        `[LOGS] Cuidando de ${client.users.cache.size} membros.`
      ].join('\n'))
})
