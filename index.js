/*
==================================================================================================
Variáveis
==================================================================================================
 __      __           _    __               _      
 \ \    / /          (_)  /_/              (_)     
  \ \  / /__ _  _ __  _   __ _ __   __ ___  _  ___ 
   \ \/ // _` || '__|| | / _` |\ \ / // _ \| |/ __|
    \  /| (_| || |   | || (_| | \ V /|  __/| |\__ \
     \/  \__,_||_|   |_| \__,_|  \_/  \___||_||___/
 
==================================================================================================
Variáveis
==================================================================================================
*/
const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const request = require("request")
const schedule = require("node-schedule")
const google = require("google")
    google.lang = 'pt'
    google.nextText = 'Mais'
const shortener = require("tinyurl")
const snekfetch = require("snekfetch")
const { gitCommitPush } = require("git-commit-push-via-github-api")

const gitToken = process.env.GITHUB_TOKEN

var token = require("./token.json")
var preMessages = require("./Database/mensagens.json")
var config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
var banned = JSON.parse(fs.readFileSync("./Database/banidos.json", "utf8"));
var warneds = JSON.parse(fs.readFileSync("./Database/avisados.json", "utf8"))
var changelog = JSON.parse(fs.readFileSync("./Database/changelog.json", "utf8"))
var profiles = JSON.parse(fs.readFileSync("./Database/profiles.json", "utf8"))

var muted = new Set();
var appealList = new Set();
var onChat = new Set();

var warnResponse = ""
var messageContainer
var maintaince = false

let whoWarned
let toWarn
let reason

var messageIds = []
var ytApi = "AIzaSyDgGHSUWhmmDcNuLK_DRwY-HgCUaG6VCOU"

var colectedChatTrainingMessages = ""

const hexBranco = "#ffffff"
const hexPreto = "#000000"
const hexVermelho = "#ff0000"
const hexVerde = "#00ff00"
const hexAzul = "#0000ff"
const hexAmarelo = "#ffff00"
const hexRosa = "#ff00ff"
const hexLaranja = "#ff6e00"

var d1f = "https://youtu.be/gW8FbixbI-s"


/*
==================================================================================================
Funções
==================================================================================================

  ______                /\/|           
 |  ____|              |/\/            
 | |__ _   _ _ __   ___ ___   ___  ___ 
 |  __| | | | '_ \ / __/ _ \ / _ \/ __|
 | |  | |_| | | | | (_| (_) |  __/\__ \
 |_|   \__,_|_| |_|\___\___/ \___||___/
                    )_)                

==================================================================================================
Funçoes
==================================================================================================
*/

//Commits do github 
async function commit(){
    console.log("Starting GitHub commits\n---------------------------")

    // Commit das mensagens coletadas anônimamente
    var files = fs.readdirSync('./ChatTraining/colectedMessages')
    files.forEach(key =>{
        gitCommitPush({
            owner: "MarcVFX",
            repo: "fxm_bot",
            token: gitToken,
    
            files : [{ path: "ChatTraining/colectedMessages", content: fs.readFileSync('./ChatTraining/colectedMessages/' + key, "utf-8")}],
            fullyQualifiedRef: "heads/master",
            commitMessage: "Automatic Message Colector TXTs commit"
        }).then(res =>{
            console.log("Messages saved\n---------------------------")
        }).catch(err =>{
            console.error(err)
        })
    })

    // Commit dos banidos
    await gitCommitPush({
        owner: "MarcVFX",
        repo: "fxm_bot",
        token: gitToken,

        files : [{ path: "Database/banidos.json", content: fs.readFileSync("./Database/banidos.json", "utf-8")}],
        fullyQualifiedRef: "heads/master",
        commitMessage: "Automatic bannedSave() JSON commit"
    }).then(res =>{
        console.log("Bans saved\n---------------------------")
    }).catch(err =>{
        console.error(err)
    })

    // Commit dos avisos
    await gitCommitPush({
        owner: "MarcVFX",
        repo: "fxm_bot",
        token: gitToken,

        files : [{ path: "Database/avisados.json", content: fs.readFileSync("./Database/avisados.json", "utf-8")}],
        fullyQualifiedRef: "heads/master",
        commitMessage: "Automatic warndsSave() JSON commit"
    }).then(res =>{
        console.log("Warns saved\n---------------------------")
    }).catch(err =>{
        console.error(err)
    })

    // Commit do changelog
    await gitCommitPush({
        owner: "MarcVFX",
        repo: "fxm_bot",
        token: gitToken,

        files : [{ path: "Database/changelog.json", content: fs.readFileSync("./Database/changelog.json", "utf-8")}],
        fullyQualifiedRef: "heads/master",
        commitMessage: "Automatic changelogSave() JSON commit"
    }).then(res =>{
        console.log("Changelog saved\n---------------------------")
    }).catch(err =>{
        console.error(err)
    })

    // Commit dos perfis do youtube
    await gitCommitPush({
        owner: "MarcVFX",
        repo: "fxm_bot",
        token: gitToken,

        files : [{ path: "Database/profiles.json", content: fs.readFileSync("./Database/profiles.json", "utf-8")}],
        fullyQualifiedRef: "heads/master",
        commitMessage: "Automatic profileSave() JSON commit"
    }).then(res =>{
        console.log("Profiles saved\n---------------------------")
    }).catch(err =>{
        console.error(err)
    })
    console.log("Finished GitHub commits")
    
}

// Funções de salvamento dos json
function bannedSave(){
    fs.writeFile("./Database/banidos.json", JSON.stringify(banned), (err) => {
        if (err) console.error(err)
      });
}
function warnedsSave(){
    fs.writeFile("./Database/avisados.json", JSON.stringify(warneds), (err) => {
        if (err) console.error(err)
      }); 
}
function changelogSave(){
    fs.writeFile("./Database/changelog.json", JSON.stringify(changelog), (err) => {
        if (err) console.error(err)
    }); 
}
function profileSave(){
    fs.writeFile("./Database/profiles.json", JSON.stringify(profiles), (err) => {
        if (err) console.error(err)
    }); 
}

// Checar cargo de ADMIN
function checkAdmin(message,send){
    if (send == null || undefined) send = true
    if (message.member.roles.some(r => ["Dono", "Admin"].includes(r.name))){ // Verifica o cargo de Admin ou Dono
        return true
    }
    else if (message.member.roles.some(r => ["Moderadores"].includes(r.name))) randomMessage("", "lowPerms") // Se não tiver, cheque o cargo de Moderador
    else {
        if(!send) return false
        message.channel.send(randomMessage("" , "perms")) // Senão, mensagem de erro
        return false
    }
}
// Checar cargo de MOD
function checkMod(message,send){
    if (send == null || undefined) send = true
    if (message.member.roles.some(r => ["Dono", "Moderadores", "Admin"].includes(r.name))){ // Verifica o cargo de Moderador, Admin ou Dono
        return true
    }
    else {
        if(!send) return false
        message.channel.send(randomMessage("" , "perms")) // Senão, mensagem de erro
        return false
    }
}

// Funções de conversão de tempo
// -----------------------------

// Anos para Milisegundos
function yearsToMilSecs(years){
    return monthsToMilSecs(years*12)
}
// Meses para Milisegundos
function monthsToMilSecs(months){
    return weeksToMilSecs(months * 4 + 2)
}
// Semanas para Milisegundos
function weeksToMilSecs(weeks){
    return daysToMilSecs(weeks*7)
}
// Dias para Milisegundos
function daysToMilSecs(days){
    return hoursToMilSecs(days*24)
}
// Horas para Milisegundos
function hoursToMilSecs(hours){
    return minsToMilSecs(hours*60)
}
// Minutos para Milisegundos
function minsToMilSecs(mins){
    return secsToMilSecs(mins*60)
}
// Segundos para Milisegundos
function secsToMilSecs(secs){
    return secs*1000
}

// Mensagens de erro
function randomMessage(type1, type2){
    switch (type1){
        //preMessages.error
        default:
            switch (type2){
                //preMessages.error.perms
                case "perms":
                    return preMessages.error.perms[Math.floor(Math.random() * preMessages.error.perms.length)]
                break;
                case "lowPerms":
                    return preMessages.error.lowPerms[Math.floor(Math.random() * preMessages.error.lowPerms.length)]
                break;
                //preMessages.error.default
                default:
                    return preMessages.error.default[Math.floor(Math.random() * preMessages.error.default.length)]
                break;
            }
        break;
    }
}

