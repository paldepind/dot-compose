function createGroup() {
  return new Group();
}

function Group() {
  this.fns = [];
  this.intermediate = createIntermediate();
}

var chain = [];

function createInjectFn(intermediate) {
  return function(fn) {
    chain.push(this);
    chain.push(fn);
    return intermediate;
  };
}

function createIntermediate() {
  function fn() {
    var lastIdx = chain.length - 1;
    chain[lastIdx] = chain[lastIdx].apply(null, arguments);
    return fn;
  }
  fn._ = function(fn) {
    chain.push(fn);
    return this;
  };
  Object.defineProperty(fn, '$', {
    get: function() {
      var ch = chain;
      chain = [];
      return function() {
        var val = ch[ch.length - 1].apply(undefined, arguments);
        for (var i = ch.length - 2; i >= 0; --i) {
          val = ch[i](val);
        }
        return val;
      };
    }
  });
  return fn;
}

function addIntermediateGetter(inter, name, fn) {
  Object.defineProperty(inter, name, {
    get: function() {
      chain.push(fn);
      return inter;
    }
  });
}

function addInitialGetter(fn, fn2, name, inter) {
  Object.defineProperty(fn, name, {
    get: function() {
      chain.push(fn);
      chain.push(fn2);
      return inter;
    }
  });
}

Group.prototype._ = function(fn) {
  chain.push(fn);
  return this.intermediate;
};

Group.prototype.add = function(origFn) {
  var name = origFn.name;
  var fn = origFn;
  var i, fn2, name2;
  fn[name] = fn;
  for (i = 0; i < this.fns.length; ++i) {
    fn2 = this.fns[i];
    name2 = fn2.customName !== undefined ? fn2.customName : fn2.name;
    addInitialGetter(fn, fn2, name2, this.intermediate);
    addInitialGetter(fn2, fn, name, this.intermediate);
  }
  this.fns.push(fn);
  addIntermediateGetter(this.intermediate, name, fn);
  fn._ = createInjectFn(this.intermediate);
  return fn;
};

module.exports = {
  Group: createGroup,
};
