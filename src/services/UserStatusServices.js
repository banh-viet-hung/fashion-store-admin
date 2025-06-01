import requests from "./httpService";

const UserStatusServices = {
  changeUserStatus: async (username, lockReason = null) => {
    if (lockReason) {
      return requests.put(`/user/change-status/${username}`, { lockReason });
    } else {
      return requests.put(`/user/change-status/${username}`);
    }
  },
};

export default UserStatusServices; 