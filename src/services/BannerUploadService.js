import axios from "axios";
import Cookies from "js-cookie";

const BannerUploadService = {
    /**
     * Upload a banner image to the local server
     * @param {File} file - Banner image file to upload
     * @returns {Promise<string>} - URL of the new image from local server
     */
    uploadBannerImage: async (file) => {
        try {
            const formData = new FormData();

            // Append file to the form data
            formData.append('files', file);

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
                console.log("Upload banner thành công:", response.data);
                // Return URL of the image from the server - lấy URL đầu tiên nếu có nhiều ảnh
                const imageUrl = Array.isArray(response.data.data)
                    ? `http://localhost:8080${response.data.data[0]}`
                    : `http://localhost:8080${response.data.data}`;
                return imageUrl;
            } else {
                console.error("Response không hợp lệ:", response.data);
                throw new Error(response.data?.message || "Định dạng phản hồi không hợp lệ");
            }
        } catch (error) {
            console.error("Lỗi khi upload ảnh banner lên server:", error);
            throw new Error(error.response?.data?.message || error.message || "Không thể tải ảnh lên server");
        }
    }
};

export default BannerUploadService; 