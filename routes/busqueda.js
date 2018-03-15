var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ===============================================
// Busqueda coleccion
// ===============================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp( busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios( regex);
            break;
        case 'medicos':
            promesa = buscarMedicos( regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales( regex);
            break;
    
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'los tipos de busqueda solo son: usuarios, medicos y hospitales',
                error: {message: 'tipo de tabla/coleccion no válido'}
            });
            break;
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    })
});

// ===============================================
// Busqueda general
// ===============================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp( busqueda, 'i');

    Promise.all([ 
            buscarHospitales( regex),
            buscarMedicos( regex),
            buscarUsuarios( regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });

    
});

// ===============================================
// Funciones que devuelven Promesas
// ===============================================

function buscarHospitales( regex) {
    
    return new Promise(( resolve, reject ) => {

        Hospital.find({ nombre: regex })
                .populate('usuario', 'nombre email')
                .exec((err, hospitales) => {

            if (err) {
                reject('Error al cargar hospitales', err);   
            } else {
                resolve(hospitales);
            }


        });
    });

}

function buscarMedicos( regex) {
    
    return new Promise(( resolve, reject ) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
            if (err) {
                reject('Error al cargar médicos', err);   
            } else {
                resolve(medicos);
            }

        });
    });

}

function buscarUsuarios( regex) {
    
    return new Promise(( resolve, reject ) => {

        Usuario.find({}, 'nombre email role img')
                .or([ {'nombre': regex }, { 'email': regex } ])
                .exec((err, usuarios) => {
                    if (err) {
                        reject('Error al cargar usuarios', err);
                    } else {
                        resolve(usuarios);
                    }
                });
    });

}


module.exports = app;
