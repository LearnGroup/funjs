
/**
 * Funjs is a tool sets for js programmer to write 
 * lazy, functional programes
 */

var funjs = {};

(function(funjs) {
  
  var LazyIterator = function(gen, value, param, state) {
    this._gen = gen;
    this._value = value;
    this._param = param;
    this._state = state;
  };
  
  LazyIterator.prototype.next = function() {
    return this._gen(this._param, this._state);
  };
  
  LazyIterator.prototype.getValue = function() {
    return this._value(this._param, this._state);
  };
  
  funjs.iter_wrapper = function(gen, value, param, state) {
    return new LazyIterator(gen, value, param, state);
  };
  
  funjs.nil_iter = funjs.iter_wrapper(null, function () {
    return null;
  }, null, null);
  
  funjs.to_array = function(iter) {
    var res = [];
    while (iter != funjs.nil_iter) {
      res.push(iter.getValue());
      iter = iter.next();
    }
    return res;
  };
  
  funjs.array_iter = function(arr) {
    var array_iter_value = function(param, state) {
      return param[state];
    };
    
    var gen_func = function(param, state) {
      if (1 + state == param.length) {
        return funjs.nil_iter;
      } else {
        return funjs.iter_wrapper(gen_func, array_iter_value, param, state + 1);
      }
    };
    
    return funjs.iter_wrapper(gen_func, array_iter_value, arr, 0);
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
  
      var map_iter_value = function(param, state) {
        return transform(iter._value(param, state));
      };
      
      var map_iter_gen = function(param, state) {
        var next_iter = iter._gen(param, state);
        if (next_iter == funjs.nil_iter) {
          return next_iter;
        } else {
          return funjs.iter_wrapper(map_iter_gen, map_iter_value, next_iter._param, next_iter._state);
        }
      };
      
      return funjs.iter_wrapper(map_iter_gen, map_iter_value, iter._param, iter._state);
    };
  };
  
}(funjs));

//console.log(funjs);

var array = [1, 2, 3, 4];

var arr_iter = funjs.array_iter(array);
console.log('arr', funjs.to_array(arr_iter));


var map_iter = funjs.map(function(v) { return v + 1; }, array);
console.log(array, ' -> ', funjs.to_array(map_iter));

console.log(funjs.map(function(v) {}));
