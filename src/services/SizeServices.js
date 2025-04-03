import requests from "./httpService";

const SizeServices = {
  getAllSizes: async () => {
    const response = await requests.get("/size");
    return response._embedded.size; // Trả về mảng size từ _embedded.size
  },
};

export default SizeServices; 