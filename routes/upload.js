var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de colección
    var tiposValidos = ['hospitales','medicos','usuarios'];
    if (tiposValidos.indexOf( tipo ) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: {message: 'Tipo de colección no es válida'}
        }); 
    }
    
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            errors: {message: 'Debe seleccionar una imagen'}
        });    
    }

    // obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[ nombreCortado.length -1].toLowerCase();


    // Solo éstas extenciones aceptamos
    var extencionesValidas = ['png', 'jpg','gif','jpeg'];

    if (extencionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extención no válida',
            errors: {message: 'Las extenciones válidas son: ' + extencionesValidas.join(', ')}
        }); 
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // crear path para mover
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    
    // Mover el archivo
    archivo.mv( path , err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            }); 
        }

        subirPorTipo(tipo, id, path, nombreArchivo, res);


    })

    
});

function subirPorTipo(tipo, id, path, nombreArchivo, res) {
    
    var tipoColeccion;

    switch (tipo) {
        case 'hospitales':
            tipoColeccion = Hospital;
            break;
        case 'medicos':
            tipoColeccion = Medico;
            break;
        case 'usuarios':
            tipoColeccion = Usuario;
            break;
        default:
            return;
    }

    tipoColeccion.findById(id, 'nombre img')
        .exec((err, resultado) => {
        if (!resultado) {
            
            fs.unlink(path); // Borro el archivo cuando no tengo id valido
            
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encontro nada con ese Id',
                errors: { message: 'Debe selecionar un Id valido' }
            });
        } else {
        
            var pathViejo = `./uploads/${ tipo }/${resultado.img}`;
            
            // Si existe, Elimino la imagen vieja
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
                // console.log('Borrando path viejo ', pathViejo);
            }
        
            resultado.img = nombreArchivo;
        
            resultado.save((err, resultadoActualizado) => {
                res.status(200).json({
                    ok: true,
                    [tipo]: resultadoActualizado,
                    mensaje: 'Imagen de ' + tipo + ' actualizada'
                });
            });
        }
    });
   }

module.exports = app;
