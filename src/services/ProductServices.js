import requests from "./httpService";

const ProductServices = {
  getAllProducts: async ({ page, limit, category, title, status }) => {
    const searchCategory = category !== null ? category : "";
    const searchTitle = title !== null ? title : "";
    const searchStatus = status !== null ? status : "";

    const response = await requests.get(
      `/products/list?page=${
        page - 1
      }&limit=${limit}&category=${searchCategory}&status=${searchStatus}&title=${searchTitle}`
    );
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data;
  },

  getProductById: async (id) => {
    return requests.get(`/products/${id}`);
  },
  
  getProductImages: async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/product/${id}/images`);
      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error("Error fetching product images:", error);
      return {
        success: false,
        message: "Không thể tải hình ảnh sản phẩm"
      };
    }
  },
  
  getProductVariants: async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/product-variant/${id}/variants`);
      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error("Error fetching product variants:", error);
      return {
        success: false,
        message: "Không thể tải biến thể sản phẩm"
      };
    }
  },
  
  addProduct: async (body) => {
    return requests.post("/products/create", body);
  },
  
  addProductImages: async (productId, body) => {
    console.log("Gửi request lưu ảnh với body:", JSON.stringify(body));
    // Đảm bảo body được gửi đúng định dạng
    const requestBody = {
      imageUrls: Array.isArray(body.imageUrls) ? body.imageUrls : [body.imageUrls]
    };
    
    return requests.post(`/products/${productId}/images`, requestBody);
  },
  
  addProductVariants: async (productId, variants) => {
    console.log("Gửi request tạo variants với body:", JSON.stringify(variants));
    return requests.post(`/product-variant/${productId}/variants`, variants);
  },
  
  addAllProducts: async (body) => {
    return requests.post("/products/all", body);
  },
  
  updateProduct: async (id, body) => {
    return requests.put(`/products/update/${id}`, body);
  },
  
  updateProductImages: async (id, body) => {
    // Đảm bảo body được gửi đúng định dạng
    const requestBody = {
      imageUrls: Array.isArray(body.imageUrls) ? body.imageUrls : [body.imageUrls]
    };
    
    return requests.put(`/products/${id}/images`, requestBody);
  },
  
  updateProductVariants: async (id, body) => {
    return requests.put(`/product-variant/${id}/variants`, body);
  },
  
  updateManyProducts: async (body) => {
    return requests.patch("products/update/many", body);
  },
  
  updateStatus: async (id, body) => {
    return requests.put(`/products/status/${id}`, body);
  },

  deleteProduct: async (id) => {
    return requests.delete(`/products/delete/${id}`); // API xóa riêng lẻ
  },

  deleteManyProducts: async (body) => {
    return requests.post("/products/delete-many", body); // API xóa nhiều
  },
};

export default ProductServices;
