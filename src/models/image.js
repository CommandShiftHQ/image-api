const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  user: { type: String, index: { sparse: true } },
  src: String,
  thumb: String,
  caption: String,
  tags: {
    type: [String],
    index: { sparse: true },
  },
  likedBy: {
    type: [String],
  },
}, { timestamps: true });

imageSchema.static('findByUser', function findByUser(user) {
  return this.find({ user });
});

imageSchema.static('findByTags', function findByTags(tags) {
  return this.find({ tags: { $in: tags } });
});

imageSchema.virtual('likes').get(function likes() {
  return this.likedBy.length;
});

imageSchema.method('isLikedBy', function isLikedBy(user) {
  return this.likedBy.includes(user);
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
