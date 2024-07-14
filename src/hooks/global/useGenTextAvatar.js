export function genTextAvatar (name) {
    const char = name.charAt(0).toLocaleUpperCase()

    // 生成 color
    const colorCode = `#${char.charCodeAt(0).toString(16)}`;

    return {char, colorCode};
}
