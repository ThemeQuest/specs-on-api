const express = require('express');
const cors = require('cors');
const multer = require('multer');
const uuid = require('uuid').v4;
const cloudinary = require('cloudinary').v2;

// allows the usage of the .env file
require('dotenv/config');

// SET UP EXPRESS
const app = express();
// localhost post or server port based on environment
const port = process.env.PORT || 3000;

// config variables
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET,
    secure: true
});

// multer.diskStorage allows us to customize the file uploaded
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        const {originalname} = file;
        cb(null, `${uuid()}-${originalname}`);
    }
});

// accepted file types
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/png' || file.mimetype == 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

// file size expected
const upload = multer({
    storage, //es6 same as storage:storage
    limits: {
        fileSize: 1024 * 1024 * 1 //files upto 1mb
    },
    fileFilter
});


// POST - upload headshot endpoint
app.post('/profile', upload.single('avatar'), function(req, res) {
    //file is not present
    if (!req.file){
        return res.status(400).json({message: 'Please upload an image!'});
    }else{
        // upload to cloudinary
        cloudinary.uploader.upload(req.file.path,
            // specify the transformation and facial detection
            {
                transformation: [
                    { 
                        width: 200, 
                        radius: "max", 
                        crop: "scale" 
                    },
                    { 
                        flags: "region_relative", 
                        gravity: "adv_eyes", 
                        overlay: "glasses",//req.body.spec, NOTE: to pull from different specs on the frontend
                        width: "1.7" 
                    }
                ]
            },
            function(error, result) {
                console.log(result, error);
            }
        );
    }
});

// USE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

//LISTEN to a particuler port
app.listen(port, () => console.log(`Listening on port ${port} .....`));