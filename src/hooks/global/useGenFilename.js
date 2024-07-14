export function genFilename (val) {

  const urlObj = new URL(val);
  return decodeURIComponent(urlObj.pathname.substring(urlObj.pathname.lastIndexOf("/") + 1));

}
