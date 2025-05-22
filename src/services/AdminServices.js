import requests from "./httpService";

const AdminServices = {
  registerAdmin: async (body) => {
    return requests.post("/admin/register", body);
  },

  // loginAdmin: async (body) => {
  //   return requests.post(`/admin/login`, body);
  // },


  loginAdmin: async (body) => {
    return requests.post("/api/auth/login", body);
  },

  forgetPassword: async (body) => {
    return requests.put("/admin/forget-password", body);
  },

  resetPassword: async (body) => {
    return requests.put("/admin/reset-password", body);
  },

  signUpWithProvider: async (body) => {
    return requests.post("/admin/signup", body);
  },

  addStaff: async (body) => {
    return requests.post("/admin/add", body);
  },

  getAllStaff: async ({ page = 1, size = 5, searchTerm = "", roleName = "STAFF", isActive = true, cancelToken }) => {
    return requests.get(
      `/user/all?page=${page}&size=${size}&searchTerm=${searchTerm}&roleName=${roleName}&isActive=${isActive}`,
      { cancelToken }
    );
  },

  getStaffById: async (id, body) => {
    return requests.post(`/admin/${id}`, body);
  },

  updateStaff: async (id, body) => {
    return requests.put(`/admin/${id}`, body);
  },

  updateStaffStatus: async (id, body) => {
    return requests.put(`/admin/update-status/${id}`, body);
  },

  deleteStaff: async (id) => {
    return requests.delete(`/admin/${id}`);
  },
  getAllRoles: async () => {
    return requests.get("/role");
  },

  createUser: async (userData) => {
    return requests.post("/user/admin/create-user", userData);
  },
};

export default AdminServices;
