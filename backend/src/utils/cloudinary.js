import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// this Configuration allows your application to interact with Cloudinary’s services, such as uploading files or accessing and manipulating images. 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//function to handle the process of uploading a file from a local path to  cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload the file on cloudinary

    //response will hold the response from Cloudinary after the file is uploaded.
    // The response typically includes details like the URL of the uploaded file, its public ID, and other metadata.
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // detect the type of file automatically
    });

    console.log("response of the cloudinary is below:- ", response); // log just for knowledge

    //file has been uploaded successfully
    console.log("file is uploaded on Cloudinary", response.url);
    fs.unlinkSync(localFilePath); // unlink the file from the local system
    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};


const deleteFromCloudinary = async(publicId) =>{
  try{
    if(!publicId) return null;

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto"
    })

    return response
    
}catch(error){
  console.error("Error deleting file on Cloudinary:", error);
  return null;
}
}

export { uploadOnCloudinary ,deleteFromCloudinary };
