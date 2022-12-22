const User = require('../models/User');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');

const register = async (req,res) => {
    //res.send('register user');
    const { email,name,password } = req.body;
    const emailAlreadyExists = await User.findOne({email});
    if(emailAlreadyExists){
        throw new CustomError.BadRequestError('Email already exist');
    }

    // first registration user is an admin
    const isFirstAccount = await User.countDocuments({}) === 0;
    const role = isFirstAccount ? 'admin' : 'user';

    const user = await User.create({ name,email,password,role });
    const tokenUser = createTokenUser(user);
    //const token = createJWT({ payload:tokenUser });
    attachCookiesToResponse({res, user:tokenUser})

    //const token = jwt.sign(tokenUser, 'jwtSecret', {expiresIn: '1d'});
    res.status(StatusCodes.CREATED).json({ user:tokenUser });
};

const login = async (req,res) => {
    //res.send('login user');
    const {email, password} = req.body;

    if (!email || !password){
        throw new CustomError.BadRequestError('Please provide email and password');
    }
    const user = await User.findOne({ email });

    if (!user){
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    const tokenUser = createTokenUser(user);
    //const token = createJWT({ payload:tokenUser });
    attachCookiesToResponse({res, user:tokenUser})

    //const token = jwt.sign(tokenUser, 'jwtSecret', {expiresIn: '1d'});
    res.status(StatusCodes.OK).json({ user:tokenUser });
};

const logout = async (req,res) => {
    //res.send('logout user');
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ msg:'user logout!' })
};

module.exports = {
    register,
    login,
    logout,
};