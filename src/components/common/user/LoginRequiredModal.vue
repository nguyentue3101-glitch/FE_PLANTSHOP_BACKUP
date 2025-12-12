<template>
    <Teleport to="body">
        <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50 " @click.self="handleClose">
            <div class="bg-white rounded-lg shadow-xl p-6 w-96 max-w-[90vw]">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">Yêu cầu đăng nhập</h3>
                    <button @click="handleClose" class="text-gray-500 hover:text-gray-700 cursor-pointer">
                        <X :size="24" />
                    </button>
                </div>
                <div class="mb-6">
                    <p class="text-gray-700">{{ message || 'Vui lòng đăng nhập để tiếp tục sử dụng tính năng này!' }}
                    </p>
                </div>
                <div class="flex justify-end space-x-4">
                    <button @click="handleClose"
                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                        Hủy
                    </button>
                    <button @click="handleConfirm"
                        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                        Đăng nhập
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { Teleport } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
    showModal: {
        type: Boolean,
        required: true
    },
    message: {
        type: String,
        default: 'Vui lòng đăng nhập để tiếp tục sử dụng tính năng này!'
    }
})

const emit = defineEmits(['close', 'confirm', 'update:showModal'])

const handleClose = () => {
    emit('close')
    emit('update:showModal', false)
}

const handleConfirm = () => {
    emit('confirm')
    emit('update:showModal', false)
}
</script>
