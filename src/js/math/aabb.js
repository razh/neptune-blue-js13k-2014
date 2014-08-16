'use strict';

function AABB( min, max ) {
  this.min = min;
  this.max = max;
}

AABB.prototype.contains = function( point ) {
  return !( this.min.x > point.x || point.x > this.max.x ||
            this.min.y > point.y || point.y > this.max.y ||
            this.min.z > point.z || point.z > this.max.z );
};

module.exports = AABB;
