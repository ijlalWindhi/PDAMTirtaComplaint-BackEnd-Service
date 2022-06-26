//import library
const express = require('express');
const bodyParser = require('body-parser');

//implementasi library
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//import multer
const multer = require("multer")
const path = require("path")
const fs = require("fs")

//import model
const model = require('../models/index');
const report = model.report

//config storage image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/image/report")
    },
    filename: (req, file, cb) => {
        cb(null, "img-" + Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({ storage: storage })

// get all report
app.get("/", async (req,res) => {
    report.findAll()
        .then(result => {
            res.status(200).json({
                status: "success",
                report : result
            })
        })
        .catch(error => {
            res.status(400).json({
                status: "error",
                message: error.message
            })
        })
})

// get report by user
app.get("/:id_user", async (req,res) => {
    report.findOne({
        where: {
            id_user: req.params.id_user
        }
    })
    .then(result => {
        res.status(200).json({
            status: "success",
            report : result
        })
    })
    .catch(error => {
        res.status(400).json({
            status: "error",
            message: error.message
        })
    })
})

// add report
app.post("/add",upload.single("image"), async (req,res) => {
    const data = {
        id_user: req.body.id_user,
        name : req.body.name,
        date : req.body.date,
        address : req.body.address,
        description : req.body.description,
        image : req.file.filename
    }

    report.create(data)
        .then(result => {
            res.status(200).json({
                status: "success",
                message: "report has been add"
            })
        })
        .catch(error => {
            res.status(400).json({
                status: "error",
                message: error.message
            })
        })
})

// update report
app.put("/edit/:id",upload.single("image"), async (req,res) => {
    let param = {id : req.params.id}
    const data = {
        id_user: req.body.id_user,
        name : req.body.name,
        date : req.body.date,
        address : req.body.address,
        description : req.body.description,
    }
    // check if image is empty
    if (req.file) {
        // get data by id
        report.findOne({where: param})
        .then(result => {
            let oldFileName = result.image
            // delete old file
            let dir = path.join(__dirname,"../public/image/report",oldFileName)
            fs.unlink(dir, err => console.log(err))
        })
        .catch(error => {
            res.status(400).json({
                status: "error",
                message: error.message
            })
        })
        // set new filename
        data.image = req.file.filename
    }

    report.update(data, {where: param})
        .then(result => {
            res.status(200).json({
                status: "success",
                message: "report has been updated"
            })
        })
        .catch(error => {
            res.status(400).json({
                status: "error",
                message: error.message
            })
        })
})

// delete report
app.delete("/delete/:id", async (req,res) => {
    let param = {id : req.params.id}
    report.findOne({where: param})
        .then(result => {
            let oldFileName = result.image
            // delete old file
            let dir = path.join(__dirname,"../public/image/report",oldFileName)
            fs.unlink(dir, err => console.log(err))
        })
        .catch(error => {
            res.status(400).json({
                status: "error",
                message: error.message
            })
        })
    report.destroy({where: param})
        .then(result => {
            res.status(200).json({
                status: "success",
                message: "report has been deleted"
            })
        })
        .catch(error => {
            res.status(400).json({
                status: "error",
                message: error.message
            })
        })
})

module.exports = app