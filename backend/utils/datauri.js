import DataUriParser from "datauri/parser.js";
import path from "path";

const parser = new DataUriParser(); // create once (better)

const getDataUri = (file) => {
  if (!file || !file.buffer) return null; // ✅ strong safety check

  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};

export default getDataUri;
