const User = require("../models/User")

//check role of user
function authRole(role) {
    
    return (req, res, next) =>{
        console.log(req.user.role);
        if (req.user.role === role){
            next();
            return;
        }res.status(403).send({message:"require Higher Permission!"})
        
    }
    
}

  module.exports={
      authRole
  }