import requests from "./httpService";

const CategoryServices = {
  getAllCategory: async (page = 0, size = 20, status = "") => {
    // If status is 'da_xoa', use the deleted categories endpoint
    if (status === "da_xoa") {
      return CategoryServices.getAllDeletedCategories();
    }
    // Otherwise use the regular endpoint
    const response = await requests.get(`/category?page=${page}&size=${size}`);
    return response; // Trả về toàn bộ response để xử lý category và phân trang
  },

  getAllDeletedCategories: async () => {
    const response = await requests.get(`/categories/deleted`);
    // Restructure the response to match the expected format
    if (response?.data) {
      return {
        _embedded: {
          category: response.data
        },
        page: {
          totalElements: response.data.length,
          totalPages: 1
        }
      };
    }
    return { _embedded: { category: [] }, page: { totalElements: 0, totalPages: 0 } };
  },

  restoreCategory: async (id) => {
    return requests.post(`/categories/restore/${id}`);
  },

  getAllCategories: async () => {
    const response = await requests.get("/category?page=0&size=100");
    return response._embedded.category; // Trích xuất mảng category từ _embedded.category
  },

  getCategoryById: async (id) => {
    return requests.get(`/category/${id}`);
  },

  addCategory: async (body) => {
    return requests.post("/categories/create", body);
  },

  addAllCategory: async (body) => {
    return requests.post("/category/add/all", body);
  },

  updateCategory: async (id, body) => {
    return requests.put(`/categories/${id}`, body);
  },

  updateStatus: async (id, body) => {
    return requests.put(`/category/status/${id}`, body);
  },

  deleteCategory: async (id) => {
    return requests.delete(`/categories/${id}`);
  },

  updateManyCategory: async (body) => {
    return requests.patch("/category/update/many", body);
  },

  deleteManyCategory: async (body) => {
    return requests.post("/categories/delete-many", body);
  },
};

export default CategoryServices;
