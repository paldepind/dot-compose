var assert = require('assert');
var Compose = require('../dot-compose');
var R = require('ramda');

function double(n) { return 2 * n; }
function square(n) { return n * n; }
function half(n) { return n / 2; }
function add2(n) { return n + 2; }

describe('dot compose', function() {
  describe('composition', function() {
    var g = Compose.Group();
    var double = Compose.add(g, function double(n) { return 2 * n; });
    var square = Compose.add(g, function square(n) { return n * n; });
    var half = Compose.add(g, function half(n) { return n / 2; });
    var add2 = Compose.add(g, function add2(n) { return n + 2; });
    var add = Compose.add(g, function add(n, m) {
      if (arguments.length === 1) {
        return function(m) {
          return n + m;
        };
      } else {
        return n + m;
      }
    });
    var applyTwice = Compose.add(g, function applyTwice(fn, val) {
      if (arguments.length === 1) {
        return function(val) {
          return fn(fn(val));
        };
      } else {
        return fn(fn(val));
      }
    });
    it('two can compose', function() {
      assert.equal(g.double . square .$(3), 18);
    });
    it('three can compose', function() {
      assert.equal((g.add2 . double . square .$)(3), 20);
    });
    it('function can be reused', function() {
      var f = g.add2 . double . square .$;
      assert.equal(f(9), 164);
      assert.equal(f(3), 20);
    });
    it('function in chains can be partially applied', function() {
      var f = g.double . add(4) . square .$;
      assert.equal(f(4), 40);
      assert.equal(f(3), 26);
    });
    it('first function in chains can be partially applied', function() {
      var f = g._(add(2)) . double .$;
      assert.equal(f(4), 10);
      assert.equal(f(3), 8);
    });
    it('first function in chains can be partially applied – alternative', function() {
      var f = g.add(2) . double .$;
      assert.equal(f(4), 10);
      assert.equal(f(3), 8);
    });
    it('is possible to inject arbitrary after second', function() {
      var f = g.add2 . half . _(Math.abs) .$;
      assert.equal(f(-10), 7);
    });
    it('is possible to inject arbitrary as second', function() {
      var f = g.add2 . _(Math.abs) . half .$;
      assert.equal(f(-10), 7);
    });
    it('function can be composed inside composition', function() {
      var f = g.add(2) . half . applyTwice(g.half.double.$) .$;
      assert.equal(f(4), 4);
    });
  });
  describe('integration', function() {
    describe('Ramda', function() {
      it('can decorate Ramda', function() {
        var r = Compose.Group(R);
        var fn1 = r.add(2) . inc . negate .$;
        var fn2 = R.compose(R.add(2), R.inc, R.negate);
        assert.equal(fn1(13), fn2(13));
      });
      it('can compose with Ramda', function() {
        var r = Compose.Group(R);
        Compose.curryN(R.curryN);
        var fn = r.negate . add .$;
        assert.equal(fn.length, 2);
      });
    });
  });
});
