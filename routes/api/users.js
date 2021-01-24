const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const jwtSecret = config.get('jwtSecret');
const {check, validationResult} = require('express-validator');

// models import
const User = require('../../models/User');

// @route - POST api/users
// @desc - Register user
// @access - public, no token needed
// params (route, middleware, execution)
router.post(('/'), [
    // params('field name', 'error message or default used')
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter a password with more than 6 characters').isLength({min: 6})
],
async (req, res) => {
    // check to see if the request returned any errors
    const errors = validationResult(req);

    if(!errors.isEmpty())
    {
        // return 400 - bad status and include with it json that contains the error
        // errors.array will use custom error messages from above or if not provided, will use defualts
        return res.status(400).json({ errors: errors.array() });
    }

    const {name, email, password} = req.body;

    try
    {
        let user = await User.findOne({ email: email });

        // see if user exists in db
        if(user)
        {
            // return error message if email in db
            return res.status(400).json({ errors: [{msg: 'User already exists'}] });
        }

        // get user gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        user = new User({
            name: name,
            email: email,
            avatar: avatar,
            password: password
        })

        // encrypt password and save data in db
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // set the payload to be sent
        // instead of sending the whole user, only send the id of the user
        // rest of info is still stored in db but not 
        const payload = {
            user: {
                id: user.id
            }
        }

        // this returns the token we will need to access private info
        jwt.sign(
            payload, 
            jwtSecret, 
            {expiresIn: 360000}, 
            (err, token) => {
                if(err)
                {
                    throw err;
                }

                // sign-up successful, returns authorization token
                res.json({ token });
            });
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;