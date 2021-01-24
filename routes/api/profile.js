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
            res.status(400).json({ msg: "You do not have a profile" });
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

    const {
        company, 
        website, 
        location, 
        bio, 
        githubusername, 
        status,
        skills, 
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    // got this from the authenticateuser middleware
    profileFields.user = req.user.id;

    // rest of fields not in middleware, will need to check req.body for it
    // build the profileFields object and fill with base info
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(githubusername) profileFields.githubusername = githubusername;
    
    // dont need to check since these are required
    profileFields.status = status;
    profileFields.skills = skills.split(',').map(skill => skill.trim());

    // build and fill the profileFields.social obj 
    profileFields.social = {};
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;

    try
    {
        let profile = await Profile.findOne({ user: req.user.id });

        // if profile found, we update
        if(profile)
        {
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set: profileFields},
                {new: true}
            )
            return res.json(profile);
        }

        // profile not found, we make a new one
        profile = new Profile(profileFields);

        await profile.save();

        return res.json(profile);
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// @route - GET api/profile
// @desc - get all profiles
// @access - public
router.get('/', async (req, res) => {
    try 
    {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);

        res.json(profiles)
    } 
    catch (err) 
    {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// @route - GET api/profile/user/user_id
// @desc - get profile by user id
// @access - public
router.get('/user/:user_id', async (req, res) => {
    try 
    {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);

        if(!profile)
        {
            return res.status(400).json({ msg: "Profile not found" });
        }

        res.json(profile);
    } 
    catch (err) 
    {
        if(err.kind == 'ObjectId')
        {
            return res.status(400).json({ msg: "Profile not found" });
        }

        console.error(err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;