const express = require("express")
const admin = require("firebase-admin")
const chave = require("./chave.json")
    
admin.initializeApp({
    credential: admin.credential.cert(chave)
})

const app = express()
const database = admin.firestore()
const port = 3000

app.listen(port, () => {
    console.log(`Servidor iniciado na porta ${port}!`)
})

app.use(express.json())
app.use(express.urlencoded({extended:true})) 

app.get('/', (req, res) => {
    res.sendFile('views/index.html', {root: __dirname })
})

app.post('/create', async(request, response) =>{
    try{
        const produto = {
            nome: request.body.nome, 
            cpf: request.body.cpf,
            email: request.body.email
        }
        console.log(request.body.nome)
        await database.collection("usuarios").add(produto)
        
        response.send("Usuario Cadastrado.")
    }catch(error){
        response.send(error.message)
    }
})

app.get('/list', async(req, res) => {
    const snapshot = await database.collection('usuarios').get();
    let list = []
    let item = ""
    snapshot.docs.map(doc => {
        item = 
        "id: " + doc.ref._path.segments[1] + "<br>" +
        "nome: " + doc.data().nome + "<br> " + 
        "email: " + doc.data().email +  "<br> " + 
        "cpf:" + doc.data().cpf  + " " + "<br>" +
        "--------------------" + "<br>"
        list.push(item)
    });

    list.push(`
        <button onclick="home()">teste</button>
        <script>
            function home() {
                window.location.href = window.location.href = "/"
            }
        </script>
    `)

    console.log(snapshot.docs.map(doc => doc.data()))
    res.setHeader("Content-Type", "text/html")

    res.send(
        list.toString()
    )
})

app.post('/delete', async(req, res) => {
    id_del = req.body.id
    const snapshot = await database.collection('usuarios').get();

    let status = false

    snapshot.docs.map(doc => {
        if(id_del == doc.ref._path.segments[1]) {
            doc.ref.delete()
            status = true
        } 
    })

    if(status) {
            res.send('usuario deletado!')
    } else {
        res.send('usuario nao encontrato')
    }
})

app.post('/buscar', async(req, res) => {
    email_buscar = req.body.cpf
    const snapshot = await database.collection('usuarios').get();

    let status = false;
    let user = ""
    snapshot.docs.map(doc => {
        if(email_buscar == doc.data().cpf) {
            status = true;
            user = doc.data().nome
        }
    })

    if(status) {
        res.send(`
            <h1>Encontrado</h1>
            <b>${user}</b>
        `)
    } else {
        res.send('Usuario não encontrado')
    }
 
})

app.post('/buscar_id', async(req, res) => {
    id = req.body.id
    console.log(req.body, id)
    const snapshot = await database.collection('usuarios').get();

    let status = false;
    let user = ""
    snapshot.docs.map(doc => {
        if(id == doc.ref._path.segments[1]) {
            status = true;
            user = doc.data().nome
        }
    })

    if(status) {
        res.send(`
            <h1>Encontrado</h1>
            <b>${user}</b>
        `)
    } else {
        res.send('Usuario não encontrado')
    }
 
})


app.post('/update', async(req, res) => {
    const oldName = req.body.oldName
    const newName = req.body.newName
    console.log(oldName, newName)
    const snapshot = await database.collection('usuarios').get();

    let status = false

    let update = {
        nome: newName, 
        cpf: "",
        email: ""
    }

    snapshot.docs.map(doc => {
        if(oldName == doc.data().nome) {
            update.cpf = doc.data().cpf
            update.email = doc.data().email
            doc.ref.delete()
            status = true
        } 
    })

    if(status) {
            await database.collection("usuarios").add(update)
            res.send('usuario atualizado!')
    } else {
        res.send('usuario nao encontrato')
    }
})

// const path = require('path');


