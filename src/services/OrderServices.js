import requests from "./httpService";

const OrderServices = {
  getAllOrders: async ({
    body,
    headers,
    customerName,
    status,
    page = 1,
    limit = 8,
    day,
    // source,
    method,
    startDate,
    endDate,
    // download = "",
  }) => {
    const searchName = customerName !== null ? customerName : "";
    const searchStatus = status !== null ? status : "";
    const searchDay = day !== null ? day : "";
    // const searchSource = source !== null ? source : "";
    const searchMethod = method !== null ? method : "";
    const startD = startDate !== null ? startDate : "";
    const endD = endDate !== null ? endDate : "";

    return requests.get(
      `/orders?customerName=${searchName}&status=${searchStatus}&day=${searchDay}&page=${page}&limit=${limit}&startDate=${startD}&endDate=${endD}&method=${searchMethod}`,
      body,
      headers
    );
  },

  getAdminOrders: async (params) => {
    // Create query parameters from filters
    const queryParams = new URLSearchParams();

    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.size) queryParams.append('size', params.size);

    // Add optional filter parameters if they exist
    if (params.orderId) queryParams.append('orderId', params.orderId);
    if (params.orderStatusCode) queryParams.append('orderStatusCode', params.orderStatusCode);
    if (params.paymentMethodCode) queryParams.append('paymentMethodCode', params.paymentMethodCode);
    if (params.shippingMethodCode) queryParams.append('shippingMethodCode', params.shippingMethodCode);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    return requests.get(`/admin/orders?${queryParams.toString()}`);
  },

  getAllOrdersTwo: async ({ invoice, body, headers }) => {
    const searchInvoice = invoice !== null ? invoice : "";
    return requests.get(`/orders/all?invoice=${searchInvoice}`, body, headers);
  },

  getRecentOrders: async ({
    page = 1,
    limit = 8,
    startDate = "1:00",
    endDate = "23:59",
  }) => {
    return requests.get(
      `/orders/recent?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`
    );
  },

  getOrderCustomer: async (id, body) => {
    return requests.get(`/orders/customer/${id}`, body);
  },

  getUserOrders: async (userId) => {
    return requests.get(`/orders/user/${userId}`);
  },

  getOrderById: async (id, body) => {
    return requests.get(`/orders/${id}`, body);
  },

  updateOrder: async (id, body, headers) => {
    return requests.put(`/orders/${id}`, body, headers);
  },

  updateOrderStatus: async (id, statusCode, cancelReason) => {
    let url = `/orders/${id}/update-status?statusCode=${statusCode}`;
    if (statusCode === "CANCELLED" && cancelReason) {
      url += `&cancelReason=${encodeURIComponent(cancelReason)}`;
    }
    return requests.post(url);
  },

  deleteOrder: async (id) => {
    return requests.delete(`/orders/${id}`);
  },

  getDashboardOrdersData: async ({
    page = 1,
    limit = 8,
    endDate = "23:59",
  }) => {
    return requests.get(
      `/orders/dashboard?page=${page}&limit=${limit}&endDate=${endDate}`
    );
  },

  getDashboardAmount: async () => {
    return requests.get("/orders/dashboard-amount");
  },

  getDashboardCount: async () => {
    return requests.get("/orders/dashboard-count");
  },

  getDashboardRecentOrder: async ({ page = 1, limit = 8 }) => {
    return requests.get(
      `/orders/dashboard-recent-order?page=${page}&limit=${limit}`
    );
  },

  getBestSellerProductChart: async () => {
    return requests.get("/orders/best-seller/chart");
  },

  getOrderStatus: async () => {
    return requests.get("/orderStatus");
  },

  //for sending email invoice to customer
  sendEmailInvoiceToCustomer: async (body) => {
    return requests.post("/order/customer/invoice", body);
  },

  getPaymentMethods: async () => {
    return requests.get("/paymentMethod");
  },

  getShippingMethods: async () => {
    return requests.get("/shippingMethod");
  },

  getOrderStatuses: async () => {
    return requests.get("/orderStatus");
  },
};

export default OrderServices;
