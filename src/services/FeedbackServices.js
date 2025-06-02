import requests from "./httpService";

const FeedbackServices = {
    getAllFeedbacks: async ({ page, size, rating, userEmail, cancelToken }) => {
        // Build query parameters
        const params = new URLSearchParams();

        // Add pagination parameters
        if (page) params.append('page', page);
        if (size) params.append('size', size);

        // Add optional filter parameters
        if (rating) params.append('rating', rating);
        if (userEmail) params.append('userEmail', userEmail);

        return requests.get(
            `/feedback/all?${params.toString()}`,
            { cancelToken }
        );
    },

    getFeedbackById: async (id) => {
        return requests.get(`/feedback/${id}`);
    },

    deleteFeedback: async (id) => {
        return requests.delete(`/feedback/${id}`);
    }
};

export default FeedbackServices; 