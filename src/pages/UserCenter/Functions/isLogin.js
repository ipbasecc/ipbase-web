import { findMe } from "src/apollo/api/api.js";

const { loading, error, result } = findMe();

export default { loading, error, result };