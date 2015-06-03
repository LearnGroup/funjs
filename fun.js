
/**
 * Funjs is a tool sets for js programmer to write 
 * lazy, functional programes
 */

/**
 * 
 */

/**
 * Iterator: 
 * @interface: IteratorResult next() 
 *             throw an error if cannot go next
 */

/**
 * IteratorResult: 
 * var iterResult = {
 *   "value": <value>,
 *   "hasNext": <boolean>
 * }
 */

var funjs = {};

(function(funjs) {
  
  funjs.iter_wrapper = function(gen, value, param, state) {
    return {
      "gen": gen, // return a iterator contains next value
      "param": param, // param 
      "state": state, // state
      "value": value, // return the value of iterator
      "next": function() { // public interface to iterate next
        return this.gen(param, state);
      }, 
      "getValue": function() { // public interface to get value
        return this.value(param, state);
      },
    };
  };
  
  funjs.nil_iter = funjs.iter_wrapper(null, function () {
    return null;
  }, null, null);
  
  funjs.array_iter = function(arr) {
    var value_func = function(param, state) {
      return param[state];
    };
    
    var gen_func = function(param, state) {
      if (1 + state == param.length) {
        return funjs.nil_iter;
      } else {
        return funjs.iter_wrapper(gen_func, value_func, param, state + 1);
      }
    };
    
    return funjs.iter_wrapper(gen_func, value_func, arr, 0);
  };
  
  funjs.map_iter = function(transform, iter) {
    var value_func = function(param, state) {
      var v = transform(iter.value(param, state));
      return v;
    };
    
    var map_iter_gen = function(param, state) {
      var next_iter = iter.gen(param, state);
      if (next_iter == funjs.nil_iter) {
        return next_iter;
      } else {
        return funjs.iter_wrapper(map_iter_gen, value_func, next_iter.param, next_iter.state);
      }
    };
    
    return funjs.iter_wrapper(map_iter_gen, value_func, iter.param, iter.state);
  };
  
  funjs.map = function(transform, list) {
    if (Array.isArray(list)) {
      return funjs.map_iter(transform, funjs.array_iter(list));
    }
  };
  
}(funjs));

//console.log(funjs);

var iter = funjs.map(function(v) { return v + 1; }, [1, 2, 3, 4]);

var res = [];
while (iter != funjs.nil_iter) {
  res.push(iter.getValue());
  iter = iter.next();
}

console.log(iter);
console.log('res', res);