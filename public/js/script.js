
var url = encodeURIComponent(origin + '/auth/callback')
var novaUrl = `https://discord.com/oauth2/authorize?client_id=1210894508028338197&response_type=code&redirect_uri=https%3A%2F%2Falert-ghastly-lizard.ngrok-free.app%2Fauth%2Fcallback&scope=identify+guilds+email`;


document.querySelectorAll('.button-assinar').forEach(element=>{
    element.href = novaUrl
})
document.getElementById('buttons-login').href = novaUrl