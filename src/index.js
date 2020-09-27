import fse from 'fs-extra';
import path from 'path';
import { CronJob } from 'cron';
import mysqldump from 'mysqldump';
import archiver from 'archiver';
import config, { dataDir } from './config';
import { uploadFile } from './oss';
import { logger, getDateStr } from './utils';

const TEMP_DIR = path.join(dataDir, 'temp');
const BACKUP_DIR = path.join(dataDir, 'backup');

const createSqlFiles = async (tempDir) => {
  const { host, user, password } = config.connection;
  const promises = config.dbNames.map(async (dbName) => {
    const fileName = `${dbName}.sql`;
    const filePath = path.join(tempDir, fileName);
    await mysqldump({
      connection: {
        host,
        user,
        password,
        database: dbName,
      },
      dumpToFile: filePath,
    });
    return { dbName, fileName, filePath };
  });
  return Promise.all(promises);
};

const zipFiles = (files, dir) =>
  new Promise((resolve, reject) => {
    const archive = archiver('zip');
    const fileName = `mysql_backup_${getDateStr()}.zip`;
    const filePath = path.join(dir, fileName);
    const zipFile = fse.createWriteStream(filePath);
    zipFile.on('close', () => {
      resolve({
        fileName,
        filePath,
        fileSize: archive.pointer(),
      });
    });
    zipFile.on('error', (err) => reject(err));
    archive.pipe(zipFile);
    files.forEach((item) => {
      archive.file(item.filePath, { name: item.fileName });
    });
    archive.finalize();
  });

const MAX_RETRY_COUNT = 3;
let retryCount = MAX_RETRY_COUNT;
const uploadToOSS = async (filePath, fileName) => {
  try {
    const result = await uploadFile(filePath, fileName);
    logger.info('upload to aliyun oss success');
    logger.info(`file info:\n${JSON.stringify(result, null, 2)}`);
  } catch (error) {
    if (retryCount > 0) {
      logger.error(`upload failed, retry after 10 seconds: ${error.stack}`);
      setTimeout(() => {
        retryCount--;
        logger.info(`retrying, ${retryCount} times remaining`);
        uploadToOSS(filePath, fileName);
      }, 10000);
    } else {
      logger.error(`upload failed: ${error.stack}`);
    }
  }
};

const execBackup = async () => {
  try {
    retryCount = MAX_RETRY_COUNT;
    await fse.ensureDir(BACKUP_DIR);
    await fse.emptyDir(TEMP_DIR);
    logger.info('starting backup');
    const sqlFiles = await createSqlFiles(TEMP_DIR);
    logger.info(`sql files backup completed: ${sqlFiles.map((o) => o.fileName).join(' ')}`);
    const { fileName, filePath, fileSize } = await zipFiles(sqlFiles, BACKUP_DIR);
    await fse.emptyDir(TEMP_DIR);
    logger.info(`archive completed: ${fileName} (${fileSize})`);
    await uploadToOSS(filePath, fileName);
  } catch (err) {
    logger.error(`backup failed: ${err.stack}`);
  }
};

execBackup();

new CronJob({
  cronTime: config.cronStr,
  onTick: execBackup,
  start: true,
  timeZone: 'Asia/Shanghai',
});
