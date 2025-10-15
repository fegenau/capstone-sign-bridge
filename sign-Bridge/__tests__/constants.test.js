// __tests__/constants.test.js
import { ALPHABET } from '../utils/constants/alphabet';

describe('Constants', () => {
  describe('ALPHABET', () => {
    it('should contain 26 letters', () => {
      expect(ALPHABET).toHaveLength(26);
    });

    it('should contain letters A-Z', () => {
      const expectedLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      expect(ALPHABET).toEqual(expectedLetters);
    });

    it('should not contain duplicates', () => {
      const uniqueLetters = [...new Set(ALPHABET)];
      expect(uniqueLetters).toHaveLength(ALPHABET.length);
    });

    it('should be in alphabetical order', () => {
      const sorted = [...ALPHABET].sort();
      expect(ALPHABET).toEqual(sorted);
    });
  });
});
