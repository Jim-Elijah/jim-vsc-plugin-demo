import { add, asyncAdd } from '../util';
import { after, before, it, describe, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai'

describe('test add', () => {
  it('Sum 2 and 3', function() {
    console.log('this', this);
    expect(add(2, 3)).to.be.equal(5);
  });

  it('Sum 3 and 3', () => {
    expect(add(3, 3)).to.be.equal(6);
  });
});


describe('test async add', () => {
  it('Sum 2 and 3 with done', (done) => {
    console.log('this', this);
    asyncAdd(2, 3).then((res) => {
      expect(res).to.be.equal(5);
      done()
    })
  });

  it('Sum 3 and 3 with async', async () => {
    const res = await asyncAdd(3, 3)
    expect(res).to.be.equal(6);
  });
});