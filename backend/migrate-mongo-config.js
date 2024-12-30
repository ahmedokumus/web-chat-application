require('dotenv').config();

const config = {
  mongodb: {
    url: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  migrationsDir: __dirname + "/migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  useFileHash: false,
  moduleSystem: 'commonjs'
};

module.exports = config; 