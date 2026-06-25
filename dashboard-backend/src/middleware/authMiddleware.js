const jwt = require('jsonwebtoken');

module.exports = (req, res, next) =>{
    // Allow bypassing auth for local testing when DISABLE_AUTH=true
    if (process.env.DISABLE_AUTH === 'true'){
        req.user = { userId: null, role: 'dev' };
        return next();
    }

    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token){
        return res.status(401).json({message: "No token, authorization denied"});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '1234');
        req.user = decoded;
        next();
    } catch (err){
        res.status(401).json({message: "Token is not valid"});
    }
};