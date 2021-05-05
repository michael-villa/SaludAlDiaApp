const jwt = require("jsonwebtoken");
require('dotenv').config();


const validarJWT = (req, res, next) => {
    const token = req.header('x-token');

    if( !token ) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición'
        })
    }

    try {
        const { uid } = jwt.verify( token, process.env.JWT_SECRET );

        req.uid = uid
        next();

    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token Invalido'
        })
    }
}

module.exports = {
    validarJWT
}