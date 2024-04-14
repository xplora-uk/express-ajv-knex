const { BasicController } = require('../../lib/express');
const { BasicDbRepo } = require('../../lib/knex');

async function initUsers(db, logger) {
  await db.dbRw.schema.createTable('User', (table) => {
    table.uuid('id').primary();
    table.timestamp('createdAtUtc', { useTz: true }).defaultTo(db.dbRw.fn.now());
    table.timestamp('updatedAtUtc', { useTz: true }).defaultTo(db.dbRw.fn.now());
    table.string('name');
    table.string('firstName');
    table.string('lastName');
    table.string('email');
    table.string('password');
    table.string('phone');
    table.integer('userStatus');
  });

  class UserRepo extends BasicDbRepo {
    columnNames = ['id', 'name', 'firstName', 'lastName', 'email', 'password', 'phone', 'userStatus'];
    columnNamesNoSelect = ['password'];
    constructor(db) {
      super(db, 'User');
    }
  }

  class UserController extends BasicController {
    constructor(repo, logger) {
      super(repo, logger);
    }
  }

  return {
    userRepo: new UserRepo(db),
    userController: new UserController(new UserRepo(db), logger),
  }
}

module.exports = { initUsers };
