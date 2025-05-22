import requests from "./httpService";

const CustomerServices = {
  getAllCustomers: async ({ page, size, searchTerm, isActive, cancelToken }) => {
    return requests.get(
      `/user/all?page=${page}&size=${size}&searchTerm=${searchTerm}&roleName=USER&isActive=${isActive}`,
      { cancelToken }
    );
  },

  addAllCustomers: async (body) => {
    return requests.post("/customer/add/all", body);
  },

  createCustomer: async (body) => {
    return requests.post("/customer/create", body);
  },

  filterCustomer: async (email) => {
    return requests.post(`/customer/filter/${email}`);
  },

  getCustomerById: async (id) => {
    return requests.get(`/customer/${id}`);
  },

  updateCustomer: async (id, body) => {
    return requests.put(`/customer/${id}`, body);
  },

  deleteCustomer: async (id) => {
    return requests.delete(`/customer/${id}`);
  },
};

export default CustomerServices;
