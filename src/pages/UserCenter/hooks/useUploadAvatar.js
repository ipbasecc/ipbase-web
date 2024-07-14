import axios from "axios";
const token = localStorage.getItem("mmtoken");
const user_id = localStorage.getItem("mmUserId");
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "multipart/form-data",
};
export async function useUploadAvatar(files, updateProgress) {
  return new Promise((resolve, reject) => {
    // 创建一个FormData对象，用于存储用户头像图像文件
    const formData = new FormData();
    formData.append("image", files[0]);

    // 使用axios库发送HTTP请求
    axios
      .post(`${process.env.MM_API}users/${user_id}/image`, formData, {
        headers: headers,
      })
      .then((response) => {
        // 检查返回结果是否成功
        if (response.status === 200) {
          // 如果成功，解析Promise对象
          resolve(response);
        } else {
          // 如果失败，拒绝Promise对象，并传递错误信息
          reject(response.data.message);
        }
      })
      .catch((error) => {
        // 如果发生异常，拒绝Promise对象，并传递错误信息
        reject(error.message);
      });
  });
}
