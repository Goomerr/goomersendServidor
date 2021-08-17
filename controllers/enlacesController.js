const Enlaces = require('../models/Enlaces');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

exports.nuevoEnlace = async (req, res, next) => {

    //Revisar si hay errores
    //Mostrar mensajes de error de express validator
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    //console.log(req.body)
    //Crear un objeto con los datos para almacenar en la BD
    const { nombre_original, nombre } = req.body;

    const enlace = new Enlaces();
    enlace.url = shortid.generate();
    //generar un nombre de archivo aleatorio para evitar nombres de archivo duplicados
    enlace.nombre = nombre;
    enlace.nombre_original = nombre_original;

    // console.log(enlace)
    // console.log(req.body);

    //Si el usuario esta autenticado puede asignar un password y un numero de descargas
    if (req.usuario); {
        const { password, descargas, autor } = req.body;

        //Asignar a enlace el numero de descargas si lo hay
        if (descargas) {
            enlace.descargas = descargas;
        }

        //Asignar el Password para descargar si lo hay
        if (password) {
            const salt = await bcrypt.genSalt(10);
            enlace.password = await bcrypt.hash(password, salt);
        }
        if (autor) {
            //Asignar el autor 
            enlace.autor = req.usuario.id;
        }
    }

    //Almacenar en la BD
    try {
        await enlace.save();
        return res.json({ msg: `${enlace.url}` });
        next();
    } catch (error) {
        console.log(error);
    }
}

//Obtener un listado de todos los enlaces de los archivos
exports.todosEnlaces = async (req, res) => {
    try {
        const enlaces = await Enlaces.find({}).select('url -_id');
        res.json({ enlaces });
    } catch (error) {
        console.log(error);
    }
}

//Comprobar si el enlace tiene password o no
exports.conPassword = async (req, res, next) => {

    //console.log(req.params.url);
    const { url } = req.params;
    //console.log(url)

    //Verificar si existe el enlace del archivo
    const enlace = await Enlaces.findOne({ url });
    //console.log(enlace)
    //si no existe la url del archivo
    if (!enlace) {
        res.status(404).json({ msg: 'El archivo no Existe' });
        return next();
    }

    if (enlace.password) {
        return res.json({ password: true, enlace: enlace.url, archivo: enlace.nombre });
    }

    next();
}

//Verificar si el password del enlace es correcto
exports.verificarPassword = async (req, res, next) => {
    const { url } = req.params;
    const { password } = req.body;

    //Consultar por el enlace
    const enlace = await Enlaces.findOne({ url });

    //Verificar el Password
    if (bcrypt.compareSync(password, enlace.password)) {
        //Permitir la descarga
        next();
    } else {
        return res.status(401).json({ msg: 'Password Incorrecto' })
    }


}

//Obtener el enlace
exports.obtenerEnlace = async (req, res, next) => {

    //console.log(req.params.url);
    const { url } = req.params;
    // console.log(url)

    //Verificar si existe el enlace del archivo
    const enlace = await Enlaces.findOne({ url });
    //console.log(enlace)
    //si no existe la url del archivo
    if (!enlace) {
        res.status(404).json({ msg: 'El archivo no Existe' });
        return next();
    }
    //Si el enlace del archivo existe
    res.json({ archivo: enlace.nombre, password: false });

    next();
}
