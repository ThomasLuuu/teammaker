const User = require('../models/User');
const Post = require('../models/Post'); 

function personalcheck(){
    return(req, res, next)=>{
        const studentid = req.user.id
        const editid = req.params.id
        console.log(editid)
        if (studentid === editid){
            next()
            return;
        }res.status(403).send({message: "No! you can't edit other people profile"})
        // if (studentid = editid){
        //     console.log("Allowed !");
        //     next()
        //     return;
        // }res.status(403).send({message:"NO! you can't edit other people profile"})
    }
}

module.exports={
    personalcheck
}