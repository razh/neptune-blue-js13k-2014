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

Quaternion.prototype.setFromRotationMatrix = function ( m ) {
  // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
  // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

  var e = m.elements,

  m11 = e[ 0 ], m12 = e[ 4 ], m13 = e[  8 ],
  m21 = e[ 1 ], m22 = e[ 5 ], m23 = e[  9 ],
  m31 = e[ 2 ], m32 = e[ 6 ], m33 = e[ 10 ],

  trace = m11 + m22 + m33,
  s;

  if ( trace > 0 ) {

    s = 0.5 / Math.sqrt( trace + 1 );

    this.w = 0.25 / s;
    this.x = ( m32 - m23 ) * s;
    this.y = ( m13 - m31 ) * s;
    this.z = ( m21 - m12 ) * s;

  } else if ( m11 > m22 && m11 > m33 ) {

    s = 2 * Math.sqrt( 1 + m11 - m22 - m33 );

    this.w = ( m32 - m23 ) / s;
    this.x = 0.25 * s;
    this.y = ( m12 + m21 ) / s;
    this.z = ( m13 + m31 ) / s;

  } else if ( m22 > m33 ) {

    s = 2 * Math.sqrt( 1 + m22 - m11 - m33 );

    this.w = ( m13 - m31 ) / s;
    this.x = ( m12 + m21 ) / s;
    this.y = 0.25 * s;
    this.z = ( m23 + m32 ) / s;

  } else {

    s = 2 * Math.sqrt( 1 + m33 - m11 - m22 );

    this.w = ( m21 - m12 ) / s;
    this.x = ( m13 + m31 ) / s;
    this.y = ( m23 + m32 ) / s;
    this.z = 0.25 * s;

  }

  return this;
};

module.exports = Quaternion;
