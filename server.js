const express = require("express");
const app = express();
const https = require("https");
const bodyParse = require("body-parser");
const fs = require("fs");
const path = require("path");

const port = 3000;
let messagesArr = [];
let audioArr = [];
let imageArr = [];
let videoArr = [];

app.use(bodyParse.json());
app.use(bodyParse.urlencoded({
    extended: true
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post("/contact", (req, res) => {
    const msgData = req.body['data'];

    const buff = Buffer.from(msgData, "base64");
    let fromBase = buff.toString('utf-8');
    let fromJSON = JSON.parse(fromBase);

    messagesArr.push(fromJSON);

    console.log('Message array ->', messagesArr);
});

app.get("/media/images", (req, res) => {
    console.log('Get images ->', req.body);
    const dir = './media/images/';

    try {
        let temp = {};

        fs.readdir(dir, (err, files) => {
            if (err) {
                console.log('Error in getting image ->', err);
            }

            files.forEach(file => {
                let fileLocale = dir + file;
                console.log(fileLocale);

                fs.readFile(fileLocale, (err, fileData) => {
                    if (err) {
                        console.log('Error in getting image ->', err);
                    }

                    let extName = path.extname(`${dir}/${file}`)
                    let buff = Buffer.from(fileData, "binary");
                    let base64Image = buff.toString("base64");
                    let imgString = `data:image/${extName.split('.').pop()};base64,${base64Image}`;

                    temp['type'] = 'image'
                    temp['data'] = imgString
    
                    imageArr.push(temp)

                });

            });
            
        });
        res.send(imageArr)
    } catch (error) {
        console.log('Error when reading directory ->', error);
    }

});

app.get("/media/audio", (req, res) => {
    console.log('Get audio ->', req.body);
});

app.get("/media/video", (req, res) => {
    console.log('Get video ->', req.body);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});