// Função de aviso
function warn(message){
    // Cria o embed
    let warnEmbed = new Discord.RichEmbed()
        .setAuthor("FXM Bot Alert", config.botImg)
        .setTitle("Aviso para " + toWarn.user.username)
        .setColor(hexAmarelo)
        .setTimestamp()
        .setDescription(whoWarned + " o avisou por: " + reason)
        .addField("Para remover o aviso, utilize " + config.prefix + "removewarn","@" + toWarn.user.username)
        .setThumbnail(toWarn.user.avatarURL)    
    // Cria o JSON
    warneds[toWarn.id] = {
        whoWarned: whoWarned,
        reason: reason,
        embed: warnEmbed
    }
    // Salva o JSON
    warnedsSave()
    // Envia a mensagem ao canal de controle
    let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle")
    toSend.send({embed: warnEmbed})
    // Envia a mensagem no canal
    message.channel.send({embed: warnEmbed})
    // Envia a mensagem ao usuário
    toWarn.user.send("Você recebeu um aviso",{embed: warnEmbed})

     
}

// Criar perfil do Youtube
function createProfile(url, id, message){
    request({
        url: url,
        json: true
    }, function(error,response,body){
        if (!error && response.statusCode === 200) {
            function descLess(desc){
                if(desc.length > 200){
                    let newDesc = desc.slice(0,200) +"..." // Corta a descrição para ter apenas 200 caracteres, no máximo
                    return newDesc
                }
                else return desc
            }
            let items = body.items[0]
            // Cria o perfil
            let embed = new Discord.RichEmbed()
                .setAuthor("Perfil do Youtube", "https://goo.gl/pnp1Dn")
                .setColor(hexVermelho)
                .setThumbnail(items.snippet.thumbnails.default.url)
                .setTitle(items.snippet.title)
                .setDescription(items.statistics.subscriberCount + " inscritos, " + items.statistics.videoCount + " vídeos publicados e " + items.statistics.viewCount + " visualizações")
                .addField("Descrição", descLess(items.snippet.description))
                .addField("Link do canal", "https://www.youtube.com/channel/" + id)
                .setFooter("Canal criado em: ")
                .setTimestamp(items.snippet.publishedAt)
            // Cria o JSON    
            profiles[message.author.id] = {
                channelId: id,
                embed: embed
            }
            // Salva o JSON
            profileSave()
            // Envia o perfil no canal
            message.channel.send("Perfil criado com sucesso!")
            message.channel.send({embed})
        }
    })
}
// Atualizar o Perfil do Youtube
function updateProfile(id){
    console.log("Updating profile: " + id)
    let url = "https://www.googleapis.com/youtube/v3/channels?part=snippet%2C%20contentDetails%2C%20brandingSettings%2C%20invideoPromotion%2C%20statistics%2C%20topicDetails&id=" + profiles[id].channelId + "&key=" + ytApi
    request({
        url: url,
        json: true
    }, function(error,response,body){
        if (!error && response.statusCode === 200) {
            function descLess(desc){
                if(desc.length > 200){
                    let newDesc = desc.slice(0,200) +"..."
                    return newDesc
                }
                else return desc
            }
            let items = body.items[0]
            let embed = new Discord.RichEmbed()
                .setAuthor("Perfil do Youtube", "https://goo.gl/pnp1Dn")
                .setColor(hexVermelho)
                .setThumbnail(items.snippet.thumbnails.default.url)
                .setTitle(items.snippet.title)
                .setDescription(items.statistics.subscriberCount + " inscritos, " + items.statistics.videoCount + " vídeos publicados e " + items.statistics.viewCount + " visualizações")
                .addField("Descrição", descLess(items.snippet.description))
                .addField("Link do canal", "https://www.youtube.com/channel/" + profiles[id].channelId)
                .setFooter("Canal criado em: ")
                .setTimestamp(items.snippet.publishedAt)
            profiles[id].embed = embed
            profileSave()
            console.log("Profile saved")
        }
    })
}

/*
==================================================================================================
Reações
==================================================================================================

  _____                     /\/|            
 |  __ \                   |/\/             
 | |__) | ___   __ _   ___  ___    ___  ___ 
 |  _  / / _ \ / _` | / __|/ _ \  / _ \/ __|
 | | \ \|  __/| (_| || (__| (_) ||  __/\__ \
 |_|  \_\\___| \__,_| \___|\___/  \___||___/
                       )_)                  

==================================================================================================
Reações
==================================================================================================
*/
client.on("messageReactionAdd", (reaction, user) =>{
    if (user.bot) return;
    if (user.id == warnResponse){
        if (reaction.emoji.name == "👍"){
            warn(messageContainer)
            warnResponse = ""
            messageContainer.channel.bulkDelete(messageIds)
            messageContainer.channel.send("Aviso criado")
            return;
        }
        if (reaction.emoji.name == "👎"){
            warnResponse = ""
            messageContainer.channel.bulkDelete(messageIds)
            messageContainer.channel.send("Aviso cancelado")
            return;
        }
    }
})


