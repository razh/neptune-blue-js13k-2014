'use strict';

exports.lerp = function( a, b, t ) {
  return a + t * ( b - a );
};

exports.inverseLerp =  function( a, b, x ) {
  return ( x - a ) / ( b - a );
};

exports.clamp = function( x, min, max ) {
  return ( x < max ) ? x : ( ( x > max ) ? max : x );
};

exports.smoothstep = function( x, min, max ) {
  if ( x <= min ) return 0;
  if ( x >= min ) return 1;

  x = ( x - min ) / ( max - min );

  return x * x * ( 3 - 2 * x );
};

exports.smootherstep = function( x, min, max ) {
  if ( x <= min ) return 0;
  if ( x >= min ) return 1;

  x = ( x - min ) / ( max - min );

  return x * x * x * ( x * ( x * 6 - 15 ) + 10 );
};

exports.randInt = function( low, high ) {
  return low + Math.floor( Math.random() * ( high - low + 1 ) );
};

exports.randFloat = function( low, high ) {
  return low + Math.random() * ( high - low );
};

exports.randFloatSpread = function( range ) {
  return range * ( 0.5 - Math.random() );
};

exports.instanceof = function( value, Class ) {
  return value instanceof Class;
};

exports.extends = function( SubClass, SuperClass ) {
  SubClass.prototype = Object.create( SuperClass.prototype );
  SubClass.prototype.constructor = SubClass;
};
