import mongoose from 'mongoose'
import { validname, validEmail, validpassword } from '../validation/validation.js'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, 'Name is required'],
            validate: [validname, 'Invalid name']
        },
        email: {
            type: String,
            trim: true,
            required: [true, 'Email is required'],
            lowercase: true,
            validate: [validEmail, 'Invalid email']
        },
        password: {
            type: String,
            trim: true,
            required: [true, 'Password is required'],
            validate: [
                validpassword,
                'Invalid password. Please provide at least 8 characters with 1 lowercase, 1 uppercase, 1 special character and 1 number'
            ]
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other', ''],
            default: 'Male'
        },
        avatar: {
            type: String,
            default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
        },
        phone: {
            type: String,
            default: ''
        },
        address: {
            type: String,
            default: ''
        },
        bio: {
            type: String,
            default: 'Fine spirits enthusiast & WhiskyHub connoisseur.'
        },
        user: {
            isDelete: { type: Boolean, default: false },
            otpExpire: { type: Number, default: 0 },
            isVerify: { type: Boolean, default: false },
            userotp: { type: Number, default: null }
        }
    },
    { timestamps: true }
)

userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10)
    }
})

export default mongoose.model('User', userSchema)