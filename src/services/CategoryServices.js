import requests from "./httpService";

const CategoryServices = {
  getAllCategory: async (page = 0, size = 20) => {
    const response = await requests.get(`/category?page=${page}&size=${size}`);
    return response; // Trả về toàn bộ response để xử lý category và phân trang
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
    return requests.put(`/category/${id}`, body);
  },

  updateStatus: async (id, body) => {
    return requests.put(`/category/status/${id}`, body);
  },

  deleteCategory: async (id) => {
    return requests.delete(`/category/${id}`);
  },

  updateManyCategory: async (body) => {
    return requests.patch("/category/update/many", body);
  },

  deleteManyCategory: async (body) => {
    return requests.post("/categories/delete-many", body);
  },
};

export default CategoryServices;
