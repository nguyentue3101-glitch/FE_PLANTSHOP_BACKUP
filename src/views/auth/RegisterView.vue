<template>
  <div class="flex min-h-screen items-center justify-center" :style="{
    backgroundImage: 'url(/img/background_navbar.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }">
    <div class="flex w-[600px] h-auto shadow-lg rounded-2xl overflow-hidden">
      <div class="flex-1 bg-white p-6 relative item">
        <h2 class="text-black text-xl font-bold mb-4 text-center">ĐĂNG KÝ</h2>

        <RegisterForm :isLoading="isLoading" :errorMessage="errorMessage" @error="handleError" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAsyncOperation } from '@/composables/useAsyncOperation'
import RegisterForm from '@/components/auth/RegisterForm.vue'

const { isLoading, errorMessage } = useAsyncOperation()

const handleError = (errorMsg) => {
  errorMessage.value = errorMsg
}
</script>
