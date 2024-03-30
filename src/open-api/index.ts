import ajv from '../ajv';

export function makeJsonSchemaValidator(openApiDoc: any, schemaName: string) {
  const jsonSchema = {
    ...openApiDoc.components.schemas[schemaName],
    $defs: openApiDoc.components.schemas,
  };
  return ajv.compile(jsonSchema);
}

function reviver(key: string, value: string): any {
  return (key === '$ref' ? value.replace('#/components/schemas/', '#/$defs/') : value)
}

export function changeRefsToDefs<T>(openApiDoc: any): T {
  return JSON.parse(JSON.stringify(openApiDoc), reviver) as T;
}
