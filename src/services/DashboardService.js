import requests from "./httpService";

class DashboardService {
    // Get dashboard summary statistics
    getDashboardSummary = async () => {
        return requests.get("/dashboard/statistics/summary");
    };

    // Get revenue statistics by period
    getRevenueStatistics = async (startDate, endDate, period = "day") => {
        return requests.get(
            `/dashboard/sales/revenue?startDate=${startDate}&endDate=${endDate}&period=${period}`
        );
    };

    // Get orders by status
    getOrdersByStatus = async (startDate, endDate) => {
        let url = "/dashboard/orders/by-status";
        if (startDate && endDate) {
            url = `${url}?startDate=${startDate}&endDate=${endDate}`;
        }
        return requests.get(url);
    };

    // Get top selling products
    getTopSellingProducts = async (limit = 10, startDate, endDate) => {
        let url = `/dashboard/sales/top-products?limit=${limit}`;
        if (startDate && endDate) {
            url = `${url}&startDate=${startDate}&endDate=${endDate}`;
        }
        return requests.get(url);
    };

    // Get inventory statistics
    getInventoryStatistics = async (limit = 10, sortBy = "quantity_asc") => {
        return requests.get(`/dashboard/inventory/stock?limit=${limit}&sortBy=${sortBy}`);
    };

    // Get sales by category
    getSalesByCategory = async (startDate, endDate) => {
        let url = "/dashboard/sales/by-category";
        if (startDate && endDate) {
            url = `${url}?startDate=${startDate}&endDate=${endDate}`;
        }
        return requests.get(url);
    };

    // Get order trends
    getOrderTrends = async (startDate, endDate, period = "day") => {
        return requests.get(
            `/dashboard/orders/trend?startDate=${startDate}&endDate=${endDate}&period=${period}`
        );
    };
}

export default new DashboardService(); 