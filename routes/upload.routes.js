const stream = require('stream')
const express= require('express')
const { authJwt } = require("../middleware");
const multer = require('multer')
const path = require('path')
const controller = require("../controllers/user.controller");
const {google} = require('googleapis')


const uploadRouter = express.Router()
const upload = multer()

const KEYFILEPATH = path.join(__dirname + "/../credentials.json")
const SCOPES = ['https://www.googleapis.com/auth/drive']
const folderID = ['1vb8-adjrLWlsXnsb2odFlqOTDWHW-v_I']
const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES
})

const uploadFile = async (req, res, fileObject, userId, isProfilePicture) => {
    const bufferStream = new stream.PassThrough()
    bufferStream.end(fileObject.buffer)
    console.log(isProfilePicture)
    const {data} = await google.drive({
        version: 'v3',
        auth
    }).files.create({
        media:{
            mimeType: fileObject.mimetype,
            body: bufferStream
        },
        requestBody: {
            name: fileObject.originalname,
            parents: folderID
        },
        fields: "id,name"
    });
    console.log(data.id)
    console.log(`uploaded file ${fileObject.originalname}`)

    if(isProfilePicture){
        controller.profilePicture(req, res, data.id)
    } else {
        controller.image(req, res, data.id)
    }


}

uploadRouter.post("/user/:userId/avatar" , upload.any(), async (req, res) => {
    let statusCode = 200
    try{
        const type = "image"
        const {body, files} = req
        let file = files[0]
        if(file.mimetype.substring(0,5) == type){
            await uploadFile(req, res, file, req.params["userId"], true)
            res.status(200).send("Submitted")
        } else {
            statusCode = 415
            throw("Wrong file type")
        }
    } catch (e) {
        console.log(e.message)
        res.status(415).send(e.message)
    }
})
uploadRouter.get("/user/:userId/avatar" , controller.getAvatarLink)
uploadRouter.post("/user/:userId/photos" , upload.any(), async (req, res) => {
    try{
        const type = "image"
        const {body, files} = req
        for ( let f = 0; f<files.length; f += 1) {
            let file = files[f]
            if(file.mimetype.substring(0,5) == type){
                await uploadFile(req, res, file, req.params["userId"], false)
            }
            
        }
        console.log(body);
        res.status(200).send("Submitted")
    } catch (e) {
        console.log(e.message)
        res.send(e.message)
    }
})
uploadRouter.get("/user/:userId/photos" , controller.getPhotos)
uploadRouter.delete("/user/:userId/photos/:photoId", [authJwt.verifyToken], controller.deletePhoto)
uploadRouter.post('/upload', upload.any(), async (req, res) => {
    try{
        console.log(req.body);
        console.log(req.files);
        const {body, files} = req
        for ( let f = 0; f<files.length; f += 1) {
            await uploadFile(files[f],1)
        }
        console.log(body);
        res.status(200).send("Form submitted")
    } catch (e) {
        console.log(e.message)
        res.send(e.message)
    }
})
module.exports = uploadRouter