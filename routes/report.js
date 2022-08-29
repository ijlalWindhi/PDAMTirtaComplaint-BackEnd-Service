//import library
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

//implementasi library
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//import multer
const multer = require("multer");
const path = require("path");
const fs = require("fs");

//import model
const model = require("../models/index");
const report = model.report;
const user = model.user;

//config storage image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/image/report");
    },
    filename: (req, file, cb) => {
        cb(null, "img-" + Date.now() + path.extname(file.originalname));
    },
});
let upload = multer({ storage: storage });

// get all report
app.get("/", async (req, res) => {
    report
        .findAll()
        .then((result) => {
            res.status(200).json({
                status: "success",
                report: result,
            });
        })
        .catch((error) => {
            res.json({
                status: "error",
                message: error.message,
            });
        });
});

// get report by id
app.get("/history/:id_user", async (req, res) => {
    report
        .findAll({
            where: {
                id_user: req.params.id_user,
            },
            order: [["id", "DESC"]],
        })
        .then((result) => {
            res.status(200).json({
                data: result,
            });
        })
        .catch((error) => {
            res.json({
                status: "error",
                message: error.message,
            });
        });
});

// get last report by user
app.get("/:id_user", async (req, res) => {
    report
        .findOne({
            where: {
                id_user: req.params.id_user,
            },
            order: [["id", "DESC"]],
        })
        .then((result) => {
            res.status(200).json({
                data: result,
            });
        })
        .catch((error) => {
            res.json({
                status: "error",
                message: error.message,
            });
        });
});

// add report
app.post("/add", upload.single("image"), async (req, res) => {
    const data = {
        id_user: req.body.id_user,
        name: req.body.name,
        date: req.body.date,
        address: req.body.address,
        description: req.body.description,
        image: req.file.filename,
    };

    report
        .create(data)
        .then((result) => {
            res.status(200).json({
                status: "success",
                message: "report has been add",
            });

            user.findOne({
                where: {
                    id: req.body.id_user,
                },
            }).then((respons) => {
                // setup for sender mail
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: "ijlalwindhi15@gmail.com", //suggestion use gmail
                        pass: "YourPassword", //password your mail account
                    },
                });

                const mailOptions = {
                    from: '"PDAM Tirta Sidoarjo" <ijlalwindhi15@gmail.com>', //mail like in above
                    to: respons.email,
                    subject: "Review Feedback PDAM Tirta Sidoarjo",
                    html:
                        "<h3><b>Judul Pengaduan :</b></h3>" +
                        `<h3>${result.name}</h3>` +
                        "<br>" +
                        "<h3><b>Tanggal Pengaduan :</b></h3>" +
                        `<h3>${result.date}</h3>` +
                        "<br>" +
                        "<h3><b>Deskripsi Pengaduan :</b></h3>" +
                        `<h3>${result.description}</h3>` +
                        "<br>" +
                        "<h3><b>Alamat Pengaduan :</b></h3>" +
                        `<h3>${result.address}</h3>` +
                        "<br>",
                };

                transporter.sendMail(mailOptions, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            });
        })
        .catch((error) => {
            res.json({
                status: "error",
                message: error.message,
            });
        });
});

// update report
app.put("/edit/:id", upload.single("image"), async (req, res) => {
    let param = { id: req.params.id };
    const data = {
        id_user: req.body.id_user,
        name: req.body.name,
        date: req.body.date,
        address: req.body.address,
        description: req.body.description,
    };
    // check if image is empty
    if (req.file) {
        // get data by id
        report
            .findOne({ where: param })
            .then((result) => {
                let oldFileName = result.image;
                // delete old file
                let dir = path.join(
                    __dirname,
                    "../public/image/report",
                    oldFileName
                );
                fs.unlink(dir, (err) => console.log(err));
            })
            .catch((error) => {
                res.json({
                    status: "error",
                    message: error.message,
                });
            });
        // set new filename
        data.image = req.file.filename;
    }

    report
        .update(data, { where: param })
        .then((result) => {
            res.status(200).json({
                status: "success",
                message: "report has been updated",
            });
        })
        .catch((error) => {
            res.json({
                status: "error",
                message: error.message,
            });
        });
});

// delete report
app.delete("/delete/:id", async (req, res) => {
    let param = { id: req.params.id };
    report
        .findOne({ where: param })
        .then((result) => {
            let oldFileName = result.image;
            // delete old file
            let dir = path.join(
                __dirname,
                "../public/image/report",
                oldFileName
            );
            fs.unlink(dir, (err) => console.log(err));
        })
        .catch((error) => {
            res.json({
                status: "error",
                message: error.message,
            });
        });
    report
        .destroy({ where: param })
        .then((result) => {
            res.status(200).json({
                status: "success",
                message: "report has been deleted",
            });
        })
        .catch((error) => {
            res.json({
                status: "error",
                message: error.message,
            });
        });
});

module.exports = app;
