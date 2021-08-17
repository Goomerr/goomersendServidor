const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (authHeader) {
        //Obtener el token
        //con split y un espacio entre las comillas cogemos el string del token lo 
        //convertimos en un arreglo, lo separamos y extraemos la posición 1 del arreglo
        const token = authHeader.split(' ')[1];

        //Comprobar el jsonwebtoken
        try {
            const usuario = jwt.verify(token, process.env.SECRETA);
            req.usuario = usuario;
            //console.log('Desde el Middleware', usuario);
        } catch (error) {
            console.log(error);
            console.log('JWT no Valido');
        }
    }

    return next();
}