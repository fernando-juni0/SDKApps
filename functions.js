const axios = require('axios')
module.exports = {
    findServers:async(access_token)=>{
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept-Encoding': 'application/x-www-form-urlencoded'
        };
        let serverResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${access_token}`,
                ...headers
            }
        }).then((res) => { return res.data }).catch((err) => {
            // console.error(err)
            return {error:true,err:err}
        })
        if (serverResponse.error)return serverResponse;
        const servidores = await Promise.all(serverResponse.map(async element => {
            element.server_pic = element.icon ? `https://cdn.discordapp.com/icons/${element.id}/${element.icon}.png` : "https://res.cloudinary.com/dgcnfudya/image/upload/v1709143898/gs7ylxx370phif3usyuf.png";
            element.tipo = element.owner ? 'Dono' : (element.permissions === 2147483647 ? 'Administrador' : 'Membro');
            element.assinante = false
            return element;
        }));
        let servidoresFiltrados = servidores.filter(element => element.tipo !== 'Membro')
        return servidoresFiltrados
    }
}