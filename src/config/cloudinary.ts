import { v2 as cloudinary } from 'cloudinary'
import configs from './index'

cloudinary.config({
  cloud_name: configs.cloudinaryCloudName,
  api_key: configs.cloudinaryApiKey,
  api_secret: configs.cloudinaryApiSecret
})

export default cloudinary
