import cloudinary from '../config/cloudinary.js';

export const uploadImage = async (filePath) => {
  console.log("📂 File path received for upload:", filePath); // 1. పాత్ వస్తుందో లేదో చూడు
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'sudara_images',
    });
    console.log("✅ Cloudinary Full Response:", result); // 2. సర్వర్ నుండి వచ్చే ఫుల్ డేటా
    return result.secure_url; 
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error); // 3. ఎర్రర్ వస్తే ఇక్కడ తెలుస్తుంది
    throw error;
  }
};