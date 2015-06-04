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

  funjs.nil_iter = new LazyIterator(null, null, null, null);

  funjs.array_iter = function (arr) {
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
  
  funjs.map = function(transform, list) {
    if (list != null) {
      return funjs.map(transform)(list);
    }
    
    return function(list) {
      var iter = list;
      if (Array.isArray(list)) {
        iter = funjs.array_iter(list);
      }
      
      var map_value = function() {
        return transform(this._state.getValue());
      };
      
      var map_gen = function() {
        var next_iter = this._state.next();
        if (next_iter === funjs.nil_iter) {
          return next_iter;
        } 
        return new LazyIterator(map_gen, map_value, null, next_iter);
      };
      
      return new LazyIterator(map_gen, map_value, null, iter);
    };
  };

  funjs.take_n = function(n, list) {
    if (list != null) {
      return funjs.take_n(n)(list);
    }
    
    return function(list) {
      var iter = list;
      if (Array.isArray(list)) {
        iter = funjs.array_iter(list);
      }
      
      var take_n_value = function() {
        return this._state.iter.getValue();
      };
      
      var take_n_gen = function() {
        if (this._state.cur + 1 === this._param) {
          return funjs.nil_iter;
        }
        var next_iter = this._state.iter.next();
        if (next_iter === funjs.nil_iter) {
          return next_iter;
        }
        return new LazyIterator(take_n_gen, take_n_value, this._param, {"cur": this._state.cur + 1, "iter": next_iter});
      };
      
      return new LazyIterator(take_n_gen, take_n_value, n, {"cur": 0, "iter": iter});
    };
  };

} (funjs));

var array = [1, 2, 3, 4];

var arr_iter = funjs.array_iter(array);
console.log('arr_iter', arr_iter.force());

var map_iter = funjs.map(function(v) { return v + 1; }, array);
console.log('map_iter', map_iter.force());

var take_n_iter = funjs.take_n(2, array);
console.log('take_n_iter', take_n_iter.force());

var take_n_more_iter = funjs.take_n(10, array);
console.log('take_n_more_iter', take_n_more_iter.force());

var take_n_map = funjs.take_n(2, funjs.map(function(v) { return v * 10; }, array));
console.log('take_n_map', take_n_map.force());