const { BasicController } = require('../../lib/express');
const { BasicDbRepo } = require('../../lib/knex');

async function initPets(db, logger) {

  await db.dbRw.schema.createTable('Pet', (table) => {
    table.uuid('id').primary();
    table.timestamp('createdAtUtc', { useTz: true }).defaultTo(db.dbRw.fn.now());
    table.timestamp('updatedAtUtc', { useTz: true }).defaultTo(db.dbRw.fn.now());
    table.string('name').nullable();
    table.json('category').nullable();
    table.json('photoUrls').nullable();
    table.json('tags').nullable();
    table.string('status').nullable();
  });

  class PetRepo extends BasicDbRepo {
    columnNames = ['id', 'name', 'category', 'photoUrls', 'tags', 'status'];

    constructor(db) {
      super(db, 'Pet');
    }
  }

  class PetController extends BasicController {
    constructor(repo, logger, idParamPlaceHolder = 'petId') {
      super(repo, logger);
      this.idParamPlaceHolder = idParamPlaceHolder;
    }
  }

  const petRepo = new PetRepo(db);
  const petController = new PetController(petRepo, logger);

  return {
    petRepo,
    petController,
  };
}

module.exports = { initPets };
