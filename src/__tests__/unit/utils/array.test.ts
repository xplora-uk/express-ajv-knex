import { expect } from 'chai';
import { filterColumnNames } from '../../../utils/array';

describe('utils/array', () => {
  describe('filterColumnNames', () => {

    it('should return column names when no exclusion', () => {
      const columnNames = ['a', 'b', 'c'];
      const result = filterColumnNames(columnNames, []);
      expect(result).to.equal(columnNames);
    });

    it('should filter column names when there is exclusion', () => {
      const columnNames = ['a', 'b', 'c'];
      const result = filterColumnNames(columnNames, ['c']);
      expect(result.includes('a')).to.equal(true);
      expect(result.includes('b')).to.equal(true);
      expect(result.includes('c')).to.equal(false);
    });

  });
});