/*
==================================================================================================
Pronto
==================================================================================================
  _____                     _         
 |  __ \                   | |        
 | |__) |_ __  ___   _ __  | |_  ___  
 |  ___/| '__|/ _ \ | '_ \ | __|/ _ \ 
 | |    | |  | (_) || | | || |_| (_) |
 |_|    |_|   \___/ |_| |_| \__|\___/ 

==================================================================================================
Pronto
==================================================================================================
*/
client.on("ready", () =>{
    client.user.setPresence({game:{name: config.prefix + "help", type: 0}});
    console.log(" ")
    console.log(" ")
    console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
    console.log("Ready and Running c:")
    console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
    console.log(" ")
    console.log(" ")
});
/*
==================================================================================================
Deletada
==================================================================================================
  _____         _        _              _        
 |  __ \       | |      | |            | |       
 | |  | |  ___ | |  ___ | |_  __ _   __| |  __ _ 
 | |  | | / _ \| | / _ \| __|/ _` | / _` | / _` |
 | |__| ||  __/| ||  __/| |_| (_| || (_| || (_| |
 |_____/  \___||_| \___| \__|\__,_| \__,_| \__,_|

==================================================================================================
Deletada
==================================================================================================
*/
client.on("messageDelete", async (message) =>{
    const auditLog = await message.guild.fetchAuditLogs({type: 'MESSAGE_DELETE'}).then(audit => audit.entries.first())
    let user
    if(auditLog.extra.channel.id == message.channel.id && (auditLog.target.id == message.author.id) && auditLog.createdTimestamp > (Date.now() - 5000) && auditLog.extra.count >= 1){
        user = auditLog.executor
    } else {
        user = message.author
    }
    if (user.bot) return;
    let embed = new Discord.RichEmbed()
        .setTitle("Mensagem apagada")
        .setColor(hexVermelho)
        .setAuthor("FXM Bot Alert", config.botImg)
        .setThumbnail(message.author.avatarURL)
        .setTimestamp()
    if(user == message.author){
        embed.setDescription(user.tag + " deletou sua própria mensagem")
             .addField("Conteúdo",message.content)
    }
    else embed.setDescription(user.tag + " deletou a mensagem de "+ message.author.tag)
              .addField("Conteúdo",message.content)
    message.channel.guild.channels.get("440691700692680715").send({embed: embed})
})
/*
==================================================================================================
Editada
==================================================================================================
  ______     _  _  _              _        
 |  ____|   | |(_)| |            | |       
 | |__    __| | _ | |_  __ _   __| |  __ _ 
 |  __|  / _` || || __|/ _` | / _` | / _` |
 | |____| (_| || || |_| (_| || (_| || (_| |
 |______|\__,_||_| \__|\__,_| \__,_| \__,_|

==================================================================================================
Editada
==================================================================================================
*/
client.on("messageUpdate", (oldMsg,newMsg) =>{
    let user = oldMsg.author
    
    if(user.bot) return
    if(oldMsg.content == newMsg.content) return

    let embed = new Discord.RichEmbed()
        .setTitle("Mensagem editada")
        .setDescription(user.tag + " editou sua própria mensagem.")
        .setColor(hexAmarelo)
        .setAuthor("FXM Bot Alert", config.botImg)
        .setThumbnail(user.avatarURL)
        .setTimestamp()
        .addField("Mensagem original: ", oldMsg.content)
        .addField("Mensagem atual: ", newMsg.content)
    oldMsg.channel.guild.channels.get("440691700692680715").send({embed: embed})
})
/*
==================================================================================================
Novo Membro
==================================================================================================
  _   _                      __  __                   _                 
 | \ | |                    |  \/  |                 | |                
 |  \| |  ___ __   __ ___   | \  / |  ___  _ __ ___  | |__   _ __  ___  
 | . ` | / _ \\ \ / // _ \  | |\/| | / _ \| '_ ` _ \ | '_ \ | '__|/ _ \ 
 | |\  || (_) |\ V /| (_) | | |  | ||  __/| | | | | || |_) || |  | (_) |
 |_| \_| \___/  \_/  \___/  |_|  |_| \___||_| |_| |_||_.__/ |_|   \___/ 
                                                                                                                                                                                                             
=================================================================================================
Novo Membro
==================================================================================================
*/
client.on("guildMemberAdd", member =>{
    let first = `**Bem vindo <@${member.id}> à FXM!**\n\n`
    let second = `Aqui você poderá conversar com dzns de diversas áreas, mas, peço-lhe que leia as <#380375140309139456> e que sempre fique de olho nos <#380375162106937346>.\n`
    let third = `Nós da FX Masters agradecemos a sua presença, qualquer dúvida, reclamação ou qualquer outra necessidade, basta mencionar um __**Dono**__ ou um __**Admin**__.\n\n`
    let fourht = `Você recebeu uma outra mensagem no canal <#380361996404785162>, faça o que ela diz para ter uma maior interação com o bot\n\n`
    let fifth = `Marcus Aires - Fundador e Dono da FX Masters`
    let toSend = first+second+third+fourht
    client.guilds.find("name", "FXM").channels.get("380375204150378496").send(toSend).then(msg=>{
        setTimeout(()=>{
            toCommands()
        },secsToMilSecs(10))
        setTimeout(()=>{
            msg.delete()
        },minsToMilSecs(1))
    })
    function toCommands(){
        first = `<@${member.id}>, vamos definir o seu canal do YouTube como um perfil no bot, assim as pessoas podem ver o seu canal sem precisar abrir o navegador\n`
        second = `Digite \`${config.prefix}setprofile [id do canal]\`, o id pode ser adquirido assim: http://prntscr.com/ift8b1\n`
        third = `Você pode ver o perfil de outras pessoas usando o comando \`${config.prefix}profile [menção]\`\n\n`
        fourht = `Você pode ver uma lista completa de comandos do bot usando o comando \`${config.prefix}help\`, ele pode ser bem útil em certos momentos c:`
        toSend = first+second+third+fourht
        client.guilds.find("name", "FXM").channels.get("380361996404785162").send(toSend).then(msg=>{
            setTimeout(()=>{
                toGeneral()
            },secsToMilSecs(20))
            setTimeout(()=>{
                msg.delete()
            },minsToMilSecs(5))
        })
    }
    function toGeneral(){
        first = `Este é o canal geral, onde a atividade principal deste server se concentra, esperamos que faça bastante amigos e que traga os seus para cá!\n`
        second = `<@${member.id}>, mais uma vez, seja bem vindo à FXM!`
        toSend = first+second
        client.guilds.find("name", "FXM").channels.get("380360331005919236").send(toSend).then(msg=>{
            setTimeout(()=>{
                msg.delete()
            },minsToMilSecs(5))
        })
    }
})
/*
==================================================================================================
Mensagem
==================================================================================================
  __  __                                                  
 |  \/  |                                                 
 | \  / |  ___  _ __   ___   __ _   __ _   ___  _ __ ___  
 | |\/| | / _ \| '_ \ / __| / _` | / _` | / _ \| '_ ` _ \ 
 | |  | ||  __/| | | |\__ \| (_| || (_| ||  __/| | | | | |
 |_|  |_| \___||_| |_||___/ \__,_| \__, | \___||_| |_| |_|
                                    __/ |                 
                                   |___/

=================================================================================================
Mensagem
==================================================================================================
*/
client.on("message", (message) =>{  
    // Mensagens que não comecem com prefixo são adicionadas ao arquivo de coleta de mensagens anônimas
    if (!message.content.startsWith(config.prefix)){
        colectedChatTrainingMessages = colectedChatTrainingMessages + `${message.content}\r\n`
    }

    // Dividindo a mensagem em argumentos
    var args = message.content.split(" ");
// Sem prefixo abaixo
    if(muted.has(message.author.id)){
        message.delete()
        return;
    }
// com prefixo abaixo
    if(message.author.bot) return;

    // Comando de D1F
    if(message.channel.name == "d1f" && !message.content.includes("http")){
        message.delete()
        message.reply("Você precisa enviar um link válido").then(msg =>{
            setTimeout(function(){
                msg.delete()
            }, secsToMilSecs(10))
            return
        })
    }
    // Commando de D1F
    if(message.channel.name == "d1f" && message.content.includes("http")){
        message.reply("A sua intro foi adicionada à fila").then(msg =>{
            var intro = message.author.username + " | " + message.content
            fs.writeFile("./D1F/" + message.author.username + ".txt", intro, (err) =>{        
                if (err) throw err
            })
            setTimeout(function(){
                msg.delete()
            },secsToMilSecs(10))
        })
    }
    // Checa se a mensagem foi enviada no chat de comandos
    if(message.guild.name == "FXM"){
        if(message.channel.name !== "bot_commands" && !checkAdmin(message,false)) return
    }
/*
==================================================================================================
   ___  _           _   
  / __|| |_   __ _ | |_ 
 | (__ | ' \ / _` ||  _|
  \___||_||_|\__,_| \__|

================================================================================================== 
*/
    if(onChat.has(message.author.id)){ // Verifica se o usuário está no chat
        if (message.content == ".chat"){ // Remove o usuário do chat
            message.reply("Você foi removido do ChatBot")
            onChat.delete(message.author.id)
            return;
        }
        var entry 
        if (message.content == "") entry = "ahfeahfea" // Verifica se uma mensagem foi digitada
        entry = encodeURIComponent(message.content) // Codifica a mensagem para ser amigável à URL
        // Cria a url de request à API
        var url = "https://api.dialogflow.com/v1/query?v=20170712&query=" + entry + "&lang=pt-br&sessionId=f5afe3ab-6def-4d78-b412-39236534fe7c&timezone=America/Sao_Paulo"
        snekfetch.get( // Faz o request à api
            url , { headers: { 'Authorization': 'Bearer 53f6b34b22634536afbc2d01c3cc6e44' } })
            .then(r => {
                message.channel.send(r.body.result.fulfillment.speech) 
                // Caso a mensagem não seja compreendida...
                if(r.body.result.fulfillment.speech == "Não entendi, mas sua mensagem foi salva para que possa ser usada no meu treinamento"){
                    entry = decodeURIComponent(entry) // ...crie um arquivo para treinamento
                    fs.writeFile("./ChatTraining/" + message.createdTimestamp + ".txt", entry, (err) =>{
                        if (err) throw err
                    })
                }
        })  
        return;  
    }
/*
==================================================================================================
  ___             __  _           
 | _ \ _ _  ___  / _|(_)__ __ ___ 
 |  _/| '_|/ -_)|  _|| |\ \ // _ \
 |_|  |_|  \___||_|  |_|/_\_\\___/

================================================================================================== 
*/
    if(!message.content.startsWith(config.prefix)) { // Verifica se a mensagem começa com o prefixo
        return;
    }

    var command = args[0] // Remove o comando dos argumentos
    command = command.slice(config.prefix.length); // Remove o prefixo do comando
    args.shift()
    
/*
==================================================================================================

  __  __                   _                    /\/|     
 |  \/  | __ _  _ _  _  _ | |_  ___  _ _   __  |/\/  ___ 
 | |\/| |/ _` || ' \| || ||  _|/ -_)| ' \ / _|/ _` |/ _ \
 |_|  |_|\__,_||_||_|\_,_| \__|\___||_||_|\__|\__,_|\___/
                                           )_)           
================================================================================================== 
*/
    if(maintaince) { // Desativa o modo de manutenção
        if(message.content.startsWith(config.prefix + "maintance")){ 
            maintaince = false
            message.channel.send("Modo manutenção desativado")
            client.user.setStatus("online")
            client.user.setPresence({game:{name: config.prefix + "help", type: 0}});
            return;
        }
        else return;
    }

    
    switch (command){
// Com prefixo abaixo
        
        /*
        ==================================================================================================
         ___                        _           ___              _    
        / __|___ _ __  __ _ _ _  __| |___ ___  / __|___ _ _ __ _(_)___
       | (__/ _ \ '  \/ _` | ' \/ _` / _ (_-< | (_ / -_) '_/ _` | (_-<
        \___\___/_|_|_\__,_|_||_\__,_\___/__/  \___\___|_| \__,_|_/__/

        ================================================================================================== 
        */

        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // Dimensões de imagem e vídeo
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "dimensões":
        case "dimensions":
        case "tamanhos":
        case "sizes":
            // Vídeo em 16:9
            let video169 = "**Vídeo (16:9)**\n`144p`: 256x144 \n`240p`: 426x240\n`360p`: 640x360\n`HQ(480p)`: 854x480\n`HD(720p)`: 1280x720\n`Full HD(1080p)`: 1920x1080,\n`2k`: 2560x1440\n`4k`: 3840x2160"
            // Vídeo em 4:3
            let video43 = "**Vídeo (4:3)**\n`QVGA`: 360x640\n`VGA`: 640x480\n`VGA`: 720x480\n`SVGA`: 800x600\n`XGA`: 1024x768"
            // Imagens de mídias sociais
            let cover = "**Capas**\n`Facebook (perfil)`: 180x180 (mínimo)\n`Facebook (capa)`: 851x310 (mínimo)\n`YouTube (capa)`: 2560x1440\n`YouTube (perfil)`: 1000x1000\n`YouTube (thumb)`: 1280x720\n`Twitter (capa)`: 1500x500\n`Twitter (perfil)`: 1000x1000"
            message.channel.send("Aqui estão algumas das dimensões mais usadas na indústria:\n\n" + video169+"\n\n"+video43+"\n\n"+cover)
            
        break;
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // Layouts de design
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "layouts":
        case "layout":
            // Layout para capa do youtube
            let youtubeBanner = '`Youtube`: https://i.imgur.com/Q3sdqeW.png'
            message.channel.send("Aqui estão alguns dos layouts usados:\n\n"+ youtubeBanner)
        break;
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // ChatBot
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "chat":
        case "conversa":
                message.reply("Você foi adicionado ao ChatBot, para sair digite `" + config.prefix + "chat` novamente")
                onChat.add(message.author.id) // Adiciona a pessoa ao chat
        break;
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // Encurtador de URL
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "short":
        case "shortener":
        case "shorter":
        case "encurtar":
        case "encurtardor":
            if(args[0] == undefined || message.content.includes("http")){ // Verifica se há alguma URL
                message.channel.send("Você precisa especificar uma URL a ser encurtada")
                return;
            }
            shortener.shorten(args[0], res =>{ // Encurta a URL
                request(res, (err,response,body)=>{
                    if (!err) message.channel.send("URL encurtada: " + res)
                    else message.channel.send("Não foi possível encurtar a URL")
                })
            })
        break;
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // Faz uma pesquisa no google
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "google":
        case "search":
        case "s":
        case "g":
        case "pesquisa":
        case "pesquisar":
            var maxResults
            var pesquisa
            if (args[0] == undefined){ // Verifica se algo foi pesquisado
                message.channel.send("Você precisa especificar um termo de busca")
                return;
            }
            else if (Number(args[0] && Number(args[0]) <= 10)){ // Verifica se um número maior que 1 de resultados foi pedido
                maxResults = args[0]
                pesquisa = args.slice(1).join(" ") // Define o termo de pesquisa
            }
            else {
                maxResults = 1 // Caso nenhum número seja definido, 1 é setado
                pesquisa = args.join(" ") // Define o termo de pesquisa
            }
            google(pesquisa, (err,res) =>{ // Pesquia no google com o termo já definido
                if (err) console.log(err) 
                if (maxResults == 1){ // Caso a quantidade de resultados seja 1, um embed é criado...
                    var title = res.links[0].title
                    var href = res.links[0].href
                    var searchDescription = res.links[0].description
                    let embed = new Discord.RichEmbed()
                        .setAuthor("Pesquisa do google", "https://goo.gl/UYNh6k")
                        .setTitle(title)
                        .setDescription(searchDescription) // ...com a descrição da pesquisa
                        .setURL(href)
                        .setFooter("Você pode adquirir mais resultados colocando um número antes do termo pesquisado")
                        .setColor(hexVerde)
                        message.channel.send({embed})
                }
                else { // Senão, um embed é criado com...
                    let embed = new Discord.RichEmbed()
                        .setAuthor("Pesquisa do google", "https://goo.gl/UYNh6k")
                        .setTitle("Termo pesquisado: " + pesquisa)
                        .setDescription("Mostrando um total de " + maxResults + " resultados")
                        .setFooter("Você pode adquirir mais resultados colocando um número, menor ou igual à 10, antes do termo pesquisado")
                        .setColor(hexVerde)
                        for (let i = 0; i < maxResults; i++){ // A quantidade de resultados solititada
                            embed.addField(res.links[i].title, res.links[i].href)
                        } 
                        message.channel.send({embed}) // A mensagem é enviada
                }
            })
        break;
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // Faz uma pesquisa no youtube
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "youtube":
        case "yt":
        case "video":
        case "y":
            var maxResults
            var pesquisa
            if (args[0]==undefined){ // Verifica se algo foi pesquisado
                message.channel.send("Você precisa especificar um termo de busca")
                return;
            }
            else if (Number(args[0]) && Number(args[0]) <= 10){ // Verifica se um número maior que 1 de resultados foi pedido
                maxResults = args[0]
                pesquisa = args.slice(1).join(" ") // Define o termo de pesquisa
            }
            else { 
                maxResults = 1 // Caso nenhum número seja definido, 1 é setado
                pesquisa = args.join(" ") // Define o termo de pesquisa
            }
            
            // Define a URL de pesquisa na API
            var url = "https://www.googleapis.com/youtube/v3/search?part=id%2C%20snippet&maxResults=" + maxResults + "&q=" + pesquisa + "&regionCode=BR&type=video&key="+ ytApi
            // Faz o request à API
            request({url: url, json: true}, (err,res,body)=>{
                if (err || res.statusCode !== 200) return;
                var embed = new Discord.RichEmbed() // Cria o embed
                    .setAuthor("Pesquisa do YouTube", "https://goo.gl/pnp1Dn")
                    .setTitle("Termo pesquisado: " + pesquisa)
                    .setDescription("Mostrando um total de " + maxResults + " resultados")
                    .setColor(hexVermelho)
                    .setFooter("Você pode adquirir mais resultados colocando um número, menor ou igual à 10, antes do termo pesquisado")
                    
                    if (maxResults == 1) embed.setThumbnail(body.items[0].snippet.thumbnails.high.url) // Caso a quantidade de resultados seja 1, um embed é criado com a thumbnail do vídeo
                    
                    for(var i = 0; i < maxResults; i++){ // Senão, um embed é criado com a quantidade de resultados solicitado
                        embed.addField(body.items[i].snippet.title + " | " + body.items[i].snippet.channelTitle,"http://youtu.be/" + body.items[i].id.videoId)
                    }
                    // A mensagem é enviada
                    message.channel.send({embed})
            })
        break;
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // Visualiza um perfil do youtube
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        
        case "profile":
        case "perfil":
            if(message.mentions.members.size == 0){ // Caso não haja nenhuma menção...
                if(profiles[message.author.id]){
                    message.channel.send({embed: profiles[message.author.id].embed}) // Envia o próprio perfil, caso ele exista
                    return;
                }
                else{
                    message.reply(`Você não tem um perfil criado, crie um usando o comando ${config.prefix}setprofile [id do canal]`)
                    return;
                }
                
            }
            let id = message.mentions.members.first().id
            if(!profiles[id]){ // Verifica se o membro mencionado tem um perfil criado
                message.channel.send("Este membro não tem um perfil criado")
                return;
            }
            message.channel.send({embed: profiles[id].embed}) // Envia o perfil do membro mencionado
        break;
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // Cria um perfil do youtube
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        
        case "setprofile":
        case "setarperfil":
        case "setperfil":
        case "setarprofile":
            if(args[0] == undefined){ // Verifica se o ID do canal foi escrito
                message.channel.send("Você precisa especificar o ID do seu canal http://prntscr.com/ift8b1")
                return
            }
            channelId = args[0] // Recebe o id do canal
            var url = "https://www.googleapis.com/youtube/v3/channels?part=snippet%2C%20contentDetails%2C%20brandingSettings%2C%20invideoPromotion%2C%20statistics%2C%20topicDetails&id=" + channelId + "&key=" + ytApi
            // Chama a função para criar um perfil
            createProfile(url, channelId, message)
        break;
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // Comando de ping
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "latência":
        case "ping":
            let ping = message.createdTimestamp - new Date().getTime() // Gera o ping
            message.channel.send("Seu ping: " + Math.floor(client.ping) + " ms") // Envia a mensagem
        break;
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         //random  
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  
        case "random":
        case "aleatorio":
        case "randomico":
        case "aleatório":
        case "randômico":
            if (args[0] == undefined){ // Verifica se um valor máximo foi informado
                message.channel.send("Você precisa informar um valor máximo")
                return;
            }
            if (!Number(args[0])){ // Verifica se o valor informado foi um número
                message.channel.send("Você precisa informar um valor numérico")
                return;
            }
            if(args[1] == undefined){ // Gera o número aleatório com um valor máximo
                let random = Math.floor(Math.random() * args[0])+1
                message.channel.send("O valor resultante foi: " + random)
            } 
            else{ // Verifica se o valor máximo é um número
                if (!Number(args[1])){
                    message.channel.send("Você precisa informar um valor numérico")
                    return;
                }
                if (Number(args[1]) <= Number(args[0])){ // Verifica se o valor mínimo é maior ou igual ao máximo
                    message.channel.send("O valor máximo não pode ser menor ou igual ao valor mínimo")
                    return;
                }
                let random = Math.floor(Math.random() * (args[1]) - (args[0]))+1 // Gera o número aleatório com um valor mínimo e máximo
                random = random + Number(args[0])
                message.channel.send("O valor resultante foi: " + random)
            }
        break;
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // Comando EasterEgg
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "waffle":
            message.channel.send("Aqui está: " + d1f);
        break;
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // 8ball
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "8ball":
            if (args[0] == undefined){
                message.channel.send("Você precisa me perguntar algo")
                return;
            }
            message.reply(preMessages.eightBall[Math.floor(Math.random() * preMessages.eightBall.length)])
        break;
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // Cria um convite
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "invite":
        case "convite":
        case "convidar":
            message.channel.send("Aqui está: " + config.invite + " c:")
        break;
/*
        ==================================================================================================
         ___       _            _    
        | __|_ __ | |__  ___ __| |___
        | _|| '  \| '_ \/ -_) _` (_-<
        |___|_|_|_|_.__/\___\__,_/__/

        ================================================================================================== 
        */

        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // Informações
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "info":
            let embed = new Discord.RichEmbed()
                .setAuthor(config.author[0] , config.author[1])
                .setColor(hexBranco)
                .setTitle("Versão: " + changelog.versions[0])
                .setDescription(config.developed)
                .addField("Pacotes NPM", config.packages, true)
                .addField("Banco de dados", config.database, true)
                .setThumbnail(config.botImg)
                .setFooter("Versão compilada")
                .setTimestamp(changelog[changelog.versions[0]].timestamp)
            message.channel.send({embed})
        break;
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // Ajuda
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "help":
        case "ajuda":
            if (args[0] !== undefined){ // Verifica se a ajuda de um comando específico foi solicitado
                let cmdHelp = args[0]
                if (!config.help[cmdHelp]){
                    message.channel.send("O comando não existe")
                    return;
                }
                message.channel.send("`" + config.prefix + args[0] + config.help[cmdHelp].moreInfo) // Se sim, envie
                return;
            }
            else{
                    // Se nenhum comando foi citado...
                    let messageToSend = "**Todos os comandos estão listados abaixo** \nPara adquirir mais informações, digite " + config.prefix + "help e o comando \n \n"
                    // Crie uma lista de todos os comandos
                    var help = config.help.commands.forEach(c =>{
                    messageToSend = messageToSend + "`" + c + "`: " + config.help[c].info + "\n"
                    
                })
                // E a envie
                message.channel.send(messageToSend)
        }
        break;
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // Ajuda de comandos administrativos
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "helpadm":
        case "ajudaadm":
            if (args[0] !== undefined){ // Verifica se a ajuda de um comando específico foi solicitado
                let cmdHelp = args[0]
                if (!config.helpAdm[cmdHelp]){
                    message.channel.send("O comando não existe")
                    return;
                }
                message.channel.send("`" + config.prefix + args[0] + config.helpAdm[cmdHelp].moreInfo) // Se sim, envie
                return;
            }
            else{   
                    // Se nenhum comando foi citado...
                    let messageToSend = "**Todos os comandos estão listados abaixo** \nPara adquirir mais informações, digite " + config.prefix + "help e o comando \n \n"
                    // Crie uma lista de todos os comandos
                    var help = config.helpAdm.commands.forEach(c =>{
                    messageToSend = messageToSend + "`" + c + "`: " + config.helpAdm[c].info + "\n"
                    
                })
                // E a envie
                message.channel.send(messageToSend)}
        break;
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // Changelog
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "changelog":
        case "alterações":
        case "alteracoes":
        case "alteraçoes":
        case "alteracões":
                if(args[0] == undefined){ // Verifica se nenhum comando de changelog foi solicitado, se não, envia as últimas 4 versões do changelog
                    let embed = new Discord.RichEmbed()
                        .setColor(hexBranco)
                        .setTitle("Changelog")
                        .setDescription("Para mais informações, digite " + config.prefix + "changelog e a versão desejada.")
                    for(let i = 0; i <= 4; i++){
                        let version = changelog.versions[i]
                        embed.addField("Versão: "+ version, changelog[version].short)
                    }
                    message.channel.send({embed})
                }
                else if (args[0] == "add"){ // Adicionar uma nova versão ao changelog
                    if (checkAdmin(message)){
                        
                        let fullDesc = args.slice(2).join(" ") // Descrição completa
                        let dividedDesc = fullDesc.split("><") // Descrição dividida
                        let version = args[1] // Versão

                        if (args[1] == undefined){ // Verifica se a versão foi incluída
                            message.channel.send("Você precisa inserir uma versão")
                            return;
                        }
                        if (!fullDesc.includes("><")){ // Verifica se a descrição contém os caracteres separadores
                            message.channel.send("Você precisa inserir os caracteres separadores \"><\"")
                            return;
                        }
                        if (dividedDesc[0] == undefined){ // Verifica se existe uma descrição curta
                            message.channel.send("Você precisa inserir uma descrição curta")
                            return;
                        }
                        if (dividedDesc[1] == undefined){ // Verifica se existe uma descrição detalhada
                            message.channel.send("Você precisa inserir uma descrição detalhada")
                            return;
                        }
                        if (!changelog[version]) { // Verifica se a versão já existe
                            changelog[version] = { // Se não, cria ela
                                short: dividedDesc[0],
                                long: dividedDesc[1],
                                timestamp: new Date()
                            }
                            changelog.versions.unshift(version)
                            changelogSave() // Salva o changelog
                            let toSend = message.guild.channels.find("name", "anuncios") // Acha o canal para enviar
                            let embed = new Discord.RichEmbed() // Cria o embed
                                .setAuthor(message.author.username, message.author.avatarURL)
                                .setColor(hexVerde)
                                .setTitle("Versão: "+version)
                                .addField(dividedDesc[0],dividedDesc[1])
                                .setTimestamp()
                            toSend.send("Uma nova versão do bot ficou disponível:") // Envia a mensagem no canal anúncios
                            toSend.send({embed})
                            message.channel.send("Versão adicionada no changelog") // Envia a mensagem no canal
                            return;
                        }
                    }
                }
                else {
                    function versionToCheck(value){ // Função para verificar a versão
                        return value == args[0]
                    }
                    let version = changelog.versions.filter(versionToCheck) // Identifica a versão
                    if(version[0]== undefined){ // Verifica se a mesma é válida
                        message.channel.send("Essa não é uma versão válida")
                        return;
                    }
                    message.channel.send("Versão " + version + ": " + changelog[version].long) // Envia a descrição longa no canal
                }
        break;
/*
        ==================================================================================================

           _      _       _      _    _                /\/|    
          /_\  __| |_ __ (_)_ _ (_)__| |_ _ _ __ _ __ |/\/ ___ 
         / _ \/ _` | '  \| | ' \| (_-<  _| '_/ _` / _/ _` / _ \
        /_/ \_\__,_|_|_|_|_|_||_|_/__/\__|_| \__,_\__\__,_\___/
                                                    )_)         

        ================================================================================================== 
        */
        
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // Manutenção
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "maintance":
        case "maintaince":
        case "manutenção":
                if (!checkAdmin(message)) return // Verifica o cargo de Admin
                maintaince = true
                message.channel.send("Ativando o modo manutenção")
                client.user.setPresence({game:{name: "Em manutenção", type: 0}});
                client.user.setStatus("idle")
        break;
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        //         // Enviar
        // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "send":
        case "enviar":
            if(checkMod(message)){ // Verifica se é moderador
                if(message.mentions.channels.size == 0){ // Verifica se um canal foi mencionado
                    message.channel.send("Você precisa mencionar um canal")
                    return;
                }
                let channel = message.mentions.channels.first() // Encontra o canal
                let index = args.indexOf(channel) // Encontra o canal nos argumentos
                let messageToSend = args.splice(index,1) // Remove o canal dos argumentos
                channel.send(messageToSend) // Envia a mensagem
            }
        break;
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
            //         // Clean
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "clean":
        case "clear":
        case "limpar":
        case "apagar":
                if(checkMod(message)){ // Verifica se é moderador
                    if(!Number(args[0])){ // Verifica se uma quantidade de mensagens a ser deletada foi específicada
                        message.channel.send("Você precisa especificar a quantidade de mensagens a ser apagadas")
                        return;
                    }
                    if (Number(args[0] > 100)){ // Verifica se a quantidade de mensagens a ser deletada é maior do que 100
                        message.channel.send("Você precisa especificar uma quantidade menor ou igual a 100, desculpa, limitações da API :c")
                        return;
                    }
                    clean() // chama a função clean
                    async function clean(){ 
                        await message.delete() // Deleta a mensagem original
                        await message.channel.bulkDelete(Number(args[0])) // Deleta as mensagens
                        await message.reply("Apagou " + args[0] + " mensagens deste canal").then(msg =>{
                            setTimeout(() =>{
                                msg.delete()
                            }, secsToMilSecs(10))
                            
                        })
                    }
                }
        break;
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
            //         // Warn
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "warn":
        case "aviso":
        case "avisar":
                if(checkMod(message)){ // Checa se é moderador
                    messageContainer = message // Mensagem
                    whoWarned = message.author.tag // Quem avisou
                    
                    if(message.mentions.members.size == 0){ // Verifica se avisou alguém
                        message.channel.send("Você precisa mencionar um membro")
                        return;
                    }
                    if(toWarn.id == message.author.id){ // Verifica se o avisado é sí mesmo
                        message.channel.send("Você não pode se avisar")
                        return;
                    }
                    if(args[1] == undefined){ // Verifica se um motivo foi específicado
                        message.channel.send("Você precisa especificar um motivo")
                        return;
                    }

                    toWarn = message.mentions.members.first() // Quem deve ser avisado
                    reason = args.slice(1).join(" ") // Motivo
                    

                    if(warneds[toWarn.id]){ // Verifica se o membro já tem um aviso
                        console.log(message.id)

                        message.channel.send("Este membro já tem um aviso, deseja criar outro aviso? Isso irá sobescrever o existente").then(m => {messageIds.push(m)})
                        message.channel.send({embed: warneds[toWarn.id].embed}).then(m => {
                            react() // Cria uma caixa de diálogo onde o membro seleciona se quer sobrescrever o antigo aviso
                            async function react(){
                                await m.react("👍")
                                await m.react("👎")
                                messageIds.push(m) // Coloca a mensagem na lista de espera para ser apagada
                            }
                        })
                        message.channel.send("Você tem 30 segundos para fazer isso").then(m => {messageIds.push(m)}) // Coloca a mensagem na lista de espera para ser apagada
                        .catch(err => {console.log(err)})
                        warnResponse = message.author.id // Coloca quem avisou na lista de espera de reações
                        setTimeout(() =>{
                            warnResponse = "" // Após 30 segundos, remove quem avisou da lista de espera de reações
                            message.channel.bulkDelete(messageIds) // Deleta as mensagens
                            message.channel.send("Tempo esgotado").then(msg =>{ // Envia uma mensagem de tempo esgotado e depois apaga ela
                                setTimeout(() =>{
                                    msg.delete()
                                },secsToMilSecs(10))
                            })
                        }, secsToMilSecs(30))
                        return;
                    }
                    
                    warn(messageContainer)
                }
        break;
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
            //         // Remover warn
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "removewarn":
        case "removeraviso":
        case "removerwarn":
                if(checkAdmin(message)){ // Checa se é admin
                    let whoRemoved = message.author.tag // Quem removeu o aviso
                    let toRemove = message.mentions.members.first() // De quem deve ser removido o aviso
                    let reason = args.slice(1).join(" ") // Motivo

                    if(message.mentions.members.size == 0){ // Verifica se alguém foi mencionado
                        message.channel.send("Você precisa mencionar um membro")
                        return;
                    }
                    if(toRemove.id == message.author.id){ // Verifica se você está retirando o próprio aviso 
                        message.channel.send("Você não pode remover seu próprio aviso")
                        return;
                    }
                    if(!warneds[toRemove.id]){ // Verifica se o membro tem um aviso
                        message.channel.send("Esse membro não tem um aviso ainda")
                        return;
                    }
                    if (args[1] == undefined){ // Verifica se um motivo foi específicado
                        message.channel.send("Você precisa especificar um motivo")
                        return;
                    }

                    delete warneds[toRemove.id] // Remove o aviso
                    let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle") // Encontra o canal de controle
                    let embed = new Discord.RichEmbed() // Cria um embed
                        .setTitle("Remoção de aviso")
                        .setColor(hexVerde)
                        .setAuthor("FXM Bot Alert", config.botImg)
                        .setThumbnail(toRemove.user.avatarURL)
                        .setDescription(whoRemoved + " removeu o aviso de " + toRemove.user.username +" , motivo: " + reason)
                        .setTimestamp()
                    toSend.send({embed}) // Envia o embed no canal de controle
                    message.channel.send({embed}) // Envia o embed no canal
                    warnedsSave() // Salva os avisos
                }
        break;
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
            //         // Ver warn
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "viewwarn":
        case "veraviso":
        case "visualizaraviso":
        case "verwarn":
            if (checkMod(message)){ // Checa se é moderador
                let toView = message.mentions.members.first() // De quem o aviso será visualizado
                
                if(message.mentions.members.size == 0){ // Verifica se alguém foi mencionado
                    message.channel.send("Você precisa mencionar um membro")
                    return;
                }
                if(warneds[toView.id]){ // Verifica se o membro tem um aviso
                    message.channel.send({embed: warneds[toView.id].embed}) // Se sim, envie no canal
                }
                else message.channel.send("Este membro não tem nenhum aviso") // Senão, mensagem de erro
                
            }
            else if (warneds[message.author.id]){ // Se não for moderador e tiver um aviso
                message.channel.send({embed: warneds[message.author.id].embed}) // Envie o próprio aviso
                return;
            }
            else message.channel.send("Você não tem nenhum aviso") // Senão, mensagem de erro
        break;
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
            //         // Mute
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "mute":
        case "silenciar":
        case "calar":
            if (checkMod(message)){ // Checa se é moderador
                let whoMuted = message.author.username + " #" + message.author.discriminator // Quem mutou
                let reason = args.slice(2).join(" ") // Motivo
                let toMute = message.mentions.members.first() // Quem deverá ser mutado
                
                if (message.mentions.members.size == 0){ // Verifica se alguém foi mencionado
                    message.channel.send("Você precisa mencionar um membro")
                    return;
                }
                if (message.author.id == toMute.id){ // Verifica se quem irá ser mutado é quem está mutando
                    message.channel.send("Você não pode se mutar")
                    return;
                }
                if (!Number(args[1])){ // Verifica se um tempo foi específicado
                    message.channel.send("Você precisa especificar um tempo em minutos")
                    return;
                }
                if(args[2] == undefined){ // Verifica se um motivo foi específicado
                    message.channel.send("Você precisa especificar um motivo")
                    return;
                }
                if (toMute.id == client.user.id){ // Verifica se quem ta mutando é a mesma pessoa que vai ser mutada
                    message.channel.send("Você não pode me mutar")
                    return;
                }

                let time = minsToMilSecs(args[1]) // Converte o tempo de minutos para Milisegundos
                
                muted.add(toMute.id) // Muta o membro
                setTimeout(()=>{
                    muted.delete(toMute.id) // E remove o mute...
                },time) // ...após o tempo se esgotar

                let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle") // Encontra o canal controle
                let embed = new Discord.RichEmbed() // Cria um embed
                    .setTitle("Mute")
                    .setColor(hexAmarelo)
                    .setAuthor("FXM Bot Alert", config.botImg)
                    .setThumbnail(toMute.user.avatarURL)
                    .setDescription(whoMuted + " mutou " + toMute.user.username +" por " + args[1] + " minutos, motivo: " + reason)
                    .addField("Para desmutar o mesmo, utilize o " + config.prefix + "unmute", "@" + toMute.user.username)
                    .setTimestamp()
                toSend.send({embed}) // Envia o embed no canal de controle
                message.channel.send({embed}) // Envia o embed no canal
                toMute.user.send("Você foi mutado", {embed: embed}) // Envia para o membro que ele foi avisado
            }
        break;
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
            //         // Unmute
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "unmute":
        case "desmutar":
        case "descalar":
            if (checkMod(message)){ // Verifica se é moderador
                let whoUnMuted = message.author.tag // Quem desmutou
                let toUnMute = message.mentions.members.first() // Quem será desmutado
                let reason = args.slice(1).join(" ") // Motivo
                
                if (message.mentions.members.size == 0){ // Verifica se há algum membro mencionado
                    message.channel.send("Você precisa mencionar o membro")
                    return;
                }
                if (!muted.has(toUnMute.id)){ // Verifica se o membro está mutado
                    message.channel.send("O membro informado não consta na lista de mute")
                    return;
                }
                if (args[1] == undefined){ // Verifica se um motivo foi específicado
                    message.channel.send("Você precisa especificar um motivo")
                    return;
                }
                muted.delete(toUnMute.id) // Remove o membro da lista de mute
                
                let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle") // Encontra o canal de controle
                let embed = new Discord.RichEmbed() // Cria um embed
                    .setTitle("Unmute")
                    .setColor(hexVerde)
                    .setAuthor("FXM Bot Alert", config.botImg)
                    .setThumbnail(toUnMute.user.avatarURL)
                    .setDescription(whoUnMuted + " desmutou " + toUnMute)
                    .setTimestamp()
                toSend.send({embed}) // Envia o embed no canal de controle
                message.channel.send({embed}) // Envia o embed no canal
                toUnMute.user.send("Você foi desmutado", {embed: embed}) // Avisa para o membro que ele foi desmutado
            }
        break;
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
            //         // Kick
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "kick":
        case "expulsar":
            if (checkMod(message)){ // Verifica se é moderador
                let whoKicked = message.author.tag // Quem kickou
                let reason = args.slice(1).join(" ") // Motivo
                let toKick = message.mentions.members.first() // Quem será kickado
                
                if(args[1] == undefined){ // Verifica se um motivo foi específicado
                    message.channel.send("Você precisa especificar um motivo")
                    return;
                }
                
                if (message.mentions.members.size == 0){ // Verifica se um membro foi mencionado
                    message.channel.send("Você precisa mencionar um membro")
                    return;
                }
                if (message.author.id == toKick.id){ // Verifica se quem será kickado é a mesma pessoa que está kickando
                    message.channel.send("Você não pode se kickar")
                    return;
                }
                if (toKick.id == client.user.id){ // Verifica se está tentando kickar o bot
                    message.channel.send("Você não pode me kickar")
                    return;
                }
                kick() // Chama a função kick
                async function kick(){ // Que avisa o membro que ele foi kickado e que que ele pode apelar, além de kickar o membro
                    await toKick.user.send("Você foi kickado da FX Masters pelo seguinte motivo: " + reason + " " + config.invite)
                    await toKick.user.send("Para fazer um apelo, digite " + config.prefix + "appeal em nosso server de apelos: https://discord.gg/ZaMyX8A")
                    await toKick.user.send("A equipe da FX Masters")
                    toKick.kick(whoKicked + " o kickou pelo seguinte motivo: " + reason)
                }

                let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle") // Encontra o canal controle
                let embed = new Discord.RichEmbed() // Cria um embed
                    .setTitle("Kick")
                    .setColor(hexLaranja)
                    .setAuthor("FXM Bot Alert", config.botImg)
                    .setThumbnail(toKick.user.avatarURL)
                    .setDescription(whoKicked + " kickou " + toKick.user.username +", motivo: " + reason)
                    .setTimestamp()
                    .setFooter("Para mais informações, visite o registro de auditoria ou o canal #controle")
                toSend.send({embed}) // Envia o embed no canal de controle
                message.channel.send({embed}) // Envia o embed no canal
            }
        break
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
            //         // Ban
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "ban":
        case "banir":
            if (checkAdmin(message)){ // Verifica se é Admin
                let whoBanned = message.author.tag // Quem baniu
                let reason = args.slice(2).join(" ") // Motivo
                let toBan = message.mentions.members.first() // Quem será banido

                if(!Number(args[1])){ // Verifica se um tempo de ban foi específicado
                    message.channel.send("Você precisa especificar um tempo em dias")
                    return;
                }
                if(args[2] == undefined){ // Verifica se um motivo foi espefíficado 
                    message.channel.send("Você precisa especificar um motivo")
                    return;
                }
                
                if (message.mentions.members.size == 0){ // Verifica se algum membro foi mencionado
                    message.channel.send("Você precisa mencionar um membro")
                    return;
                }
                if (message.author.id == toBan.id){ // Verifica se quem está sendo banido é a mesma pessoa que está banindo
                    message.channel.send("Você não pode se banir")
                    return;
                }
                if (toBan.id == client.user.id){ // Verifica se está tentando banir o bot
                    message.channel.send("Você não pode me banir")
                    return;
                }
                banned[toBan.user.username.toLowerCase()] = toBan.id // Adiciona a pessoa à lista de banidos
                bannedSave() // Salva a lista
                
                let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle") // Encontra o canal de controle
                ban() // Chama a função ban
                async function ban(){ // Que avisa o membro que ele foi banido e pode apelar, além de banir o membro
                    await toBan.user.send("Você foi banido da FX Masters pelo seguinte motivo: " + reason)
                    await toBan.user.send("Para fazer um apelo, digite " + config.prefix + "appeal em nosso server de apelos: https://discord.gg/ZaMyX8A")
                    await toBan.user.send("A equipe da FX Masters")
                    toBan.ban({days: args[1], reason: whoBanned + " o baniu por " + args[1] + "dias, motivo: " + reason + " ||| Database: " + toBan.user.username + " : " + toBan.id})
                }
                let embed = new Discord.RichEmbed() // Cria o embed
                    .setTitle("Ban")
                    .setColor(hexVermelho)
                    .setAuthor("FXM Bot Alert", config.botImg)
                    .setThumbnail(toBan.user.avatarURL)
                    .setDescription(whoBanned + " baniu " + toBan.user.username +" por " + args[1] + " dias, motivo: " + reason)
                    .addField("Para desbanir o mesmo, utilize o " + config.prefix + "unban", toBan.user.username + " : " + toBan.id)
                    .setTimestamp()
                    .setFooter("Para mais informações, visite o registro de auditoria ou o canal #controle")
                toSend.send({embed}) // Envia o embed no canal de controle
                message.channel.send({embed}) // Envia o embed no canal
            }
        break
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
            //         // Unban
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "unban":
        case "desbanir":
            if (checkAdmin(message)){ // Checa se é Admin
                var whoUnBanned = message.author.tag // Quem desbaniu
                var toUnban = args.join(" ") // Quem será desbanido
                
                if(banned[toUnban] == undefined){ // Verifica se o membro existe na lista de banidos
                    message.channel.send("Não foi possível desbanir o membro pois ele não existe ou não pode ser encontrado no banco de dados. Utilize o comando " + config.prefix + "unbanId para desbanir via id")
                }
                
                client.fetchUser(banned[toUnban]).then(user =>{ // Encontra o membro
                    let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle") // Encontra o canal de controle
                    let embed = new Discord.RichEmbed() // Cria um embed
                        .setTitle("Unban")
                        .setColor(hexVerde)
                        .setAuthor("FXM Bot Alert", config.botImg)
                        .setThumbnail(user.avatarURL)
                        .setDescription(whoUnBanned + " desbaniu " + unbanned)
                        .setTimestamp()
                        .setFooter("Para mais informações, visite o registro de auditoria ou o canal #controle")
                    delete banned[toUnban] // remove o membro da lista de banidos
                    toSend.send({embed}) // Envia o embed no canal de controle
                    message.channel.send({embed}) // Envia o embed no canal
                    if(appealList.has(user.id)){ // Verifica se o membro havia feito um apelo
                        user.send("Seu apelo foi aceito, você pode se juntar a nós novamente! " + config.invite)
                        appealList.delete(user.id)
                    }
                })
            }
        break;
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
            //         // UnbanId
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "unbanid":
        case "desbanirid":
            if(checkAdmin(message)){ // Checa se é Admin
                var whoUnBanned = message.author.tag // Quem desbaniu
                let toUnban = args.join(" ") // Quem será desbanido

                var userIdExists = true // nem sei oq é isso
                client.fetchUser(toUnban, userIdExists).then(user =>{ // encontra o membro
                    
                    let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle") // Encontra o canal controle
                    let embed = new Discord.RichEmbed() // Cria um embed
                        .setTitle("Unban")
                        .setColor(hexVerde)
                        .setAuthor("FXM Bot Alert", config.botImg)
                        .setThumbnail(user.avatarURL)
                        .setDescription(whoUnBanned + " desbaniu " + unbanned)
                        .setTimestamp()
                        .setFooter("Para mais informações, visite o registro de auditoria ou o canal #controle")
                    delete banned[toUnban] // Remove o membro da lista de banidos
                    toSend.send({embed}) // Envia o embed no canal de controle
                    message.channel.send({embed}) // Envia o embed no canal
                    if(appealList.has(user.id)){ // Verifica se o membro havia feito um apelo
                        user.send("Seu apelo foi aceito, você pode se juntar a nós novamente! " + config.invite)
                        appealList.delete(user.id)
                    }
                })
                console.log(userIdExists)
                if(!userIdExists){
                    message.channel.send("O membro não existe")
                }
            }
        break;
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
            //         // Apelo
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "appeal":
        case "apelo":
        case "apelar":
            if (!checkAdmin()){ // Verifica se NÃO é admin
                if (banned[message.author.username]){ // Verifica se foi banido
                    let apeal = args.join(" ") // Apelo
                    if (args[0] == undefined){ // Verifica se um apelo foi fornecido
                        message.channel.send("Você precisa fornecer uma detalhada descrição do seu apelo")
                        return;
                    }

                    let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle") // Encontra o canal controle
                    let embed = new Discord.RichEmbed() // Cria um embed
                            .setTitle("Pedido de apelo")
                            .setColor(hexVermelho)
                            .setAuthor("FXM Bot Alert", config.botImg)
                            .setThumbnail(message.author.avatarURL)
                            .setDescription("Um pedido de apelo está sendo feito por " + message.author.username + " #" + message.author.discriminator)
                            .addField("Ele(a) acredita que foi banido por:", apeal)
                            .setTimestamp()
                            .setFooter("Para mais informações, visite o registro de auditoria ou o canal #controle")
                        toSend.send({embed}) // Envia o embed no canal de apelo
                        toSend.send("Id do apelo: " + message.author.id +"\nPara aceitar, basta usar " + config.prefix + "unbanid [id Do Apelo]") // Envia o id do apelo
                        appealList.add(message.author.id) // Adiciona o membro à lista de apelos
                        message.channel.send("Seu pedido foi realizado, aguarde uma providência da nossa equipe.")
                        message.channel.send({embed}) // Envia o embed no canal
                    }
                else { // Se não foi banido
                    let apeal = args.join(" ") // Apelo
                    if (args[0] == undefined){ // Verifica se um apelo foi fornecido
                        message.channel.send("Você precisa fornecer uma detalhada descrição do seu apelo")
                        return;
                    }

                    let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle") // Encontra o canal controle
                    let embed = new Discord.RichEmbed() // Cria um embed
                            .setTitle("Pedido de apelo")
                            .setColor(hexLaranja)
                            .setAuthor("FXM Bot Alert", config.botImg)
                            .setThumbnail(message.author.avatarURL)
                            .setDescription("Um pedido de apelo está sendo feito por " + message.author.username + " #" + message.author.discriminator)
                            .addField("Ele(a) acredita que foi expulso por:", apeal)
                            .setTimestamp()
                            .setFooter("Para mais informações, visite o registro de auditoria ou o canal #controle")
                        toSend.send({embed}) // Envia o embed no canal de controle
                        toSend.send("Id do apelo: " + message.author.id) // Envia o id do apelo no canal de controle
                        message.channel.send("Seu pedido foi realizado, aguarde uma providência da nossa equipe.")
                        message.channel.send({embed}) // Envia o embed no canal
                        appealList.add(message.author.id) // Adiciona o membro à lista de aploes    
                }
            }
        break;
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
            //         // Eval
            // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

        case "eval":
            function clean(text) {
                if (typeof(text) === "string")
                return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
                else
                    return text;
            }
            if(message.author.id !== "301505269391687680") return;
            try {
            const code = args.join(" ");
            let evaled = eval(code);
        
            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);
        
            message.channel.send(clean(evaled), {code:"xl"});
            } catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
            }
        break;
        default :
            message.channel.send(randomMessage())
        break;
    }

});

