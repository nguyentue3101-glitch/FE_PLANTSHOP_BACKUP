import { deleteUsers } from "@/api/user/deleted"
import { getAllUser, getAllUserDeleted, getInfoUser } from "@/api/user/get"
import { updateInfoUser, restoreUser } from "@/api/user/put"
import { defineStore } from "pinia"
import { ref } from "vue"

export const useUserStore = defineStore("user", () => {
  const userInfo = ref(null)
  const updateInfo = ref(null)
  const allUsers = ref(null)
  const allDeleted = ref(null)

  const getAllUsers = async (token) => {
    try {
      const response = await getAllUser(token)
      if (response.success) {
        allUsers.value = response.data
      }
    } catch (error) {
     console.error(error)
     throw error
    }
  }
  const getAllDeleted = async(token) =>{
    try {
      const response = await getAllUserDeleted(token)
      if(response.success){
        allDeleted.value = response.data
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const getInfo = async (token) => {
    try {
      const response = await getInfoUser(token)
      if (response.success) {
        userInfo.value = response.data
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const updateInfoUsers = async (token, userId, userData) => {
    try {
      const response = await updateInfoUser(token, userId, userData)
      if (response.success) {
        userInfo.value = { ...userInfo.value}
      }
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

   const deleteUser = async (userId, token) => {
          try {
              const response = await deleteUsers(userId, token)
              return response
          } catch (error) {
              console.error(error)
              throw error
          }
      }

  const restoreUserStore = async (userId, token) => {
    try {
      const response = await restoreUser(token, userId)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  return { allUsers, allDeleted ,updateInfo, userInfo,deleteUser, restoreUserStore, getAllUsers, getAllDeleted, getInfo, updateInfoUsers }
})
