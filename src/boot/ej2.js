import { boot } from "quasar/wrappers";
import { registerLicense } from "@syncfusion/ej2-base";

export default boot(() => {
  const key = import.meta.env.VITE_EJ2_KEY;
  registerLicense(key);
});
