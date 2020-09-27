import path from 'path';
import fse from 'fs-extra';
import JSON5 from 'json5';
import { merge } from 'lodash';

export const dataDir = path.resolve(__dirname, '../data');
fse.ensureDirSync(dataDir);

const CFG_FILE_PATH = path.join(dataDir, 'config.json5');

const defaultConfig = {
  connection: {
    host: 'localhost',
    user: 'root',
    password: 'root',
  },
  oss: {
    accessKeyId: '',
    accessKeySecret: '',
    region: '',
    bucket: '',
  },
  dbNames: [],
  cronStr: '00 30 5 * * *',
};

if (!fse.pathExistsSync(CFG_FILE_PATH)) {
  fse.writeFileSync(CFG_FILE_PATH, JSON5.stringify(defaultConfig, undefined, 2));
}

const userConfig = JSON5.parse(fse.readFileSync(CFG_FILE_PATH).toString());
const config = merge(defaultConfig, userConfig);

export default config;
