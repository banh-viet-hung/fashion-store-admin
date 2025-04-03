import requests from "./httpService";

const UserStatusServices = {
  changeUserStatus: async (username) => {
    return requests.put(`/user/change-status/${username}`);
  },
};

export default UserStatusServices; 