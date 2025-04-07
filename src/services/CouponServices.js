import requests from './httpService';

const CouponServices = {
  addCoupon: async (body) => {
    return requests.post('/coupons', body);
  },
  addAllCoupon: async (body) => {
    return requests.post('/coupon/add/all', body);
  },
  getAllCoupons: async () => {
    // For testing/development purposes, return mock data that matches the required format
    // Remove this when connecting to a real backend
    // const mockData = {
    //   message: "Lấy danh sách mã giảm giá thành công",
    //   success: true,
    //   data: [
    //     {
    //       id: 1,
    //       code: "SUMMER2023",
    //       description: "Giảm giá mùa hè",
    //       discountType: "PERCENT",
    //       discountValue: 10.0,
    //       startDate: "2023-06-01T00:00:00",
    //       endDate: "2023-08-31T23:59:59",
    //       usageLimit: 100,
    //       usedCount: 45,
    //       minOrderValue: 300000.0
    //     },
    //     {
    //       id: 2,
    //       code: "NEWYEAR",
    //       description: "Khuyến mãi năm mới",
    //       discountType: "FIXED",
    //       discountValue: 100000.0,
    //       startDate: "2024-01-01T00:00:00",
    //       endDate: "2024-01-31T23:59:59",
    //       usageLimit: 50,
    //       usedCount: 0,
    //       minOrderValue: 500000.0
    //     },
    //     {
    //       id: 3,
    //       code: "WELCOME10",
    //       description: "Chào mừng khách hàng mới",
    //       discountType: "PERCENT",
    //       discountValue: 10.0,
    //       startDate: "2023-01-01T00:00:00",
    //       endDate: "2024-12-31T23:59:59",
    //       usageLimit: 1000,
    //       usedCount: 350,
    //       minOrderValue: 100000.0
    //     },
    //     {
    //       id: 4,
    //       code: "FREESHIP",
    //       description: "Miễn phí vận chuyển",
    //       discountType: "FIXED",
    //       discountValue: 50000.0,
    //       startDate: "2023-01-01T00:00:00",
    //       endDate: "2024-12-31T23:59:59",
    //       usageLimit: 500,
    //       usedCount: 120,
    //       minOrderValue: 200000.0
    //     }
    //   ]
    // };
    
    // return Promise.resolve(mockData);
    
    // When connecting to real backend, uncomment this:
    return requests.get('/coupons');
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
    return requests.delete(`/coupon/${id}`);
  },
  deleteManyCoupons: async (body) => {
    return requests.patch(`/coupon/delete/many`, body);
  },
};

export default CouponServices;
