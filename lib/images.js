const AWS = require('aws-sdk');
const gm = require('gm');

const s3 = new AWS.S3();

exports.createThumbnail = file => new Promise((resolve, reject) => {
  gm(file.buffer, file.originalname)
    .resize(300, 300)
    .toBuffer((err, buffer) => {
      if (err) {
        reject(err);
      } else {
        s3.putObject({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: 'user/images/date/uuid.png',
          Body: buffer,
        }, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(null);
          }
        });
      }
    });
});

exports.createMain = file => new Promise((resolve, reject) => {
  gm(file.buffer, file.originalname)
    .resize(640)
    .toBuffer((err, buffer) => {
      if (err) {
        reject(err);
      } else {
        s3.putObject({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: 'user/thumbnails/date/uuid.png',
          Body: buffer,
        }, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(null);
          }
        });
      }
    });
});
