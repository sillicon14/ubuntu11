import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
    return jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
    
      },
      process.env.JWT_SECRET || 'somethingsecret',
      {
        expiresIn: '2d',
      }
    );
  };

export const isAuth = (req, res, next) => {
    const authorization = req.cookies.token;
    if (authorization) {
        const token = authorization;
        jwt.verify(
            token,
            process.env.JWT_SECRET || 'somethingsecret',
            (err, decode) => {
                if (err) {
                    res.status(401).send({ message: 'Invalid Token' });
                } else {
                    req.user = decode;
                    next();
                }
            }
        );
    } else {
        res.status(401).send({ message: 'No Token' });
    }
};


export const auth = (req,res,next)=>{
    try{
         const token = req.cookies.token
         if (!token) return res.status(401).json({"status" : "unarthorized"});
         const verify = jwt.verify(token,process.env.JWT_SECRET || 'somethingsecret')
         req.user = verify.userId
         console.log(req.user)
         
         next()
    }catch(err){
        console.log(err)
        res.status(501).send("error")
    }
};


export const isAdmin = (req, res, next) => {
    console.log("inside is admin");
    console.log(req.user);
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).send({ message: 'Invalid Admin Token' });
    }
};

/*
module.exports = auth
*/