import OSS from 'ali-oss';
import config from './config';

const client = new OSS(config.oss);

const uploadFile = async (filePath, key) => {
  const result = await client.put(key, filePath);
  return result && result.res;
};

export { uploadFile };
