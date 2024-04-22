// JSON Schemas to help with definition of the inputs of your API and validation

// @see ./src/knex/BasicDbRepo.whereAdapter()

export const jsonSchemaForSearchCriterion = {
  type: 'object',
  required: ['k'],
  properties: {
    k: {
      type: 'string',
      description: 'Name of key/column/field/attribute/property',
      nullable: false,
      minLength: 1,
    },
    o: {
      type: 'string',
      description: 'Operation',
      enum: [
        '$eq',
        '$neq',
        '$gt',
        '$gte',
        '$lt',
        '$lte',
        '$nil',
        '$nnil',
        '$like',
        '$ilike',
        '$in',
        '$nin',
      ],
      default: '$eq',
      nullable: false,
    },
    v: {
      type: 'string',
      description: 'Value to check key using operation',
      nullable: false,
      minLength: 1,
    },
    vlist: {
      type: 'array',
      description: 'List of values to check key using operation if it is $in or $nin',
      items: {
        type: 'string',
        nullable: false,
        minLength: 1,
      },
    },
  },
};

export const jsonSchemaForSearchParams = {
  type: 'object',
  // all properties are optional and all (leaf) values are string as they are use in URL query string
  properties: {
    columns: {
      type: 'array',
      description: 'List of names of columns/keys',
      items: {
        type: 'string',
        nullable: false,
        minLength: 1,
      },
      nullable: false,
    },
    limit: {
      type: 'string',
      pattern: '^[0-9]+$',
      default: '100',
      example: '100',
      nullable: false,
      minLength: 1,
    },
    offset: {
      type: 'string',
      pattern: '^[0-9]+$',
      default: '0',
      example: '0',
      nullable: false,
      minLength: 1,
    },
    criteria: {
      type: 'array',
      items: jsonSchemaForSearchCriterion,
      nullable: false,
    },
    orderBy: {
      type: 'string',
      description: 'Name of the column/key to order records by',
      default: 'id',
      nullable: false,
      minLength: 1,
    },
    orderDir: {
      type: 'string',
      description: 'Direction of sorting/ordering records: in ascending order or descending order',
      enum: ['asc', 'desc'],
      nullable: false,
    },
  },
};

export const jsonSchemas = {
  searchParams: jsonSchemaForSearchParams,
};
