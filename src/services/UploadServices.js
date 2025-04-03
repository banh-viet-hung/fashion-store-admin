import axios from "axios";

// Lấy giá trị từ biến môi trường
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_APP_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_URL = import.meta.env.VITE_APP_CLOUDINARY_URL;

const UploadServices = {
  /**
   * Upload một file ảnh lên Cloudinary
   * @param {File} file - File ảnh cần upload
   * @returns {Promise<string>} URL của ảnh sau khi upload thành công
   */
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      
      const response = await axios.post(CLOUDINARY_URL, formData);
      
      return response.data.secure_url;
    } catch (error) {
      console.error("Lỗi khi upload ảnh lên Cloudinary:", error);
      throw new Error("Không thể tải ảnh lên. Vui lòng thử lại.");
    }
  },
  
  /**
   * Upload nhiều file ảnh lên Cloudinary
   * @param {File[]} files - Mảng các file ảnh cần upload
   * @returns {Promise<string[]>} Mảng URL của các ảnh sau khi upload thành công
   */
  uploadMultipleImages: async (files) => {
    try {
      const uploadPromises = files.map(file => 
        UploadServices.uploadImage(file)
      );
      
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Lỗi khi upload nhiều ảnh lên Cloudinary:", error);
      throw new Error("Không thể tải các ảnh lên. Vui lòng thử lại.");
    }
  }
};

export default UploadServices; 