import apiClient from "../axios";

// Xóa đánh giá
export const deleteReview = async (reviewId, token) => {
    const response = await apiClient.delete(`/api/reviews/${reviewId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}

