'use strict';

function Quaternion( x, y, z, w ) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
  this.w = ( w !== undefined ) ? w : 1;
}

Quaternion.prototype.setFromAxisAngle = function( axis, angle ) {
  // http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
  // assumes axis is normalized
  var halfAngle = angle / 2,
      s = Math.sin( halfAngle );

  this.x = axis.x * s;
  this.y = axis.y * s;
  this.z = axis.z * s;
  this.w = Math.cos( halfAngle );

  return this;
};

Quaternion.prototype.multiply = function( q ) {
  return this.multiplyQuaternions( this, q );
};

Quaternion.prototype.multiplyQuaternions = function( a, b ) {
  // from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm
  var qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
  var qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

  this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
  this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
  this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
  this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

  return this;
};

module.exports = Quaternion;
