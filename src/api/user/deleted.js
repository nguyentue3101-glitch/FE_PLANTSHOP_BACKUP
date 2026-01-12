import apiClient from "../axios";

export const deleteUsers = async (userId, token) => {
  const response = await apiClient.delete(`/api/user/delete/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  return response
}
