const jwt = require('jsonwebtoken');
const config = require('config');

// middleware functions have access to req, res
// next is callback to execute after it finishes
module.exports = function(req, res, next)
{
    // get token from header
    const token = req.header('x-auth-token');

    // check if there is a token, if not give error 401 and response message
    if(!token)
    {
        res.status(401).json({ msg: 'There is no token' });
    }

    // verify token
    try
    {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        
        req.user = decoded.user;
        next();
    }
    catch(err)
    {
        res.status(401).json({ msg: 'Token is wrong' });
    }
}