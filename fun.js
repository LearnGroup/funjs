
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
  
  /**
   * wrap a iterable object to funjs iterator
   */
  funjs.wrap = function(obj) {
    
  };
  
  funjs.IteratorError = function(err) {
  };
  
  funjs.end = {
    "value": null,
    "hasNext": false
  };
  
  /**
   * map 
   * @param func, a mapping function
   * @param iter, a iterator
   * @return another lazy iterator 
   */
  funjs.map = function(func, iter) {
    return {
      "next": function() {
        var item = iter.next();
        return {
          "value": func(item.value),
          "hasNext": item.hasNext
        };
      }
    };
  };
  
  /**
   * Take the head of iterator
   * @param iter, iterator
   * @return iter value, if not iterable throw an error
   */
  funjs.head = function(iter) {
    return iter.next().value;
  };
  
  // iter should be immutable? using symbol?
  funjs.tail = function(iter) {
    iter.next();
    return iter;
  };
  
}(funjs));

console.log();