const {PENDING} = require('../../shared/constants/statuses');

exports.up = db =>
  db.schema
    .raw('CREATE EXTENSION IF NOT EXISTS citext')
    .createTable('envs', t => {
      t.increments('id').primary();
      t.string('name').notNullable().unique();
      t.json('config').notNullable();
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
    })

    .createTable('permissions', t => {
      t.integer('envId').notNullable().references('envs.id').onUpdate('CASCADE').onDelete('CASCADE');
      t.string('userId').notNullable();
      t.integer('role').notNullable();
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
      t.primary(['envId', 'userId']);
    })

    .createTable('builds', t => {
      t.increments('id').primary();
      t.integer('envId').notNullable().references('envs.id').onUpdate('CASCADE').onDelete('CASCADE').index();
      t.string('sourceId').notNullable();
      t.json('buildArgs');
      t.string('context');
      t.string('dockerfile');
      t.specificType('ref', 'citext').notNullable().index();
      t.specificType('repo', 'citext').notNullable().index();
      t.specificType('sha', 'citext').notNullable().index();
      t.jsonb('tags').notNullable().index();
      t.string('status').notNullable().defaultTo(PENDING);
      t.string('error');
      t.json('meta');
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
    })

    .createTable('logLines', t => {
      t.integer('buildId').notNullable().references('builds.id').onUpdate('CASCADE').onDelete('CASCADE');
      t.integer('index').notNullable();
      t.json('content').notNullable();
      t.timestamp('createdAt').notNullable().defaultTo(db.fn.now());
      t.timestamp('updatedAt').notNullable().defaultTo(db.fn.now());
      t.primary(['buildId', 'index']);
    });

exports.down = ({schema}) =>
  schema
    .dropTable('logLines')
    .dropTable('builds')
    .dropTable('permissions')
    .dropTable('envs');
