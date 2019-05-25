## 定时备份数据库至阿里云 OSS

## 特性

- 多数据库热备份
- cron 定时任务
- 备份文件自动压缩并命名
- 自动上传至阿里云 OSS
- 本地日志文件支持

## 安装

- `npm install` 安装依赖
- `npm start` 开发模式
- `npm run build` 打包部署
- `npm run server` 启动服务

## 配置

### 备份配置

`src/config.js`

```js
connection: {
    host: 'localhost',
    user: 'root',
    password: '',
},
oss: {
  accessKeyId: '',
  accessKeySecret: '',
  region: '',
  bucket: '',
},
dbNames: ['db1', 'db2', 'db3'], // 需要备份的数据库名称
cronStr: '00 30 5 * * *', // 定时任务 https://www.npmjs.com/package/node-cron#allowed-fields
```
