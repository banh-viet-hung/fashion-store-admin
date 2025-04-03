import requests from "./httpService";

const UserRoleServices = {
  updateUserRole: async (username, role) => {
    return requests.put(`/user/update-role/${username}`, { role });
  },
};

export default UserRoleServices; 