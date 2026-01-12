import apiClient from "../axios";

export const deleteDiscounts = async (discountId, token) => {
  const response = await apiClient.delete(`/api/discount/delete/${discountId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  return response
}
