<template>
    <div class="q-pa-md">
      <q-file
        v-model="file"
        label="选择一个文件"
        outlined
        @update:model-value="startUpload"
      />
      <div v-if="uploadId" class="q-mt-md">
        <p>您正在上传的文件的ID为：<strong>{{ uploadId }}</strong></p>
        <q-linear-progress
          :value="progress"
          color="primary"
          buffer-value="87"
        ></q-linear-progress>
        <p>上传进度：<strong>{{ progress }}%</strong></p>
      </div>
      <div v-if="response" class="q-mt-md">
        <p>您上传的文件的响应为：</p>
        <pre>{{ response }}</pre>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  export default {
    data() {
      return {
        file: null,
        uploadId: null,
        progress: 0,
        response: null,
      };
    },
    methods: {
      startUpload() {
        if (this.file) {
          let formData = new FormData();
          formData.append("channel_id", "your_channel_id");
          formData.append("filename", this.file.name);
          axios
            .post("https://your-mattermost-url.com/api/v4/uploads", formData, {
              headers: {
                Authorization: "Bearer your_access_token",
                "Content-Type": "multipart/form-data",
              },
            })
            .then((res) => {
              this.uploadId = res.data.id;
              this.uploadChunks();
            })
            .catch((err) => {
              console.error(err);
            });
        } else {
          this.uploadId = null;
          this.progress = 0;
          this.response = null;
        }
      },
      uploadChunks() {
        let chunkSize = 5 * 1024 * 1024; // 5MB
        let totalChunks = Math.ceil(this.file.size / chunkSize);
        let promises = [];
        for (let i = 0; i < totalChunks; i++) {
          let start = i * chunkSize;
          let end = Math.min(start + chunkSize, this.file.size);
          let chunk = this.file.slice(start, end);
          let formData = new FormData();
          formData.append("files", chunk);
          promises.push(
            axios.post(
              `https://your-mattermost-url.com/api/v4/uploads/${this.uploadId}/chunks?offset=${start}`,
              formData,
              {
                headers: {
                  Authorization: "Bearer your_access_token",
                  "Content-Type": "multipart/form-data",
                },
              }
            )
          );
        }
        axios
          .all(promises)
          .then((res) => {
            this.progress = 100;
            this.commitUpload();
          })
          .catch((err) => {
            console.error(err);
          });
      },
      commitUpload() {
        axios
          .post(
            `https://your-mattermost-url.com/api/v4/uploads/${this.uploadId}/commit`,
            {},
            {
              headers: {
                Authorization: "Bearer your_access_token",
              },
            }
          )
          .then((res) => {
            this.response = res.data;
          })
          .catch((err) => {
            console.error(err);
          });
      },
    },
  };
  </script>
  