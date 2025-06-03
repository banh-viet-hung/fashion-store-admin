import requests from "./httpService";

const BannerServices = {
    getAllBanners: async () => {
        try {
            const response = await requests.get('/banners');
            console.log('Raw API response:', response);
            return response;
        } catch (error) {
            console.error('Error in getAllBanners:', error);
            throw error;
        }
    },

    getBannerById: async (id) => {
        try {
            const response = await requests.get(`/banners/${id}`);
            return response;
        } catch (error) {
            console.error('Error in getBannerById:', error);
            throw error;
        }
    },

    addBanner: async (body) => {
        try {
            const response = await requests.post('/banners', body);
            return response;
        } catch (error) {
            console.error('Error in addBanner:', error);
            throw error;
        }
    },

    updateBanner: async (id, body) => {
        try {
            const response = await requests.put(`/banners/${id}`, body);
            return response;
        } catch (error) {
            console.error('Error in updateBanner:', error);
            throw error;
        }
    },

    deleteBanner: async (id) => {
        try {
            const response = await requests.delete(`/banners/${id}`);
            return response;
        } catch (error) {
            console.error('Error in deleteBanner:', error);
            throw error;
        }
    },

    toggleActiveBanner: async (id) => {
        try {
            const response = await requests.put(`/banners/${id}/toggle-active`);
            return response;
        } catch (error) {
            console.error('Error in toggleActiveBanner:', error);
            throw error;
        }
    },
};

export default BannerServices; 