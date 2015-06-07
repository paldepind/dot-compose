var assert = require('assert');
var Compose = require('../dot-compose');

function double(n) { return 2 * n; }
function square(n) { return n * n; }
function half(n) { return n / 2; }
function add2(n) { return n + 2; }

describe('dot compose', function() {
  describe('composition', function() {
    var g = Compose.Group();
    var double = g.add(function double(n) { return 2 * n; });
    var square = g.add(function square(n) { return n * n; });
    var half = g.add(function half(n) { return n / 2; });
    var add2 = g.add(function add2(n) { return n + 2; });
    var add = g.add(function add(n, m) {
      if (arguments.length === 1) {
        return function(m) {
          return n + m;
        };
      } else {
        return n + m;
      }
    });
    it('two can compose', function() {
      assert.equal((double . square . $)(3), 18);
    });
    it('three can compose', function() {
      assert.equal((add2 . double . square . $)(3), 20);
    });
    it('function can be reused', function() {
      var f = add2 . double . square . $;
      assert.equal(f(9), 164);
      assert.equal(f(3), 20);
    });
    it('function in chains can be partially applied', function() {
      var f = double . add(4) . square . $;
      assert.equal(f(4), 40);
      assert.equal(f(3), 26);
    });
    it('first function in chains can be partially applied', function() {
      var f = g._(add(2)) . double . $;
      assert.equal(f(4), 10);
      assert.equal(f(3), 8);
    });
    it('is possible to inject arbitrary after second', function() {
      var f = add2 . half . _(Math.abs) . $;
      assert.equal(f(-10), 7);
    });
    it('is possible to inject arbitrary as second', function() {
      var f = add2 . _(Math.abs) . half . $;
      assert.equal(f(-10), 7);
    });
  });
});
