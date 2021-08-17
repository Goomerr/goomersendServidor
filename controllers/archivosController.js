const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const Enlaces = require('../models/Enlaces')

exports.subirArchivo = async (req, res, next) => {

    const configuracionMulter = {
        limits: { fileSize: req.usuario ? 100000000 * 10 : 1000000 },
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, __dirname + '/../uploads')
            },
            filename: (req, file, cb) => {
                //Obtener la extension del archivo con el mimetype
                // const extension = file.mimetype.split('/')[1];
                //obtener la extension del archivo del nombre original, pàara archivos con un mimetype extraño
                const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);

                //generar un nombre único 
                cb(null, `${shortid.generate()}${extension}`);
            }
            // Como Filtrar tipo de archivos si quieres
            // fileFilter: (req, res, cb) => {
            //     if(file.mimetype === "application/pdf"){
            //         return cb(null, true)
            //     }            // }
        })
    }

    const upload = multer(configuracionMulter).single('archivo');
    upload(req, res, async (error) => {
        console.log(req.file);

        if (!error) {
            res.json({ archivo: req.file.filename });
        } else {
            console.log(error);
            return next();
        }
    })

}

exports.eliminarArchivo = async (req, res) => {
   // console.log(req.archivo);
    try {
        fs.unlinkSync(__dirname + `/../uploads/${req.archivo}`);
       // console.log('Archivo eliminado')
    } catch (error) {
        console.log(error);
    }
}

//Descargar un archivo
exports.descargar = async (req, res, next) => {

    //Obtener el Enlace
    const { archivo } = req.params
    const enlace = await Enlaces.findOne({ nombre: archivo })

    //console.log(enlace)

    const archivoDescarga = __dirname + '/../uploads/' + archivo;
    res.download(archivoDescarga);
    //Eliminar el archivo y la entrada de la BD una vez descargado

    //si las descargas son iguales a 1 - Borrar la entrada y borrar el archivo
    const { descargas, nombre } = enlace;
    if (descargas === 1) {

        //Eliminar el archivo
        req.archivo = nombre;
        //Eliminar la entrada de la BD
        await Enlaces.findOneAndRemove(enlace.id);
        next();
    } else {
        //Si las descargas son > a 1 -Restar 1
        enlace.descargas--;
        await enlace.save();
    }
}

