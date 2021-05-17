const { response } = require("express");
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario.model');
const { generarJWT } = require('../helpers/jwt.helpers');
const { googleVerify } = require('../helpers/google-verify');

const login = async(req, res = response) => {

    const { email, password } = req.body;

    try {
        const usuarioDb = await Usuario.findOne({ email });
        if( !usuarioDb ) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no válida'
            });
        }

        const validPassword = bcrypt.compareSync( password, usuarioDb.password );
        if( !validPassword ) {
            return res.status(400).json ({
                ok: false,
                msg: 'Contraseña no válida'
            });
        }

        const token = await generarJWT( usuarioDb.id )

        res.json({
            ok: true,
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Contacte el administrador'
        });
    }
}

const googleSignIn = async (req, res = response) => {

    const googleToken = req.body.token;

    try {
        const {name, email, picture } = await googleVerify( googleToken );

        const usuarioDB = await Usuario.findOne({ email });
        let usuario;

        if( !usuarioDB ) {
            usuario = new Usuario({
                nombre: name,
                email,
                password: '@@@',
                img: picture,
                google: true
            });
        } else {
            usuario = usuarioDB;
            usuario.google = true;
        }

        await usuario.save();

        const token = await generarJWT( usuarioDB.id);

        res.json({
            ok: true,
            msg: "ok",
            token
        })
    } catch (error) {
        res.status(401).json({
            ok: false,
            msg: "Contacte al administrador"
        })
    }
}

const renewToken = async (req, res = response) => {

    const uid = req.uid;
    const token = await generarJWT( uid );

    res.json({
        ok: true,
        token
    })
}

module.exports = {
    login,
    googleSignIn,
    renewToken
}