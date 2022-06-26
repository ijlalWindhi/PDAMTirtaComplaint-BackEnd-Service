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

module.exports = app