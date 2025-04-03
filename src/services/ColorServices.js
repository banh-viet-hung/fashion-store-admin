import requests from "./httpService";

const ColorServices = {
  getAllColors: async () => {
    const response = await requests.get("/color");
    return response._embedded.color; // Trả về mảng color từ _embedded.color
  },
};

export default ColorServices; 