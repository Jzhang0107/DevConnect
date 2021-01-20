const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator/check');

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
        const user = User.findOne({email: email});

        // see if user exists
        // if user email found in db, then that means email has already been used
        if(user)
        {
            res.status(400).json({ errors: [{msg: 'User already exists'}] });
        }

        // get user gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        user = new User({
            name,
            email,
            password,
            avatar,
        })


        // encrypt password

        // return jwt

        // Request made without error
        res.send('User created successfully');
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;