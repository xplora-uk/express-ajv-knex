import { BasicController } from '../../express';
import { ILogger } from '@xplora-uk/logger';
import { BasicDb, BasicDbRepo } from '../../knex';

export async function initUsers(db: BasicDb, logger: ILogger) {
  await db.dbRw.schema.createTable('User', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('firstName');
    table.string('lastName');
    table.string('email');
    table.string('password');
    table.string('phone');
    table.integer('userStatus');
  });

  class UserRepo extends BasicDbRepo {
    public idColumn        = 'id';
    public createdAtColumn = '';
    public updatedAtColumn = '';

    public columnNames: string[]         = ['id', 'name', 'firstName', 'lastName', 'email', 'password', 'phone', 'userStatus'];
    public columnNamesNoSelect: string[] = ['password'];
    public columnNamesNoCreate: string[] = ['id'];
    public columnNamesNoUpdate: string[] = ['id'];
    constructor(db: BasicDb) {
      super(db, 'User');
    }
  }

  class UserController extends BasicController {
    constructor(public repo: UserRepo, public logger: ILogger) {
      super(repo, logger);
    }
  }

  return {
    userRepo: new UserRepo(db),
    userController: new UserController(new UserRepo(db), logger),
  }
}
