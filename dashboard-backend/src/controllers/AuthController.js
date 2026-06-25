const AuthModel = require('../models/AuthModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try{
        const {username, password, role} = req.body;
        if (!username || !password || !role){
            return res.status(400).json({message: "all fields are required"});
        }

        const newUser = await AuthModel.createUser(username, password, role);
        res.status(201).json(newUser);
    } catch (err){
        res.status(500).json({error: err.message});
    }
};

exports.login = async (req, res) =>{
    try {
        const {username, password} = req.body;
        const user = await AuthModel.findByUsername(username);

        if (!user){
            return res.status(401).json({message:"Invalid credentials"});
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if(!isMatch){
            return res.status(401).json({message:"invalid credentials"});
        }

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                hospitalId: user.hospital_id || user.hospitalId,
                staffId: user.staff_id || user.staffId
            },
            process.env.JWT_SECRET || '1234',
            {expiresIn: '8h'}
        );

        res.json({
            token,
            user:{
                id: user.id,
                username: user.username,
                role: user.role,
                hospitalId: user.hospital_id || user.hospitalId
            }
        });
    } catch (err){
        res.status(500).json({error: err.message});
    }
};