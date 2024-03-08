
var url = encodeURIComponent(origin + '/auth/callback')
var novaUrl = `https://discord.com/oauth2/authorize?client_id=1210894508028338197&response_type=code&redirect_uri=http%3A%2F%2Ffernandojunio.com.br%3A4141%2Fauth%2Fcallback&scope=identify+guilds+email`;


document.querySelectorAll('.button-assinar').forEach(element=>{
    element.href = novaUrl
})
document.getElementById('buttons-login').href = novaUrl
