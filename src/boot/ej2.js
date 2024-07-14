import { boot } from "quasar/wrappers";
import { registerLicense } from "@syncfusion/ej2-base";

export default boot(() => {
  const key = process.env.EJ2_KEY;
  registerLicense(key);
});
