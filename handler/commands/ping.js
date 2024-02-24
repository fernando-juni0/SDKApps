
module.exports = {
    name:'ping',
    run: async(interaction)=>{
        await interaction.reply('Pong!');
    }
}