/*
==================================================================================================
Erro
==================================================================================================
  ______                   
 |  ____|                  
 | |__    _ __  _ __  ___  
 |  __|  | '__|| '__|/ _ \ 
 | |____ | |   | |  | (_) |
 |______||_|   |_|   \___/ 

=================================================================================================
Erro
==================================================================================================
*/

client.on("error", (e) => {
    console.error(e)
    let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle")
    let embed = new Discord.RichEmbed()
        .setTimestamp()
        .setColor(hexVermelho)
        .setTitle("Erro detectado")
        .setDescription(e)
    toSend.send()
});

/*
==================================================================================================
Warn
==================================================================================================
 __          __                 
 \ \        / /                 
  \ \  /\  / /__ _  _ __  _ __  
   \ \/  \/ // _` || '__|| '_ \ 
    \  /\  /| (_| || |   | | | |
     \/  \/  \__,_||_|   |_| |_|

=================================================================================================
Warn
==================================================================================================
*/
client.on("warn", (e) => {
    console.warn(e)
    let toSend = client.guilds.find("name", "FXM").channels.find("name", "controle")
    let embed = new Discord.RichEmbed()
        .setTimestamp()
        .setColor(hexAmarelo)
        .setTitle("Aviso detectado")
        .setDescription(e)
    toSend.send()
});

