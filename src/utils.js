import log4js from 'log4js';

log4js.configure({
  appenders: {
    console: {
      type: 'stdout',
    },
    info: {
      type: 'file',
      filename: 'logs/info.log',
      maxLogSize: 1024 * 1024,
      backups: 3,
      keepFileExt: true,
    },
  },
  categories: {
    default: {
      appenders: ['console'],
      level: 'info',
    },
    info: {
      appenders: ['console', 'info'],
      level: 'info',
    },
  },
});
const logger = log4js.getLogger('info');

const getDateStr = () => {
  const date = new Date();
  const year = date.getFullYear();
  const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
  const dayStr = date
    .getDate()
    .toString()
    .padStart(2, '0');
  const secOfday = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
  return `${year}${monthStr}${dayStr}_${secOfday}`;
};

export { logger, getDateStr };
