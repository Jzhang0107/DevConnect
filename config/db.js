const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
    try
    {
        // wait for promise to return value
        await mongoose.connect(db, {useNewUrlParser:true, useUnifiedTopology: true });
        
        // print to console that db is connected
        console.log("mongoDB successfully connected");
    }
    catch(err)
    {
        // if error log the error
        console.log(err.message);

        // exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;