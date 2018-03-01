var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;



var app = express();

var Usuario = require('../models/usuario');

const {OAuth2Client} = require('google-auth-library');
//const client = new OAuth2Client(CLIENT_ID);
var GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
var GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

// ===============================================
// Autenticación de Google
// ===============================================
app.post('/google', (req, res,next) =>{
    
    var token = req.body.token;
    
    const oAuth2Client = new OAuth2Client(
       GOOGLE_CLIENT_ID,
       GOOGLE_SECRET
     );
    
     const tiket = oAuth2Client.verifyIdToken({
       idToken: token
       //audience: GOOGLE_CLIENT_ID
     });
    
     tiket
        .then(data =>{
            
            let payload = data.payload;


            Usuario.findOne({email: payload.email }, (err, usuario) => {
                
                if (err) {
                    
                    return res.status(500).json({
                        ok: false,
                        mansaje: 'Error al buscar usuario',
                        errors: err
                    });
                }

                // si el usuario existe
                if (usuario) {
                    if (!usuario.google) {
                        return res.status(400).json({
                            ok: false,
                            mansaje: 'Debe de usar su autenticación normal',
                            errors: err
                        });
                    } else {
                        // crear token
                        usuario.password = ':)';

                        var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400}) // 4 horas

                        res.status(200).json({
                            ok: true,
                            usuario: usuario,
                            token: token,
                            id: usuario._id
                        });
                    }

                // si el usuario no existe por correo
                } else {
                    var usuario = new Usuario();

                    usuario.nombre = payload.name;
                    usuario.email = payload.email;
                    usuario.password = ':)';
                    usuario.img = payload.picture;
                    usuario.google = true;
                    
                    usuario.save((err, usuarioDB) => {

                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al crear usuario - google',
                                errors: err
                            });
                        }

                        // crear token
                        
                        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400}) // 4 horas

                        res.status(200).json({
                            ok: true,
                            usuario: usuarioDB,
                            token: token,
                            id: usuarioDB._id
                        });

                    });
                    
                }

            });

           
         })
         .catch(err => {
            return res.status(200).json({
                ok: false,
                mensaje: 'Token no válido',
                errors: err
            });
         });

  });

// ===============================================
// Autenticación normal
// ===============================================
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }
        
        if (!bcrypt.compareSync( body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // crear token
        usuarioDB.password = ':)';

        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400}) // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });

    
})


module.exports = app;