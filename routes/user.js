//import library
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const {Op} = require('sequelize');

//implementasi library
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//import model
const model = require('../models/index');
const user = model.user

// endpoint get all data user
app.get("/", async (req,res) => {
    user.findAll()
        .then(result => {
            res.status(200).json({
                status: "success",
                user : result
            })
        })
        .catch(error => {
            res.status(400).json({
                status: "error",
                message: error.message
            })
        })
})

// endpoint get data by id
app.get("/:id", async (req,res) => {
    user.findOne({
        where: {
            id: req.params.id
        }
    })
        .then(result => {
            sessionData=req.session;
            res.status(200).json({
                status: "success",
                user : result
            })
        })
        .catch(error => {
            res.status(400).json({
                status: "error",
                message: error.message
            })
        })
})

// endpoint register
app.post("/register", async (req,res) => {
    const data = {
        name : req.body.name,
        username : req.body.username,
        password : req.body.password,
        email : req.body.email,
        address : req.body.address,
        role : req.body.role,
        telephone : req.body.telephone,
        resultArr: {}
    }
    
    // bcrypt password
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);

    user.findAll({
        where: {
            [Op.or]: [{email: data.email}, {username: data.username}]
        }
    })
    .then(result => {
        resultArr = result;
        if(resultArr.length > 0){
            if(resultArr[0].email == data.email){
                res.status(400).json({
                    status: "error",
                    message: "Email already exist"
                })
            }else{
                res.status(400).json({
                    status: "error",
                    message: "Username already exist"                
                })
            }
        }else{
            user.create(data)
            .then(result => {
                res.status(200).json({
                    status: "success",
                    message: "User has been add"
                })
            })
            .catch(error => { 
                res.status(400).json({
                    status: "error",
                    message: error.message
                })
            })
        }
    })
})

// endpoint login
app.post("/login", async (req, res) => {
    const data = await user.findOne({where : {email: req.body.email}});
    if (data) {
        const validPassword = await bcrypt.compare(req.body.password, data.password);
        if (validPassword) {
            // token
            // let payload = JSON.stringify(user)
            // let token = jwt.sign(payload, SECRET_KEY)
            res.status(200).json({  status: "success",
                        logged: true,
                        message: "Valid password",
                        data: data
                    });
        } else {
            res.status(400).json({  status: "error",
                        logged: false,
                        message: "Invalid Password"
                    });
        }
    } else {
        res.status(400).json({
            status: "error",
            message: "User does not exist"
        });
    }
});

// endpoint delete
app.delete("/delete/:id", async (req,res) => {
    let param = {
        id : req.params.id
    }

    // delete data
    user.destroy({where : param})
        .then(result => {
            res.status(200).json({
                status: "success",
                message: "User has been deleted"
            })
        })
        .catch(error => {
            res.status(400).json({
                status: "error",
                message: error.message
            })
        })
})

// endpoint edit
app.put("/edit/:id", async (req,res) => {
    let param = {id : req.params.id}
    const data = {
        name : req.body.name,
        username : req.body.username,
        password : req.body.password,
        address : req.body.address,
        role : req.body.role,
        telephone : req.body.telephone,
        resultArr: {}
    }

    // check if password is empty
    if(data.password){
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
    }

    user.findAll({
        where: {
            username: data.username
        }
    })
    .then(result => {
        resultArr = result;
        if(resultArr.length > 0){
            res.status(400).json({
                status: "error",
                message: "Username already exist"
            })
        }else{
            user.update(data, {where : param})
            .then(result => {
                res.status(200).json({
                    status: "success",
                    message: "User has been updated"
                })
            })
            .catch(error => {
                res.status(400).json({
                    status: "error",
                    message: error.message
                })
            })
        }
    })
})

module.exports = app