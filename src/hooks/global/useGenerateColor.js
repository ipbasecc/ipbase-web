export function genColor (email) {
// 将邮箱地址转换为小写字母
const emailLowerCase = email.toLowerCase();

// 计算邮箱地址的哈希值
const emailHash = emailLowerCase.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

// 使用哈希值来生成颜色代码
const colorCode = `#${emailHash.toString(16).slice(0, 6)}`;

return colorCode;
}
