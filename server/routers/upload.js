const router = require('express').Router()
const cloudinary = require('cloudinary')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')
const fs = require('fs')
// Uplaod img

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

// Upload only admin

router.post('/upload',auth, authAdmin, (req, res)=> {
    try {
        console.log(req.files)
        if(!req.files || Object.keys(req.files).length === 0)
            return res.status(400).json({msg: 'no file was upload'})

        const file = req.files.file;
        if(file.size > 1024*1024) {
            removeTmp(file.tempFilePath)


            return res.status(400).json({msg: "Size too large"})
        }
        

        if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png'){
            removeTmp(file.tempFilePath)

            return res.status(400).json({msg: "file format is incorrect"})
        }
            
        
        cloudinary.v2.uploader.upload(file.tempFilePath, {folder: "test"}, async(err, result) => {
            if(err) throw err;
            removeTmp(file.tempFilePath)
            // khi upload anh thi se luu vao /tmp
            res.json({public_id: result.public_id, url: result.secure_url})
        })

        

    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
})

// delete img only admin use

router.post('/destroy',auth, authAdmin, (req, res) => {
    try {
        const {public_id} = req.body;
        if(!public_id) return res.status(400).json({msg: 'Mo img selected'})

        cloudinary.v2.uploader.destroy(public_id, async(err, result) => {
            if(err) throw err;

            res.json({msg: "Delete img"})
        })

    } catch (err) {
        return res.status(500).json({msg: err.message})
    }

})






const removeTmp = (path) => {
    fs.unlink(path, err => {
        if(err) throw err;


    })
}





module.exports = router