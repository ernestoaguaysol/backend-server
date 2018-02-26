let express = require('express');

var mongoose = require('mongoose');



let app = express();

// Conexion a la DB
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) {
        throw err;
    } else {
        console.log('Base de datos \x1b[32m%s\x1b[0m', 'online');
    }
});

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    })
});


app.listen(3000, () => {
    console.log('servidor corriendo en puerto 3000 \x1b[32m%s\x1b[0m', 'online');
});

// Colores para la consola
// Reset = "\x1b[0m"

// Bright = "\x1b[1m"

// Dim = "\x1b[2m"

// Underscore = "\x1b[4m"

// Blink = "\x1b[5m"

// Reverse = "\x1b[7m"

// Hidden = "\x1b[8m"

// FgBlack = "\x1b[30m"