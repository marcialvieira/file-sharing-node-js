require("dotenv").config()
const multer = require("multer")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const File = require("./models/File")
const path = require("path")

const express = require("express")
const app = express()
app.use(express.urlencoded({ extended: true }))
const fs = require('fs');

const upload = multer({ dest: "files" })

const connectionString = process.env.DATABASE_URL || 'mongodb://localhost/file-sharing'
mongoose.connect(connectionString)

app.set("view engine", "ejs")

app.get("/", (req, res) => {
    res.render("index")
})

app.post("/upload", upload.single("file"), async (req, res) => {
    const ext = path.parse(req.file.originalname).ext
    if (ext != '.gz') {
        fs.unlinkSync(req.file.path) // remove temp file.
        res.render("index", { gzip: 'Only gzip files are supported.' })
        return
    }
    let fileData = {
        id: path.basename(req.file.path), // reusing multer random name as id for url.
        originalName: req.file.originalname,
        downloadCount: 0,
    }

    if (req.body.password != null && req.body.password !== "") {
        fileData.password = await bcrypt.hash(req.body.password, 10)
    }
    fs.renameSync(req.file.path, 'files/' + req.file.originalname, () => {
        console.log('Upload ' + req.file.originalname);
    });

    var file = await File.findOne({ 'originalname': req.file.originalname });
    if ( file != null ) {
        // Replace id when overwriting or comment to keep the previous?
        // this invalidates previous link because of wrong id-path.
        file.id = fileData.id
        file.password = fileData.password
        await file.save()
        res.render("index", { fileLink: `${req.headers.origin}/download/${fileData.id}/${req.file.originalname}`, replace: true })
    } else {
        file = await File.create(fileData)
        res.render("index", { fileLink: `${req.headers.origin}/download/${fileData.id}/${req.file.originalname}` })
    }
})

app.route("/download/:id/:fn").get(handleDownload).post(handleDownload)

async function handleDownload(req, res) {
    file = await File.findOne({ 'id': req.params.id, 'originalName': req.params.fn });
    // file not exist or wrong "middle path".
    if (file == null) {
        res.render("index", { notfound: true })
        return
    }
    if (file.password != null) {
        if (req.body.password == null) {
            res.render("password")
            return
        }

        if (!(await bcrypt.compare(req.body.password, file.password))) {
            res.render("password", { error: true })
            return
        }
    }

    file.downloadCount++
    await file.save()
    console.log(`Download ${req.params.fn}: ${file.downloadCount}`)

    res.download('files/' + req.params.fn, req.params.fn)
}

const port = process.env.PORT || 3000;
app.listen(port, () =>
    console.log(`App is listening on port ${port}.`)
);
