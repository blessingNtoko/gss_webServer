const app = require("express")();
const http = require("http").createServer(app);
const bodyParse = require("body-parser");
const fs = require("fs");
const path = require("path");
const io = require('socket.io')(http);

const port = 3000;
let messagesArr = [];
// let imageArr = [];
// let videoArr = [];

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

app.post("/donate", (req, res) => {

});

io.on("connection", socket => {
    console.log("a user has connected");

    socket.on("imagesPls", () => {
        const dir = './media/images/';
        let temp = {};

        try {

            fs.readdir(dir, (err, files) => {
                if (err) {
                    console.log('Error in getting image ->', err);
                }

                console.log("Files ->", files);

                files.forEach(file => {
                    let fileLocale = dir + file;

                    let rawData = fs.readFileSync(fileLocale);
                    let extName = path.extname(`${fileLocale}`);
                    let buff = Buffer.from(rawData, "binary").toString("base64");
                    let imgString = `data:image/${extName.split('.').pop()};base64,${buff}`;

                    temp['type'] = 'image';
                    temp['data'] = imgString;

                    io.emit("gotImages", temp);
                });

            });

        } catch (error) {
            console.log('Error when reading directory ->', error);
        }
    });

    socket.on("audiosPls", () => {
        const dir = './media/audio/';
        let temp = {};
    });

    socket.on("videosPls", () => {
        const dir = './media/video/';
        let temp = {};
    });
});

http.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});