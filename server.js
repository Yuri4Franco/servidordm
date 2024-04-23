const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const os = require('os');
const http = require('http');



//config aplicação
const app = express();
app.use(bodyParser.json());
app.use(cors())
app.use('/imagens', express.static('imagens'));

const porta = 3000;


//banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pmovel'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conexao banco ok');
});


//config upload

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './imagens');
  },
  filename(req, file, callback) {
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });


//rotas

app.get('/', (req, res) => {
  res.send('Olá, Mundo!');
});

app.get('/times', (req, res) => {
  console.log("entrando na função");
  let sql = 'SELECT * FROM times';
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.post('/upload', upload.single('imagem'), (req, res) => {
  const nome = req.body.nome;
  const imagem = req.file.filename;

  const sql = "INSERT INTO times (nome, imagem) VALUES (?,?)";

  db.query(sql, [nome, imagem], (err, restultado) => {
    if (err) {
      console.log(err);
      res.status(500).send({ mensagem: err })
    }
    if (restultado) {
      const host = req.hostname;
      const url_imagem = `http://${host}:${porta}/imagens/${imagem}`;
     
      res.status(201).send({
        data: {
          nome: nome,
          imagem: imagem,
          url_imagem: url_imagem
        },
        mensagem: "Time cadastrado com sucesso"
      })
    }
  })
});


//start do servidor
app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
});
