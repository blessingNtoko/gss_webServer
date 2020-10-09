const app = require("express")();
const http = require("http").createServer(app);
const bodyParse = require("body-parser");
const fs = require("fs");
const path = require("path");
const io = require('socket.io')(http);

const port = 3000;
let messagesArr = [];
let donateArr = [];
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

    const buffFromBase = Buffer.from(msgData, "base64").toString('utf-8');
    let fromJSON = JSON.parse(buffFromBase);

    messagesArr.push(fromJSON);

    console.log('Message array ->', messagesArr);
});

app.post("/donate", (req, res) => {
    const donateData = req.body['data'];

    const buffFromBase = Buffer.from(donateData, "base64").toString('utf-8');
    let fromJSON = JSON.parse(buffFromBase);

    donateArr.push(fromJSON);

    console.log('Message array ->', messagesArr);
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

                    fs.readFile(fileLocale, (err, fileData) => {
                        if (err) {
                            console.error("Error when reading file ->", err);
                        }

                        let extName = path.extname(fileLocale);
                        let buff64 = Buffer.from(fileData, "binary").toString("base64");
                        let imgString = `data:image/${extName.split(".").pop()};base64,${buff64}`;

                        temp["type"] = "image";
                        temp["data"] = imgString;

                        io.emit("gotImages", temp);
                    });



                });

            });

        } catch (error) {
            console.log('Error when reading directory ->', error);
        }
    });

    socket.on("audiosPls", audioClip => {
        const dir = './media/audio/';
        let temp = {};

        let rawStream = fs.createReadStream(fileLocale, { highWaterMark: 4096 });

        rawStream.on("data", chunk => {
            // console.log("Chunk of data ->", chunk);
            io.emit("gotImages", chunk);
        });

        rawStream.on("end", () => {
            io.emit("gotImages", "Done");
        });

        rawStream.on("error", err => {
            console.error("Error has occured when reading file for stream ->", err);
        });
    });

    socket.on("videosPls", videoClip => {
        const dir = './media/video/';
        let temp = {};

        let rawStream = fs.createReadStream(fileLocale, { highWaterMark: 4096 });

        rawStream.on("data", chunk => {
            // console.log("Chunk of data ->", chunk);
            io.emit("gotImages", chunk);
        });

        rawStream.on("end", () => {
            io.emit("gotImages", "Done");
        });

        rawStream.on("error", err => {
            console.error("Error has occured when reading file for stream ->", err);
        });
    });
});

http.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});