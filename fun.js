/**
 * Funjs - a javascript toolset for functional programming fans
 */

var funjs = {};

(function (funjs) {
  function LazyIterator(gen, value, param, state) {
    this.gen = gen;
    this.value = value;
    this._param = param;
    this._state = state;
  }

  LazyIterator.prototype.getValue = function () {
    return this.value();
  };

  LazyIterator.prototype.next = function () {
    return this.gen();
  };

  LazyIterator.prototype.force = function () {
    var iter = this, res = [];

    while (iter != funjs.nil_iter) {
      res.push(iter.getValue());
      iter = iter.next();
    }

    return res;
  };

  funjs.nil_iter = new LazyIterator(function () {
    throw "nil iterator cannot be iterated";
  }, function () {
      throw "nil iterator has no value";
    }, null, null);

  funjs.array_iter = function (arr) {
    if (arr.length === 0) {
      return funjs.nil_iter;
    }

    var array_iter_value = function () {
      return this._param[this._state];
    };

    var array_iter_gen = function () {
      if (this._state + 1 === this._param.length) {
        return funjs.nil_iter;
      }
      return new LazyIterator(array_iter_gen, array_iter_value, arr, this._state + 1);
    };

    return new LazyIterator(array_iter_gen, array_iter_value, arr, 0);
  };

  funjs.map = function (transform, list) {
    if (list !== undefined) {
      return funjs.map(transform)(list);
    }

    return function (list) {
      var iter = list;
      if (Array.isArray(list)) {
        iter = funjs.array_iter(list);
      }

      if (iter === funjs.nil_iter) {
        return iter;
      }

      var map_value = function () {
        return this._param(this._state.getValue());
      };

      var map_gen = function () {
        var next_iter = this._state.next();
        if (next_iter === funjs.nil_iter) {
          return next_iter;
        }
        return new LazyIterator(map_gen, map_value, this._param, next_iter);
      };

      return new LazyIterator(map_gen, map_value, transform, iter);
    };
  };

  funjs.take_n = function (n, list) {
    if (list !== undefined) {
      return funjs.take_n(n)(list);
    }

    return function (list) {
      var iter = list;
      if (Array.isArray(list)) {
        iter = funjs.array_iter(list);
      }

      if (iter === funjs.nil_iter) {
        return iter;
      }

      var take_n_value = function () {
        return this._state.iter.getValue();
      };

      var take_n_gen = function () {
        if (this._state.cur + 1 === this._param) {
          return funjs.nil_iter;
        }
        var next_iter = this._state.iter.next();
        if (next_iter === funjs.nil_iter) {
          return next_iter;
        }
        return new LazyIterator(take_n_gen, take_n_value, this._param, { "cur": this._state.cur + 1, "iter": next_iter });
      };

      return new LazyIterator(take_n_gen, take_n_value, n, { "cur": 0, "iter": iter });
    };
  };

  funjs.filter = function (pred, list) {
    if (list !== undefined) {
      return funjs.filter(pred)(list);
    }

    return function (list) {
      var iter = list;
      if (Array.isArray(list)) {
        iter = funjs.array_iter(list);
      }

      if (iter === funjs.nil_iter) {
        return iter;
      }


      var filter_value = function () {
        return this._state.getValue();
      };

      var filter_gen = function () {
        var next_iter = this._state.next();
        while (next_iter !== funjs.nil_iter && !this._param(next_iter.getValue())) {
          next_iter = next_iter.next();
        }
        if (next_iter === funjs.nil_iter) {
          return next_iter;
        }
        return new LazyIterator(filter_gen, filter_value, this._param, next_iter);
      };

      var res = new LazyIterator(filter_gen, filter_value, pred, iter);
      if (pred(iter.getValue())) {
        return res;
      }
      return res.next();
    };
  };

  funjs.head = function (list) {
    var iter = list;
    if (Array.isArray(list)) {
      iter = funjs.array_iter(list);
    }
    return iter.getValue();
  };

  funjs.tail = function (list) {
    var iter = list;
    if (Array.isArray(list)) {
      iter = funjs.array_iter(list);
    }

    return iter.next();
  };

  /**
   * func: lambda acc, v -> acc'
   */
  funjs.reduce = function (func, initial, list) {
    if (initial !== undefined) {
      return funjs.reduce(func)(initial, list);
    }
    
    return function (initial, list) {
      if (list !== undefined) {
        return funjs.reduce(func)(initial)(list);
      }
      
      return function (list) {
        var iter = list;
        if (Array.isArray(list)) {
          iter = funjs.array_iter(list);
        }
        
        var acc = initial;
        while (iter !== funjs.nil_iter) {
          acc = func(acc, iter.getValue());
          iter = iter.next();
        }
        
        return acc;
      };
    };
  };

  funjs.sum = funjs.reduce(function(acc, v) {
    return acc + v;
  }, 0);

} (funjs));

var array = [1, 2, 3, 4];

var nil_iter = funjs.array_iter([]);
console.log('nil_iter', []);

var arr_iter = funjs.array_iter(array);
console.log('arr_iter', arr_iter.force());

var map_iter = funjs.map(function (v) { return v + 1; }, array);
console.log('map_iter', map_iter.force());

var map_nil_iter = funjs.map(function (v) { return v + 1; }, []);
console.log('map_nil_iter', map_nil_iter.force());

var take_n_iter = funjs.take_n(2, array);
console.log('take_n_iter', take_n_iter.force());

var take_n_more_iter = funjs.take_n(10, array);
console.log('take_n_more_iter', take_n_more_iter.force());

var take_n_map_iter = funjs.take_n(2, funjs.map(function (v) { return v * 10; }, array));
console.log('take_n_map', take_n_map_iter.force());

var filter_iter = funjs.filter(function (v) { return (v % 2) == 0; }, array);
console.log('filter_iter', filter_iter.force());

//console.log('head of ', [], funjs.head([])); // throw error
console.log('head of', array, "is", funjs.head(array));

var tail_iter = funjs.tail(array);
console.log('tail_iter', tail_iter.force());

console.log('reduce', funjs.reduce(function(acc, v) { return acc + v; }, 0, array));

console.log('sum', funjs.sum(array));