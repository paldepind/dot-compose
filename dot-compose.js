var chains = [];

function inject(fn) {
  if (this._int !== undefined) {
    chains.push([fn]);
    return this._int;
  } else {
    chains[chains.length - 1].push(fn);
    return this;
  }
}

function endComposition() {
  var chain = chains.pop();
  return function() {
    var i, val = chain[chain.length - 1].apply(undefined, arguments);
    for (i = chain.length - 2; i >= 0; --i) {
      val = chain[i](val);
    }
    return val;
  };
}

function createGroup(obj) {
  var group = createComposeable();
  group._int = createComposeable(); // Intermediate composeable
  if (obj !== undefined) {
    var fn, name;
    for (name in obj) {
      fn = obj[name];
      if (typeof fn === 'function' && group[name] === undefined) {
        add(group, name, fn);
      }
    }
  }
  return group;
}

function createComposeable() {
  function fn() {
    var chain = chains[chains.length - 1];
    var lastIdx = chain.length - 1;
    chain[lastIdx] = chain[lastIdx].apply(null, arguments);
    return fn;
  }
  fn._ = inject;
  Object.defineProperty(fn, '$', {get: endComposition});
  return fn;
}

function add(group, name, fn) {
  if (group[name] === undefined) {
    Object.defineProperty(group, name, {get: inject.bind(group, fn)});
    Object.defineProperty(group._int, name, {get: inject.bind(group._int, fn)});
  }
  return fn;
}

module.exports = {
  Group: createGroup,
  add: function(group, fn) {
    return add(group, fn.name, fn);
  },
};
