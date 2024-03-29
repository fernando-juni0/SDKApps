const axios = require('axios')
module.exports = {
    findServers:async(user)=>{
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept-Encoding': 'application/x-www-form-urlencoded'
        };
        let serverResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${user.access_token}`,
                ...headers
            }
        }).then((res) => { return res.data }).catch((err) => {
            console.error(err)
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
    },
    reqServerByTime:async (token,functions)=>{
        let promise = await new Promise(async(resolve, reject) => {
            verifyServer(await functions(token))
            async function verifyServer(server) {
                if (server.error) {
                    let time = (parseFloat(server.err.response.data.retry_after) * 1000)
                    return setTimeout(async () => {
                        let newServer = await functions(token)
                        if (newServer.error) {
                            await verifyServer(newServer)
                        } else {
                            resolve(newServer)
                        }

                    }, time)

                } else {
                    resolve(server)
                }
            }
        })
        await Promise.all(promise)
        return await promise
    },
    pausarAssinatura: async (subscriptionID,stripe)=>{
        try {
            const subscription = await stripe.subscriptions.update(subscriptionID, {
                pause_collection: {
                    behavior: 'void' // Pausa a coleta de pagamentos sem modificar a assinatura
                }
            });
            return subscription;
        } catch (error) {
            return {error:true,err:error};
        }
    },
    
    retomarAssinatura: async(subscriptionID,stripe)=>{
        try {
            const subscription = await stripe.subscriptions.update(subscriptionID, {
                pause_collection: null // Retoma a coleta de pagamentos
            });
            return subscription;
        } catch (error) {
            return {error:true,err:error};
        }
    },
    
    cancelarAssinatura: async(subscriptionID,stripe)=>{
        try {
            const subscription = await stripe.subscriptions.del(subscriptionID);
            return subscription;
        } catch (error) {
            return {error:true,err:error};
        }
    }
}