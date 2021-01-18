const express = require('express');
const router = express.Router();
const {check, body, validationResult} = require('express-validator');

// @route - POST api/users
// @desc - Register user
// @access - public, no token needed
// params (route, middleware, execution)
router.post(('/'), [
    // params('field name', 'error message or default used')
    body('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter a password with more than 6 characters').isLength({min: 6})
],
(req, res) => {
    // check to see if the request returned any errors
    const errors = validationResult(req);

    if(!errors.isEmpty())
    {
        // return 400 - bad status and include with it json that contains the error
        // errors.array will use custom error messages from above or if not provided, will use defualts
        return res.status(400).json({ errors: errors.array() });
    }

    // Request made without error
    res.send('User created successfully');
});

module.exports = router;