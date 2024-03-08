const express = require('express');
const router = express.Router();

const stripe = require('stripe')(require('../config/web-config').stripe);

const db = require('../Firebase/models')
const fs = require('fs');
const functions = require('../functions');
const webConfig = require('../config/web-config');
const sharp = require('sharp');

router.post('/account/create',async(req,res)=>{

    const logoData = fs.readFileSync('./public/img/logo-color-1.png');
    const imagemAjustadaBuffer = await sharp(logoData).resize({ width: 1000, height: 1000, fit: 'contain' }).toBuffer();
    const fileUpload = await stripe.files.create({
        purpose: 'business_icon',
        file: {
          data: imagemAjustadaBuffer,
          name: '1231231.png',
          type: 'image/png',
        },
      });
const account = await stripe.accounts.create({
    country: 'BR',
    type: 'express',
    capabilities: {
        card_payments: {
            requested: true,
        },
        transfers: {
            requested: true,
        },
    },
    individual: {
        first_name: 'Fernando junio ',
        last_name: 'da silva santana',
        email: 'junio132sj@gmail.com',
        phone: '+5511999999999', // Número de telefone (inclua o código do país, como +55 para o Brasil)
        dob: {
          day: 1,
          month: 1,
          year: 1980,
        },
        address: {
          line1: 'Rua manoel fraga dantas',
          city: 'Simão Dias',
          state: 'Sergipe',
          postal_code: '49480000',
          country: 'BR',
        },
        id_number: '112.265.675-09', // Número de identificação pessoal
        political_exposure:'none'
    },
    business_type: 'individual',
    settings: {
        branding:{
            primary_color: '\#ffffff',
            icon:fileUpload.id,
        },
    },
    business_profile: {
        name: 'SDK Vendedor', // Definir o nome da empresa
        mcc: '7299',
        url: 'https://skapps.com.br',
    },
})
    // Adiciona a conta bancária

})

router.post('/subscription/create', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: req.body.plan == 1 ? 'price_1OrVB6EVoMwYkZ6cka5ECjZS' : req.body.plan == 2 ? 'price_1OrVB6EVoMwYkZ6clVeJeYvA' : 'price_1OrVB6EVoMwYkZ6cA6b0YNrL',
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${req.body.host}/server/${req.body.serverID}`,
            cancel_url: `${req.body.host}/payment/${req.body.serverID}`,
            metadata: {
                plan:req.body.plan,
                serverID:req.body.serverID,
                uid:req.body.uid,
                action:'newSubscription'
            }
        });
        
        res.status(200).json({success:true,url:session.url})
    } catch (error) {
        console.error('Erro ao iniciar o checkout:', error);
        res.status(200).json({success:false})
    }
})


router.post('/subscription/update', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            
            success_url: `${req.body.host}/server/${req.body.serverID}`,
            cancel_url: `${req.body.host}/dashboard`,
            metadata: {
                plan:req.body.plan,
                serverID:req.body.serverID,
                uid:req.body.uid,
                action:'updatePayment'
            }
        });
        
        res.status(200).json({success:true,url:session.url})
    } catch (error) {
        console.error('Erro ao iniciar o checkout:', error);
        res.status(200).json({success:false})
    }
})

router.post('/webhook/stripe/payment',async (req, res) => {
    let data = req.body.data.object
    let type = req.body.type
    switch (type) {
        case 'checkout.session.completed':
            if (data.status == 'complete') {
                if (data.metadata.action == 'newSubscription') {
                    let user = await db.findOne({colecao:'users',doc:data.metadata.uid})
                    let servers = await functions.reqServerByTime(user,functions.findServers)
                    let filterServers = await servers.find(server=>server.id == data.metadata.serverID)
                    let serverADD = {
                        assinante:true,
                        id:data.metadata.serverID,
                        subscription:data.subscription,
                        plan:data.metadata.plan,
                        tipo:filterServers.tipo,
                        server_pic:filterServers.server_pic,
                        name:filterServers.name,
                        payment_status:data.payment_status,
                        isPaymented:true,
                        subscriptionData:{
                            lastPayment: data.created,
                            created:data.created,
                            email:data.customer_details.email,
                            name:data.customer_details.name,
                            phone:data.customer_details.phone,
                            expires_at:data.expires_at,
                            customer:data.customer
                        }
                    }
                    let newServer = []
                    if (user.server) {
                        newServer = user.server
                        newServer.push(data.metadata.serverID)
                    }else{
                        newServer.push(data.metadata.serverID)
                    }
                    db.update('users',data.metadata.uid,{
                        servers:newServer
                    })
                    db.create('servers',data.metadata.serverID,serverADD)
                }
                if (data.metadata.action == 'updatePayment') {
                    
                }
            }
            break;
        case 'invoice.payment_failed':
            if (data.billing_reason == "subscription_cycle") {
                if (data.attempt_count == 3) {
                    let server = await db.findOne({colecao:'servers',where:['subscription',"==",data.subscription]})
                    if (server.error) {
                        return
                    }
                    let pauseSubscription = await functions.pausarAssinatura(server.subscription,stripe)
                    console.log(pauseSubscription);
                    db.update('servers',server.id,{
                        payment_status:'paused',
                        isPaymented:false,
                    })
                    // pausar a assinatura do usuario
                }else if (data.attempt_count == 1) {
                    let server = await db.findOne({colecao:'servers',where:['subscription',"==",data.subscription]})
                    if (server.error) {
                        return
                    }
                    db.update('servers',server.id,{
                        payment_status:'pending',
                        isPaymented:false,
                    })
                    // integrar codigo de pendencia na fatura
                }
            }
            break;
        case 'invoice.payment_succeeded':
            if (data.status == 'paid') {
                let server = await db.findOne({colecao:'servers',where:['subscription',"==",data.subscription]})
                if (server.error) {
                    return
                }
                if (server.payment_status == 'paused') {
                    let returnSubscription = await functions.retomarAssinatura(server.subscription,stripe)
                    console.log(returnSubscription);
                }
                let subscriptionData = server.subscriptionData
                subscriptionData.expires_at = data.period_end
                subscriptionData.lastPayment = data.period_start
                db.update('servers',server.id,{
                    payment_status:data.status,
                    isPaymented:data.paid,
                    subscriptionData:subscriptionData
                })
            }
            
            break
        default:
            break;
    }
    
    res.status(200).end();
})




router.post('/addDadosBanc',async(req,res)=>{
    if (!req.session.uid) {
        res.status(200).json({success:false,data:'Sessao invalida'})
        return
    }

    let user = await db.findOne({colecao:'users',doc:req.session.uid})
    let server = await db.findOne({colecao:'servers',doc:req.body.serverID})
    if (user.bankData) {
        
    }else{
        
        await stripe.accounts.createExternalAccount(conta.id, {
            external_account: {
            object: 'bank_account',
            country: 'BR', // Código do país (Brasil)
            currency: 'BRL', // Moeda (Real Brasileiro)
            account_holder_name: dadosUsuario.nomeTitular,
            account_holder_type: 'individual',
            routing_number: dadosUsuario.codigoBanco, // Código do banco
            account_number: dadosUsuario.numeroConta // Número da conta
            }
        });
        console.log(bankAccount);
        db.update('servers',req.body.serverID,{
            bankData:{
                userRef:req.session.uid,
                nome:req.body.name,
                cpf:req.body.cpf,
                banco:req.body.bank,
                numero:req.body.numero,
                agencia:req.body.agencia
            }
        })
    }

    

})












module.exports = router;
