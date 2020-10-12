const app = require("express")();
const http = require("http").createServer(app);
const bodyParse = require("body-parser");
const fs = require("fs");
const path = require("path");
const io = require('socket.io')(http);

const port = 3000;
let messagesArr = [];
let donateArr = [];

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

    console.log('Donate array ->', donateArr);
});

io.on("connection", socket => {
    console.log("a user has connected");

    socket.on("images", data => {
        console.log("Data in images ->", data);
        const dir = './media/images/';
        let imgObj = {};

        try {

            fs.readdir(dir, (err, files) => {
                if (err) {
                    console.log('Error in getting image ->', err);
                }

                try {
                    files.forEach(file => {
                        let fileLocale = dir + file;

                        fs.readFile(fileLocale, (err, fileData) => {
                            if (err) {
                                console.error("Error when reading file ->", err);
                            }

                            let extName = path.extname(fileLocale);
                            let buff64 = Buffer.from(fileData, "binary").toString("base64");
                            let imgString = `data:image/${extName.split(".").pop()};base64,${buff64}`;

                            imgObj["type"] = "image";
                            imgObj["data"] = imgString;
                            imgObj["uid"] = data["uid"];

                            io.emit("images", imgObj);
                        });

                    });
                } catch (error) {
                    console.error("Error in loop ->", error);
                }

            });

        } catch (error) {
            console.log('Error when reading directory ->', error);
        }
    });

    socket.on("audio", audioClip => {
        const dir = './media/audio/';
        let audioObj = {};

        if (audioClip["uid"]) {
            audioObj["uid"] = audioClip["uid"];
            console.log("Unique ID ->", audioObj["uid"]);

            if (audioClip["data"]) {
                console.log("audioClip['data'] ->", audioClip["data"]);
                try {

                    let audioLocale = dir + audioClip["data"];
                    console.log("audioLocale ->", audioLocale);

                    let rawStream = fs.createReadStream(audioLocale, {
                        highWaterMark: 4096
                    });

                    rawStream.on("data", chunk => {
                        // console.log("Chunk of data ->", chunk);
                        audioObj["data"] = chunk;

                        io.emit("audioChunk", audioObj);
                    });

                    rawStream.on("end", () => {
                        audioObj["data"] = "Done";

                        io.emit("audioChunk", audioObj);
                    });

                    rawStream.on("error", err => {
                        console.error("Error has occured when reading file for stream ->", err);
                    });
                } catch (error) {
                    console.error("Error when attempting to stream data ->", error);
                }
            } else {
                try {
                    fs.readdir(dir, (err, files) => {
                        if (err) {
                            console.error("Error when reading directory ->", err);
                        }

                        audioObj["files"] = files;
                        console.log("Files ->", audioObj);

                        io.emit("audioChunk", audioObj);
                    });
                } catch (error) {
                    console.error("Error when reading directory ->", error);
                }
            }
        }

    });

    socket.on("video", videoClip => {
        const dir = './media/video/';
        let videoObj = {};

        if (videoClip["uid"]) {
            videoObj["uid"] = videoClip["uid"];
            console.log("Unique ID ->", videoObj["uid"]);

            if (videoClip["data"]) {
                console.log("videoClip['data'] ->", videoClip["data"]);
                try {

                    let videoLocale = dir + videoClip["data"];
                    console.log("videoLocale ->", videoLocale);

                    let rawStream = fs.createReadStream(videoLocale, {
                        highWaterMark: 480000
                    });

                    rawStream.on("data", chunk => {
                        // console.log("Chunk of data ->", chunk);
                        videoObj["data"] = chunk;
                        
                        io.emit("videoChunk", videoObj);
                    });

                    rawStream.on("end", () => {
                        videoObj["data"] = "Done";

                        io.emit("videoChunk", videoObj);
                    });

                    rawStream.on("error", err => {
                        console.error("Error has occured when reading file for stream ->", err);
                    });
                } catch (error) {
                    console.error("Error when attempting to stream data ->", error);
                }
            } else {
                try {
                    fs.readdir(dir, (err, files) => {
                        if (err) {
                            console.error("Error when reading directory ->", err);
                        }

                        videoObj["files"] = files;
                        console.log("Files ->", videoObj);

                        io.emit("videoChunk", videoObj);
                    });
                } catch (error) {
                    console.error("Error when reading directory ->", error);
                }
            }
        }

    });
});

http.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});