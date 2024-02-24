const path = require('path')
const fs = require("fs")

module.exports = async (client) => {
    const foldersPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));
    commandFiles.forEach(files => {
        files = require(`${foldersPath}/${files}`);
        if ('run' in files && 'name' in files) {
            client.slashCommands.set(files.name, files);
        } else {
            console.log(`[ERRO] O comando com nome ${files.name} nao pode ser executado!`);
        }
    });
}