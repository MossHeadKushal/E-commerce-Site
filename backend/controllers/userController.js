
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

//Routes for user Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'User doenst exist' })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = createToken(user._id)
            res.json({ success: true, token, name: user.name })
        }
        else {
            res.json({ success: false, message: 'Invalid Credentials' })
        }


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }

}

// Get profile information for authenticated user
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.body
        const user = await userModel.findById(userId).select('name email')
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }
        res.json({ success: true, user })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//Routes for User Registration

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // chechking existed user or not

        const exists = await userModel.findOne({ email })
        if (exists) {
            return res.json({ success: false, message: 'Already existed user' })
        }

        //validating email format and strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Enter a valid email' })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: 'Enter a strong password' })
        }

        // hasing user password

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token, name: user.name })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//Routes for Admin Login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, token })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}



export { loginUser, registerUser, adminLogin, getUserProfile }