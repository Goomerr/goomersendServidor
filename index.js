const express = require('express');
const conectarDB = require('./config/db');
const cors = require('cors');

//Crear el servidor
const app = express();

//Conectar a la DB
conectarDB();
console.log('Comenzando con GoomerSend');

//Habilitar cors
const opcionesCors = {
    origin: process.env.FRONTEND_URL
}
app.use(cors(opcionesCors));

//Puerto de la app
const port = process.env.PORT || 4000;

//Habilitar leer los valores del body
app.use( express.json());

//Habilitar carpeta publica para las descargas
app.use( express.static('uploads'));

//Rutas de la App
app.use('/api/usuario', require('./routes/usuarios'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/enlaces', require('./routes/enlaces'));
app.use('/api/archivos', require('./routes/archivos'));

//Arrancar la app
app.listen(port, '0.0.0.0', () => {
    console.log(`El servidor esta funcionando en el puerto ${port}`);
});