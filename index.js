//TODO-------------importes------------
const Discord = require("discord.js");
const { Events, GatewayIntentBits } = require('discord.js');
const db = require('./Firebase/models.js')


const express = require('express')
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session')
const path = require('path');
const multer = require('multer')
const cookieParser = require("cookie-parser");


const webConfig = require('./config/web-config.js')

const botConfig = require('./config/bot-config.js');
const { default: axios } = require("axios");

const functions = require('./functions.js');

const cors = require('cors');


const stripe = require('stripe')(webConfig.stripe);
//TODO------------Configs--------------

require('dotenv').config()

const client = new Discord.Client({ intents: botConfig.intents })

require('./handler/index.js')(client)




client.commands = new Discord.Collection();
client.slashCommands = new Discord.Collection();

client.login(botConfig.discordToken)




const app = express();

app.use(session(webConfig.session));
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use(express.static('views'));
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.static('src'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'src')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs');

app.use(cors());


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/uploads/')
    },
    filename: function (req, file, cb) {
        const nomeArquivo = file.originalname
        const codigo = require('crypto').randomBytes(42).toString('hex');
        const originalName = file.originalname;
        const extension = originalName.substr(originalName.lastIndexOf('.'));
        const fileName = codigo + extension;
        cb(null, `${fileName}`)
    }
});

const upload = multer({ storage });


//TODO------------Clients discord--------------

client.on("interactionCreate", async (interaction) => {
    if (!interaction.guild) return;

    if (interaction.isCommand()) {

        const cmd = client.slashCommands.get(interaction.commandName);

        if (!cmd)
            return;

        cmd.run(client, interaction);
    }

    if (interaction.isContextMenuCommand()) {
        await interaction.deferReply({ ephemeral: false });
        const command = client.slashCommands.get(interaction.commandName);
        if (command) command.run(client, interaction);

    }
})







//TODO------------WEB PAGE--------------


app.get('/', (req, res) => {
    res.render('index', { error: req.query.error ? req.query.error : '' })
})


app.get('/dashboard', async (req, res) => {
    if (req.session.uid) {
        let user = await db.findOne({ colecao: 'users', doc: req.session.uid })
        verifyServer(await functions.findServers(user.access_token))
        async function verifyServer(server) {
            if (server.error) {
                let time = (parseFloat(server.err.response.data.retry_after) * 1000)
                setTimeout(async () => {
                    let newServer = await functions.findServers(user.access_token)
                    if (newServer.error) {
                        await verifyServer(newServer)
                    } else {
                        res.render('dashboard', { user: user, servers: newServer })
                    }

                }, time)

            } else {
                res.render('dashboard', { user: user, servers: server })
            }
        }



    } else {
        res.redirect('/')
    }
})



app.get('/auth/callback', async (req, res) => {
    if (!req.query.code) {
        res.redirect('/?error="Não foi possivel fazer login tente novamente!"')
    } else {
        let param = new URLSearchParams({
            client_id: webConfig.clientId,
            client_secret: webConfig.secret,
            grant_type: 'authorization_code',
            code: req.query.code,
            redirect_uri: webConfig.redirect
        })
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept-Encoding': 'application/x-www-form-urlencoded'
        };
        const response = await axios.post('https://discord.com/api/oauth2/token', param, { headers }).then((res) => { return res }).catch((err) => console.error(err))
        if (!response) {
            res.redirect('/?error="Não foi possivel fazer login tente novamente!"')
            return
        }
        let userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${response.data.access_token}`,
                ...headers
            }
        }).then((res) => { return res.data }).catch((err) => console.error(err));
        let findUser = await db.findOne({ colecao: 'users', doc: userResponse.id })
        if (!findUser == {} || !findUser == undefined || !findUser == null) {
            req.session.uid = findUser.id
            res.redirect('/dashboard')
            return
        }



        await db.create('users', userResponse.id, {
            id: userResponse.id,
            username: userResponse.username,
            profile_pic: userResponse.avatar ? `https://cdn.discordapp.com/avatars/${userResponse.id}/${userResponse.avatar}.png` : 'https://res.cloudinary.com/dgcnfudya/image/upload/v1709143898/gs7ylxx370phif3usyuf.png',
            displayName: userResponse.global_name,
            email: userResponse.email,
            access_token: response.data.access_token
        })

        req.session.uid = userResponse.id

        res.redirect('/dashboard')
    }
})

app.get('/server/:id', async (req, res) => {
    if (!req.params.id || !req.session.uid) {
        res.redirect('/')
        return
    }

    let user = await db.findOne({ colecao: 'users', doc: req.session.uid })
    let servers = await functions.findServers(user.access_token)
    let id = req.params.id
    let server = servers.find(element => element.id == id)
    res.render('painel', { user: user, server: server })
})


app.get('/logout', async (req, res) => {
    if (req.session.uid) {
        const sessionID = req.session.id;
        req.sessionStore.destroy(sessionID, (err) => {
            if (err) {
                return console.error(err)
            } else {
                res.redirect('/')
            }
        })

    }
})

app.get('/payment/:id', async (req, res) => {
    if (!req.params.id || !req.session.uid) {
        res.redirect('/')
        return
    }
    let user = await db.findOne({ colecao: 'users', doc: req.session.uid })
    res.render('payment', { user: user })
})

app.post('/payment/chechout', async (req, res) => {
    try {
        stripe.prices.create({
            unit_amount: req.body.price, // O valor do preço em centavos (por exemplo, R$10,00 seria 1000 centavos)
            currency: 'brl', // A moeda do preço (BRL para Real Brasileiro)
            product_data: {
                name: 'Assinatura', // O nome do produto associado ao preço
            },
            recurring: {
                interval: 'month', // A frequência da recorrência (por exemplo, 'month' para mensal)
              },
        }).then( async price => {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price: price.id,
                    quantity: 1,
                }],
                mode: 'subscription', // Ou 'payment' se for uma única transação
                success_url: 'http://localhost/dashboard',
                cancel_url: 'http://localhost/dashboard',
                metadata: {
                    plan:req.body.plan,
                    serverID:req.body.serverID,
                    uid:req.body.uid
                }
            });
    
            res.redirect(session.url)
        }).catch(error => {
            console.error('Erro ao criar o preço:', error);
        });

    } catch (error) {
        console.error('Erro ao iniciar o checkout:', error);
        res.status(500).send('Erro ao iniciar o checkout.');
    }
})

app.post('/webhook/stripe/payment', (req, res) => {
    console.log(req.body);
    res.status(200).end();
})



app.use((req, res, next) => {
    res.status(404).render('NotFoundPage.ejs')
});


//TODO------------Listen--------------

client.on('ready', () => {
    console.log([
        `[BOT] ${client.user.tag} está online!`,
        `[BOT] Estou em ${client.guilds.cache.size} servidores.`,
        `[BOT] Cuidando de ${client.users.cache.size} membros.`
    ].join('\n'))
})


app.listen(webConfig.port, () => {
    console.log(`[WEB] Servidor rodando na porta ${webConfig.port}`);
});






