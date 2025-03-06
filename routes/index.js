const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const adminCredentials = { username: 'admin', password: 'password' };

// Função auxiliar para carregar a tap list
const loadTapList = () => {
  const dataPath = path.join(__dirname, '../data/taplist.json');
  const data = fs.readFileSync(dataPath);
  return JSON.parse(data);
};

// Função auxiliar para salvar a tap list
const saveTapList = (tapList) => {
  const dataPath = path.join(__dirname, '../data/taplist.json');
  fs.writeFileSync(dataPath, JSON.stringify(tapList, null, 2));
};

// Rota para exibir o menu para os clientes
router.get('/', (req, res) => {
  const tapList = loadTapList();
  res.render('client/menu', { tapList });
});

// Rota para exibir o painel administrativo
router.get('/admin', (req, res) => {
  if (req.session.loggedIn) {
    const tapList = loadTapList();
    res.render('admin/dashboard', { tapList });
  } else {
    res.render('admin/login');
  }
});

// Rota para login
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === adminCredentials.username && password === adminCredentials.password) {
    req.session.loggedIn = true;
    res.redirect('/admin');
  } else {
    res.render('admin/login', { error: 'Credenciais inválidas' });
  }
});

// Rota para logout
router.post('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin');
});

// Rota para adicionar item à tap list
router.post('/admin/add', (req, res) => {
  const tapList = loadTapList();
  const newItem = req.body;
  tapList.push(newItem);
  saveTapList(tapList);
  res.redirect('/admin');
});

// Rota para gerar código QR
router.get('/admin/generate-qr/:table', (req, res) => {
  const tableNumber = req.params.table;
  const url = `http://menu.donacevada.com.br/table/${tableNumber}`;
  QRCode.toDataURL(url, (err, src) => {
    if (err) res.send('Erro ao gerar o QR Code');
    res.render('admin/qr', { src });
  });
});

module.exports = router;