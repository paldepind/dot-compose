var chain = [];

function inject(fn) {
  chain.push(fn);
  return this;
}

function endComposition() {
  var ch = chain;
  chain = [];
  return function() {
    var i, val = ch[ch.length - 1].apply(undefined, arguments);
    for (i = ch.length - 2; i >= 0; --i) {
      val = ch[i](val);
    }
    return val;
  };
}

function createGroup() {
  function group() {
    var lastIdx = chain.length - 1;
    chain[lastIdx] = chain[lastIdx].apply(null, arguments);
    return group;
  }
  group._ = inject;
  Object.defineProperty(group, '$', {get: endComposition});
  return group;
}

function add(group, name, fn) {
  if (group[name] === undefined) {
    Object.defineProperty(group, name, {get: inject.bind(group, fn)});
  }
  return fn;
}

module.exports = {
  Group: createGroup,
  inject: function(obj) {
    var fn, group = createGroup();
    for (var name in obj) {
      fn = obj[name];
      if (typeof fn === 'function' && group[name] === undefined) {
        add(group, name, fn);
      }
    }
    return group;
  },
  add: function(group, fn) {
    return add(group, fn.name, fn);
  },
};
