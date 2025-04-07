import requests from './httpService';

const CouponServices = {
  addCoupon: async (body) => {
    return requests.post('/coupons', body);
  },
  addAllCoupon: async (body) => {
    return requests.post('/coupon/add/all', body);
  },
  getAllCoupons: async (filters = {}) => {
    // When connecting to real backend, use query params
    const { page, size, code } = filters;
    
    // Build query string with filters
    let queryString = '';
    if (page !== undefined) queryString += `${queryString ? '&' : '?'}page=${page}`;
    if (size !== undefined) queryString += `${queryString ? '&' : '?'}size=${size}`;
    if (code) queryString += `${queryString ? '&' : '?'}code=${code}`;
    
    return requests.get(`/coupons${queryString}`);
  },
  getCouponById: async (id) => {
    return requests.get(`/coupons/${id}`);
  },
  updateCoupon: async (id, body) => {
    return requests.put(`/coupons/${id}`, body);
  },
  updateManyCoupons: async (body) => {
    return requests.patch('/coupon/update/many', body);
  },
  updateStatus: async (id, body) => {
    return requests.put(`/coupon/status/${id}`, body);
  },
  deleteCoupon: async (id) => {
    return requests.delete(`/coupons/${id}`);
  },
  deleteManyCoupons: async (ids) => {
    return requests.post('/coupons/delete-many', { ids });
  },
};

export default CouponServices;
