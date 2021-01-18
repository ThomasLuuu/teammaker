const User = require('../models/User');
const Post = require('../models/Post');
const { findById } = require('../models/User');
function authorcheck(){
    return(req, res, next)=>{
        Post.find({_id: req.params.id}).select('-_id creator').exec(function(err, result) {
            var creatormail = result.map(({creator})=>creator)
            console.log(creatormail[0]);
            if (req.user.email === creatormail[0]){
                console.log("ờ mây zing gút chóp")
                next();
                return;
            }res.status(403).send({message:"Sorry you can't"})
        })
        
       

    }
}

module.exports={
    authorcheck
}