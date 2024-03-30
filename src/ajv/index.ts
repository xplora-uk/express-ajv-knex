import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({
  // TODO: review, it complained about 'example' when strict: true
  strict: false,
});
addFormats(ajv);

export default ajv;
