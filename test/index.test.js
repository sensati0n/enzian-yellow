const assert = require('assert');

describe('The module toUpperCase', () => {
  it('should transform my test string', () => {
    assert.strictEqual('test'.toUpperCase(), 'TEST');
  });
});