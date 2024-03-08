require('dotenv').config()

module.exports = {
    session:{
        secret: process.env.SECRET || "290jnid9awnd981924y12989032hbt30ng093bg209gn9320gh092ng302hg29bg30",
        resave: false, 
        saveUninitialized: false,
    },
    port: process.env.PORT || 3000,
    serviceAccount: JSON.parse(process.env.SERVICEACCOUNT),
    secret:process.env.CLIENTSECRET,
    clientId:process.env.CLIENTID,
    redirect:process.env.REDIRECTURL,
    stripe:process.env.STRIPE,
    iban:process.env.IBAN,
    stripeAccount:process.env.STRIPEACCOUNT
}