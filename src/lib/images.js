const AWS = require('aws-sdk');
const gm = require('gm').subClass({ imageMagick: true });
const moment = require('moment');
const uuid = require('uuid/v4');

const s3 = new AWS.S3();

const extension = filename => /(?:\.([^.]+))?$/.exec(filename)[0];
const getKey = (owner, type, ext) => `${owner}/${type}/${moment().format('DDMMYYYY')}/${uuid()}${ext}`;
const link = path => `https://s3-eu-west-1.amazonaws.com/${process.env.S3_BUCKET_NAME}/${path}`;

const paths = {
  thumbnail: 'thumbnails',
  main: 'images',
  avatar: 'avatars',
};

const dimensions = {
  thumbnail: [300, 300],
  main: [640],
  avatar: [640],
};

exports.upload = (file, owner, type = 'main') => new Promise((resolve, reject) => {
  const key = getKey(owner, paths[type], extension(file.originalname));

  gm(file.buffer, file.originalname)
    .resize(...dimensions[type])
    .stream((err, stdout, stderr) => new Promise((res, rej) => {
      if (err) {
        rej(err);
      } else {
        const chunks = [];
        stdout.on('data', chunk => chunks.push(chunk));
        stdout.once('end', () => res(Buffer.concat(chunks)));
        stderr.once('data', d => rej(String(d)));
      }
    })
      .then((data) => {
        s3.putObject({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          Body: data,
        }, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(link(key));
          }
        });
      })
      .catch(e => reject(e)));
});
