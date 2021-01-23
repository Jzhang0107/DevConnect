const express = require('express');
const router = express.Router();
const authenticateUser = require('../../middleware/authenticateUser');

// models import
const User = require('../../models/User');
const Profile = require('../../models/Profile');

// @route - GET api/profile/me
// @desc - Get current user profile
// @access - Private
router.get(('/me'), authenticateUser, async (req, res) => {
    try
    {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        if(!profile)
        {
            res.status(400).json({ msg: "No profile found" });
        }

        res.json(profile);
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;