const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const jwtSecret = config.get('jwtSecret');
const {check, validationResult} = require('express-validator');

const User = require('../../models/User');

// @route - GET api/auth
// @desc - Authenticate user and get token
// @access - public, no token needed
router.post(('/'), [
    // params('field name', 'error message or default used')
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter a password').exists()
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

    const {email, password} = req.body;

    try
    {
        // checks to see if db has a user with the email that the user entered
        let user = await User.findOne({ email: email });

        // see if user exists based on email
        if(!user)
        {
            return res.status(400).json({ errors: [{msg: 'No user found, please try again'}] });
        }

        // checks to see if password that user entered matches the one in db
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch)
        {
            // should make error messages same as above if you want added security so user doesn't know what is incorrect
            return res.status(400).json({ errors: [{msg: 'Username or password is incorrect'}] });
        }


        // return jwt
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

                // login successful, returns authorization token
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