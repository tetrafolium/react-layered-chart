import * as _ from 'lodash';
import { expect } from 'chai';

import { Interval } from '../src/core/interfaces';
import {
  enforceIntervalBounds,
  enforceIntervalExtent,
  intervalExtent,
  extendInterval,
  roundInterval,
  mergeIntervals,
  intervalContains,
  panInterval,
  zoomInterval
} from '../src/core/intervalUtils';
import { TBySeriesId } from '../src/connected/interfaces';

function interval(min, max) {
  return { min, max };
}

describe('(interval utils)', () => {
  describe('enforceIntervalBounds', () => {
    const BOUNDS = interval(0, 10);

    const TEST_CASES = [
      {
        description: 'should do nothing if the interval is within bounds',
        input: interval(1, 9),
        output: interval(1, 9)
      }, {
        description: 'should slide the interval forward without changing extent if the interval is entirely before the early bound',
        input: interval(-3, -1),
        output: interval(0, 2)
      }, {
        description: 'should slide the interval forward  without changing extent if the interval starts before the early bound',
        input: interval(-1, 1),
        output: interval(0, 2)
      }, {
        description: 'should slide the interval back without changing extent if the interval ends after the later bound',
        input: interval(9, 11),
        output: interval(8, 10)
      }, {
        description: 'should slide the interval back without changing extent if the interval is entirely after the later bound',
        input: interval(11, 13),
        output: interval(8, 10)
      }, {
        description: 'should align the interval and bounds by their centers if the interval is longer than the bounds and extends on both ends',
        input: interval(-1, 13),
        output: interval(-2, 12)
      }, {
        description: 'should align the interval and bounds by their centers if the interval is longer than the bounds and starts before',
        input: interval(-10, 2),
        output: interval(-1, 11)
      }, {
        description: 'should align the interval and bounds by their centers if the interval is longer than the bounds and is entirely before',
        input: interval(-13, -1),
        output: interval(-1, 11)
      }, {
        description: 'should align the interval and bounds by their centers if the interval is longer than the bounds and ends after',
        input: interval(1, 13),
        output: interval(-1, 11)
      }, {
        description: 'should align the interval and bounds by their centers if the interval is longer than the bounds and is entirely after',
        input: interval(11, 23),
        output: interval(-1, 11)
      }, {
        description: 'should do nothing if the bounds are null',
        input: interval(0, 10),
        output: interval(0, 10)
      }
    ];

    TEST_CASES.forEach(test => {
      it(test.description, () => {
        expect(enforceIntervalBounds(test.input, BOUNDS)).to.deep.equal(test.output);
      });
    });

    it('should return the input interval by reference if no changes occured', () => {
      const input = interval(1, 9);
      const output = enforceIntervalBounds(input, BOUNDS);
      expect(output).to.equal(input);
    });

    it('should not mutate the input interval', () => {
      const input = interval(-1, 1);
      const output = enforceIntervalBounds(input, BOUNDS);
      expect(input).to.deep.equal(interval(-1, 1));
      expect(output).to.not.deep.equal(interval(-1, 1));
    });
  });

  describe('enforceIntervalExtent', () => {
    const TEST_CASES = [
      {
        description: 'should increase the endpoints symmetrically to match the minimum extent when the interval is too short',
        input: interval(1, 2),
        min: 5,
        max: 10,
        output: interval(-1, 4)
      }, {
        description: 'should do nothing if the interval is between the two extents',
        input: interval(1, 7),
        min: 5,
        max: 10,
        output: interval(1, 7)
      }, {
        description: 'should decrease the endpoints symmetrically to match the maximum extend when the interval is too long',
        input: interval(1, 15),
        min: 5,
        max: 10,
        output: interval(3, 13)
      }, {
        description: 'should not enforce a minimum if the min extent is null',
        input: interval(1, 2),
        min: null,
        max: 10,
        output: interval(1, 2)
      }, {
        description: 'should not enforce a minimum if the min extent is 0',
        input: interval(1, 2),
        min: 0,
        max: 10,
        output: interval(1, 2)
      }, {
        description: 'should not enforce a minimum if the min extent is negative',
        input: interval(1, 2),
        min: -10,
        max: 10,
        output: interval(1, 2)
      }, {
        description: 'should not enforce a maximum if the max extent is null',
        input: interval(1, 2),
        min: 0,
        max: null,
        output: interval(1, 2)
      }, {
        description: 'should return the midpoint of the interval if the max extent is 0',
        input: interval(1, 2),
        min: null,
        max: 0,
        output: interval(1.5, 1.5)
      }, {
        description: 'should not enforce a maximum if the max extent is Infinity',
        input: interval(1, 2),
        min: null,
        max: Infinity,
        output: interval(1, 2)
      }, {
        description: 'should do nothing if both the min and max extends are null',
        input: interval(1, 2),
        min: null,
        max: null,
        output: interval(1, 2)
      }
    ];

    TEST_CASES.forEach(test => {
      it(test.description, () => {
        expect(enforceIntervalExtent(test.input, test.min, test.max)).to.deep.equal(test.output);
      });
    });

    it('should return the input interval by reference if no changes occured', () => {
      const input = interval(0, 10);
      const output = enforceIntervalExtent(input, null, null);
      expect(output).to.equal(input);
    });

    it('should not mutate in the input interval', () => {
      const input = interval(0, 10);
      const output = enforceIntervalExtent(input, 1, 5);
      expect(input).to.deep.equal(interval(0, 10));
      expect(output).to.not.deep.equal(interval(0, 10));
    });
  });

  describe('intervalExtent', () => {
    it('should return the length of the interval', () => {
      expect(intervalExtent({ min: 0, max: 10 })).to.equal(10);
    });

    it('should return a negative length if the interval is backwards', () => {
      expect(intervalExtent({ min: 10, max: 0 })).to.equal(-10);
    });
  });

  describe('extendInterval', () => {
    it('should increase both endpoints symmetrically as a fraction of the extent', () => {
      expect(extendInterval(interval(0, 10), 0.5)).to.deep.equal(interval(-5, 15));
    });

    it('should not mutate in the input interval', () => {
      const input = interval(0, 10);
      const output = extendInterval(input, 0.5);
      expect(input).to.deep.equal(interval(0, 10));
      expect(output).to.not.deep.equal(interval(0, 10));
    });
  });

  describe('roundInterval', () => {
    it('should round each endpoint of the interval to the nearest integer', () => {
      expect(roundInterval(interval(1.1, 1.9))).to.deep.equal(interval(1, 2));
    });

    it('should not mutate in the input interval', () => {
      const input = interval(1.1, 1.9);
      const output = roundInterval(input);
      expect(input).to.deep.equal(interval(1.1, 1.9));
      expect(output).to.not.deep.equal(interval(1.1, 1.9));
    });
  });

  describe('mergeIntervals', () => {
    it('should return null when a zero-length array is given', () => {
      expect(mergeIntervals([])).to.be.null;
    });

    it('should return the default interval when a zero-length array and default is given', () => {
      const i = interval(0, 5);
      expect(mergeIntervals([], i)).to.equal(i);
    });

    it('should return a interval with min-of-mins and max-of-maxes', () => {
      expect(mergeIntervals([
        interval(0, 2),
        interval(1, 3)
      ])).to.deep.equal(interval(0, 3));
    });

    it('should not mutate the input intervals', () => {
      const i1 = interval(0, 2);
      const i2 = interval(1, 3);
      mergeIntervals([i1, i2]);
      expect(i1).to.deep.equal(interval(0, 2));
      expect(i2).to.deep.equal(interval(1, 3));
    });
  });

  describe('panInterval', () => {
    it('should apply the delta value to both min and max', () => {
      expect(panInterval({
        min: 0,
        max: 10
      }, 5)).to.deep.equal({
        min: 5,
        max: 15
      });
    });

    it('should not mutate the input interval', () => {
      const input = interval(0, 10);
      const output = panInterval(input, 5);
      expect(input).to.deep.equal(interval(0, 10));
      expect(output).to.not.deep.equal(interval(0, 10));
    });
  });

  describe('zoomInterval', () => {
    it('should zoom out when given a value less than 1', () => {
      expect(zoomInterval({
        min: -1,
        max: 1
      }, 1 / 4, 0.5)).to.deep.equal({
        min: -4,
        max: 4
      });
    });

    it('should zoom in when given a value greater than 1', () => {
      expect(zoomInterval({
        min: -1,
        max: 1
      }, 4, 0.5)).to.deep.equal({
        min: -1 / 4,
        max: 1 / 4
      });
    });

    it('should default to zooming equally on both bounds', () => {
      expect(zoomInterval({
        min: -1,
        max: 1
      }, 1 / 4)).to.deep.equal({
        min: -4,
        max: 4
      });
    });

    it('should bias a zoom-in towards one end when given an anchor not equal to 1/2', () => {
      expect(zoomInterval({
        min: -1,
        max: 1
      }, 4, 1)).to.deep.equal({
        min: 1 / 2,
        max: 1
      });
    });

    it('should bias a zoom-out towards one end when given an anchor not equal to 1/2', () => {
      expect(zoomInterval({
        min: -1,
        max: 1
      }, 1 / 4, 1)).to.deep.equal({
        min: -7,
        max: 1
      });
    });

    it('should not mutate the input interval', () => {
      const input = interval(0, 10);
      const output = zoomInterval(input, 1 / 2, 2);
      expect(input).to.deep.equal(interval(0, 10));
      expect(output).to.not.deep.equal(interval(0, 10));
    });
  });

  describe('intervalContains', () => {
    const SMALL_RANGE = { min: 1, max: 2 };
    const BIG_RANGE = { min: 0, max: 3 };

    it('should return true if the first interval is strictly larger than the second interval', () => {
      expect(intervalContains(BIG_RANGE, SMALL_RANGE)).to.be.true;
    });

    it('should return true if the first interval is equal to the second interval', () => {
      expect(intervalContains(BIG_RANGE, BIG_RANGE)).to.be.true;
    });

    it('should return false if the first interval is strictly smaller than the second interval', () => {
      expect(intervalContains(SMALL_RANGE, BIG_RANGE)).to.be.false;
    });
  });
});
