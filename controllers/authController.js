const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config({ path: 'variables.env' });


exports.autenticarUsuario = async (req, res, next) => {
    //Revisar si hay errores
    //Mostrar mensajes de error de express validator
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }


    //Comprobar si el usuario esta registrado
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    //console.log(usuario)
    if (!usuario) {
        res.status(401).json({ msg: 'El Usuario no Existe' });
        //Evitar que le código se siga ejecutando
        return next();
    }

    //Verificar Password y autenticar al usuario
    if (bcrypt.compareSync(password, usuario.password)) {
        //Crear JWT (json web token)
        // puedes agregar todos los campos que quieras al token, cuantos más agregues mas pesado sera el token
        const token = jwt.sign({
            id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email
        }, process.env.SECRETA, {
            expiresIn: '8h'
        });
        res.json({ token });

    } else {
        res.status(401).json({ msg: 'El Password no es Correcto' });
        return next();
    }

}

exports.usuarioAutenticado = async (req, res) => {
    //Usuario autenticado a través del middleware auth
   res.json({usuario: req.usuario});
   
    //console.log(req.get('Authorization'));

    // const authHeader = req.get('Authorization');

    // if (authHeader) {
    //     //Obtener el token
    //     //con split y un espacio entre las comillas cogemos el string del token lo 
    //     //convertimos en un arreglo, lo separamos y extraemos la posición 1 del arreglo
    //     const token = authHeader.split(' ')[1];

    //     //Comprobar el jsonwebtoken
    //     try {
    //         const usuario = jwt.verify(token, process.env.SECRETA);
    //         res.json({ usuario });
    //     } catch (error) {
    //         console.log(error);
    //         console.log('JWT no Valido');
    //     }
    // }

}