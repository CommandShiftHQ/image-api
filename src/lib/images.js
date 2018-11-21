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

const toBuffer = data => new Promise((resolve, reject) => {
  data.stream((err, stdout, stderr) => {
    if (err) {
      reject(err);
    } else {
      const chunks = [];
      stdout.on('data', chunk => chunks.push(chunk));
      stdout.once('end', () => resolve(Buffer.concat(chunks)));
      stderr.once('data', d => reject(String(d)));
    }
  });
});

exports.upload = (file, owner, type = 'main') => new Promise((resolve, reject) => {
  const key = getKey(owner, paths[type], extension(file.originalname));
  const stream = gm(file.buffer, file.originalname)
    .resize(...dimensions[type]);

  console.log(1, stream);

  toBuffer(2, stream)
    .then((data) => {
      console.log(data);
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
    .catch(err => reject(err));
});
