const express = require('express');
const router = express.Router();
const authenticateUser = require('../../middleware/authenticateUser');
const {check, validationResult} = require('express-validator');

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

// @route - POST api/profile
// @desc - Create/update user profile
// @access - Private
router.post(('/'), [
    authenticateUser, 
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
], async (req, res) => {

    // check to see if the request returned any errors
    const errors = validationResult(req);

    if(!errors.isEmpty())
    {
        // return 400 - bad status and include with it json that contains the error
        // errors.array will use custom error messages from above or if not provided, will use defualts
        return res.status(400).json({ errors: errors.array() });
    }

    const profileFields = {};
    profileFields.user = req.user.id;

    const {
        company, 
        website, 
        location, 
        bio, 
        githubUsername, 
        status,
        skills, 
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(githubUsername) profileFields.githubUsername = githubUsername;
    
    profileFields.status = status;
    profileFields.skills = skills.split(',').map(skill => skill.trim());

    console.log(profileFields.skills);

    res.send('Set up profile fields')

    // try
    // {

    // }
    // catch(err)
    // {
    //     console.error(err.message);
    //     res.status(500).send("Server error");
    // }
});

module.exports = router;