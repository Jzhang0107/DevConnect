const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const User = require('../../models/User');

// @route - GET api/auth
// @desc - test route
// @access - public, no token needed
router.get(('/'), auth, async (req, res) => {

    try
    {
        const user = await User.findById(req.user.id).select('-password');

        // No errors, send user back with user specific data
        res.json(user);
    }
    catch(err)
    {
        // error, print it out
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;