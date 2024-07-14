<template>
    <q-btn dense flat padding="xs" @click="uploadFiles">
        <q-icon size="xs" name="attach_file" />
    </q-btn>
</template>
  
<script setup>
import { ref, toRef } from "vue";
import axios from "axios";

const props = defineProps({
    channel_id: {
        type: String,
        default() { return {} }
    }
})

const emit = defineEmits(['fileUploaded','onUploadProgress'])

const channel_idRef = toRef(props, "channel_id");
const response = ref(null);

const fileInput = ref(null);
const uploadFiles = () => {
    const token = localStorage.getItem('mmtoken');
    // 如果文件选择器不存在，就创建一个
    if (!fileInput.value) {
        fileInput.value = document.createElement('input')
        fileInput.value.type = 'file'
        fileInput.value.multiple = true
        fileInput.value.style.display = 'none'
        document.body.appendChild(fileInput.value)
    }

  // 监听文件选择器的变化事件
  fileInput.value.onchange = (e) => {
    // 获取选择的文件列表
    const files = e.target.files
    // 遍历文件列表，上传每个文件
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // 创建一个表单数据对象，添加文件
      const formData = new FormData()
      formData.append("channel_id", channel_idRef.value);
      formData.append('file', file)
      // 使用axios发送post请求，上传文件
      axios
      .post(`${process.env.MM_API}files`, formData, {
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
            },
            onUploadProgress: function(progressEvent) {
              let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(percentCompleted);
              emit('onUploadProgress', percentCompleted)
            },
      })
      .then((res) => {
          response.value = res.data;
          emit('fileUploaded',res.data);
          console.log('传递上传文件信息');
      })
      .catch((err) => {
          console.error(err);
      });
    }
  }

  // 触发文件选择器的点击事件
  fileInput.value.click()
}
</script>
  