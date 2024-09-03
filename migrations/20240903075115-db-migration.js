'use strict';
require('dotenv').config();

var dbm;
var type;
var seed;

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('users', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    login: { type: 'string', notNull: true, unique: true },
    password: { type: 'string', notNull: true },
    created_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') }
  })
  .then(function() {
    return db.createTable('messages', {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      user_id: { type: 'int', notNull: true, foreignKey: { name: 'messages_user_id_fk', table: 'users', rules: { onDelete: 'CASCADE' }, mapping: 'id' } },
      type: { type: 'string', notNull: true, length: 50 },
      content: { type: 'text' },
      file_path: { type: 'string', length: 255 },
      created_at: { type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') }
    });
  })
  .then(function() {
    return db.addIndex('users', 'users_login_idx', ['login']);
  })
  .then(function() {
    return db.addIndex('messages', 'messages_user_id_idx', ['user_id']);
  });
};

exports.down = function(db) {
  return db.dropTable('messages')
    .then(function() {
      return db.dropTable('users');
    });
};

exports._meta = {
  "version": 1
};
