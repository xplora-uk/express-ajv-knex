import { ILogger } from '@xplora-uk/logger';
import { BasicController } from '../../express';
import { BasicDb, BasicDbRepo } from '../../knex';

export async function initPets(db: BasicDb, logger: ILogger) {

  await db.dbRw.schema.createTable('Pet', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.json('category');
    table.json('photoUrls');
    table.json('tags');
    table.string('status');
  });

  class PetRepo extends BasicDbRepo {
    public idColumn                      = 'id';
    public createdAtColumn               = '';
    public updatedAtColumn               = '';
  
    public columnNames: string[]         = ['id', 'name', 'category', 'photoUrls', 'tags', 'status'];
    public columnNamesNoSelect: string[] = [];
    public columnNamesNoCreate: string[] = ['id'];
    public columnNamesNoUpdate: string[] = ['id'];

    constructor(db: BasicDb) {
      super(db, 'Pet');
    }
  }

  class PetController extends BasicController {
    idParamPlaceHolder = 'petId';
    constructor(public repo: PetRepo, public logger: ILogger) {
      super(repo, logger);
    }
  }

  const petRepo = new PetRepo(db);
  const petController = new PetController(petRepo, logger);

  return {
    petRepo,
    petController,
  };
}
