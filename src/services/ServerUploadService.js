import axios from "axios";
import Cookies from "js-cookie";

const ServerUploadService = {
    /**
     * Upload multiple images to the local server
     * @param {File[]} files - Array of image files to upload
     * @returns {Promise<string[]>} - Array of new image URLs from local server
     */
    uploadMultipleImages: async (files) => {
        try {
            const formData = new FormData();

            // Append each file to the form data
            files.forEach(file => {
                formData.append('files', file);
            });

            // Get authentication token from Cookies
            let adminInfo;
            if (Cookies.get("adminInfo")) {
                adminInfo = JSON.parse(Cookies.get("adminInfo"));
            }

            if (!adminInfo || !adminInfo.token) {
                throw new Error("Không tìm thấy token xác thực, vui lòng đăng nhập lại!");
            }

            // Upload to local server
            const response = await axios.post('http://localhost:8080/images/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${adminInfo.token}`
                }
            });

            if (response.data && response.data.success && response.data.data) {
                console.log("Upload thành công:", response.data);
                // Return array of image URLs from the server
                return response.data.data.map(url => `http://localhost:8080${url}`);
            } else {
                console.error("Response không hợp lệ:", response.data);
                throw new Error(response.data?.message || "Định dạng phản hồi không hợp lệ");
            }
        } catch (error) {
            console.error("Lỗi khi upload ảnh lên server:", error);
            throw new Error(error.response?.data?.message || error.message || "Không thể tải ảnh lên server");
        }
    },

    /**
     * Fetch images from external URLs and convert to files for upload
     * @param {Object[]} images - Array of image objects with url and optional id
     * @returns {Promise<File[]>} - Array of File objects ready for upload
     */
    fetchImagesAsFiles: async (images) => {
        try {
            const imageFiles = await Promise.all(
                images.map(async (image, index) => {
                    const url = typeof image === 'string' ? image : image.url;
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch image: ${url}`);
                    }
                    const blob = await response.blob();

                    // Extract file extension from URL or use default
                    const urlParts = url.split('.');
                    const extension = urlParts.length > 1 ?
                        urlParts[urlParts.length - 1].split('?')[0] : 'jpg';

                    // Create a proper filename with index and product ID if available
                    const fileName = `product_image_${index + 1}.${extension}`;

                    // Create a new File from the blob with proper name and type
                    return new File([blob], fileName, {
                        type: blob.type || `image/${extension}`
                    });
                })
            );

            return imageFiles;
        } catch (error) {
            console.error("Lỗi khi tải ảnh từ URL:", error);
            throw new Error("Không thể tải một hoặc nhiều ảnh");
        }
    }
};

export default ServerUploadService; 