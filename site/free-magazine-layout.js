/* A12-style layered expansion: preserve the original assembly directions.
 * Roll-film models already include parent + child offsets when flattened.
 * Special models store their complete offset directly; never add it twice.
 * Viewing illustration only, not a service sequence or a physical path.
 */
(function (global) {
  'use strict';
  global.createFreeMagazineLayout = function (T, parts) {
    return new Map(parts.map(part => {
      if (!Array.isArray(part.spread) || part.spread.length !== 3 || !part.spread.every(Number.isFinite)) {
        throw new Error('组件缺少分层展开位置：' + part.id);
      }
      return [part.id, new T.Vector3(...part.spread)];
    }));
  };
})(window);