/*
==================================================================================================
Automação
==================================================================================================

                  _                                  /\/|        
     /\          | |                                |/\/         
    /  \   _   _ | |_  ___   _ __ ___    __ _   ___  __ _   ___  
   / /\ \ | | | || __|/ _ \ | '_ ` _ \  / _` | / __|/ _` | / _ \ 
  / ____ \| |_| || |_| (_) || | | | | || (_| || (__| (_| || (_) |
 /_/    \_\\__,_| \__|\___/ |_| |_| |_| \__,_| \___|\__,_| \___/ 
                                                )_)              

=================================================================================================
Automação
==================================================================================================
*/

var a = schedule.scheduleJob('0 0 * * *', function(){ // Automação de atualização dos perfís do youtube
    console.log("Starting updating profiles")
    console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
    let ids = Object.keys(profiles).forEach(id =>{
        updateProfile(id)
    })
})
var b = schedule.scheduleJob('0 23 * * *', function(){ // Automação dos commits do github
    commit()
})
var c = schedule.scheduleJob('0 23 * * *', ()=>{ // Automação da criação de arquivos de mensagens coletadas
    var date = new Date().toISOString().split("-").join("").split(":").join("").split(".").join("")
    fs.writeFile("./ChatTraining/colectedMessages/" + date + ".txt",colectedChatTrainingMessages,(err) =>{
        if(err) console.log(err)
    })
})

/*
==================================================================================================
Login
==================================================================================================
  _                    _        
 | |                  (_)       
 | |      ___    __ _  _  _ __  
 | |     / _ \  / _` || || '_ \ 
 | |____| (_) || (_| || || | | |
 |______|\___/  \__, ||_||_| |_|
                 __/ |          
                |___/           

=================================================================================================
Login
==================================================================================================
*/

client.login(process.env.BOT_TOKEN) // Faz login
process.on('unhandledRejection', err => console.error(`Uncaught Promise Rejection: \n${err.stack}`)); // Unhandled Promise Catcher

