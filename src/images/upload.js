import { v2 as cloudinary } from 'cloudinary'
import sharp from 'sharp'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
    cloud_name: 'dzskwfinc',
    api_key: '137223823215616',
    api_secret: 'a_C8FexvcSIIHiI7hpUDEdYFT1Y'
});

export const uploadProfileImg = async (filePath) => {
    try {
       
        const uploadResult = await cloudinary.uploader.upload(filePath,{folder:'ProfileImgs'})
        return uploadResult

    } catch (err) {
        console.error('Image upload failed:', err)
        throw err
    }
}