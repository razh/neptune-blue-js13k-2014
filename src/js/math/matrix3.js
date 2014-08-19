'use strict';

function Matrix3(
  n11, n12, n13,
  n21, n22, n23,
  n31, n32, n33
) {
  this.elements = new Float32Array( 9 );

  var m = this.elements;

  m[ 0 ] = ( n11 !== undefined ) ? n11 : 1;
  m[ 3 ] = n12 || 0;
  m[ 6 ] = n13 || 0;

  m[ 1 ] = n21;
  m[ 4 ] = ( n22 !== undefined ) ? n22 : 1;
  m[ 7 ] = n23 || 0;

  m[ 2 ] = n31;
  m[ 5 ] = n32 || 0;
  m[ 8 ] = ( n33 !== undefined ) ? n33 : 1;
}

Matrix3.prototype.set = function (
  n11, n12, n13,
  n21, n22, n23,
  n31, n32, n33
) {
  var m = this.elements;

  m[ 0 ] = n11;
  m[ 3 ] = n12;
  m[ 6 ] = n13;

  m[ 1 ] = n21;
  m[ 4 ] = n22;
  m[ 7 ] = n23;

  m[ 2 ] = n31;
  m[ 5 ] = n32;
  m[ 8 ] = n33;

  return this;
};

Matrix3.prototype.identity = function() {
  this.set(
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  );

  return this;
};

Matrix3.prototype.multiplyScalar = function( s ) {
  var m = this.elements;

  m[ 0 ] *= s;
  m[ 3 ] *= s;
  m[ 6 ] *= s;

  m[ 1 ] *= s;
  m[ 4 ] *= s;
  m[ 7 ] *= s;

  m[ 2 ] *= s;
  m[ 5 ] *= s;
  m[ 8 ] *= s;

  return this;
};

Matrix3.prototype.getInverse = function( matrix ) {
  // input: Matrix4
  // ( based on http://code.google.com/p/webgl-mjs/ )
  var me = matrix.elements;
  var te = this.elements;

  te[ 0 ] =  me[ 10 ] * me[ 5 ] - me[ 6 ] * me[ 9 ];
  te[ 1 ] = -me[ 10 ] * me[ 1 ] + me[ 2 ] * me[ 9 ];
  te[ 2 ] =  me[  6 ] * me[ 1 ] - me[ 2 ] * me[ 5 ];
  te[ 3 ] = -me[ 10 ] * me[ 4 ] + me[ 6 ] * me[ 8 ];
  te[ 4 ] =  me[ 10 ] * me[ 0 ] - me[ 2 ] * me[ 8 ];
  te[ 5 ] = -me[  6 ] * me[ 0 ] + me[ 2 ] * me[ 4 ];
  te[ 6 ] =  me[  9 ] * me[ 4 ] - me[ 5 ] * me[ 8 ];
  te[ 7 ] = -me[  9 ] * me[ 0 ] + me[ 1 ] * me[ 8 ];
  te[ 8 ] =  me[  5 ] * me[ 0 ] - me[ 1 ] * me[ 4 ];

  var det = me[ 0 ] * te[ 0 ] + me[ 1 ] * te[ 3 ] + me[ 2 ] * te[ 6 ];

  // no inverse
  if ( !det ) {
    this.identity();
    return this;

  }

  this.multiplyScalar( 1 / det );
  return this;
};

Matrix3.prototype.transpose = function() {
  var tmp, m = this.elements;

  tmp = m[ 1 ];
  m[ 1 ] = m[ 3 ];
  m[ 3 ] = tmp;

  tmp = m[ 2 ];
  m[ 2 ] = m[ 6 ];
  m[ 6 ] = tmp;

  tmp = m[ 5 ];
  m[ 5 ] = m[ 7 ];
  m[ 7 ] = tmp;

  return this;
};


Matrix3.prototype.getNormalMatrix = function( m ) {
  // input: Matrix4.
  this.getInverse( m ).transpose();
  return this;
};

module.exports = Matrix3;