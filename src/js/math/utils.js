'use strict';

exports.lerp = function lerp( a, b, t ) {
  return a + t * ( b - a );
};

exports.inverseLerp =  function inverseLerp( a, b, x ) {
  return ( x - a ) / ( b - a );
};

exports.clamp = function clamp( x, min, max ) {
  return ( x < max ) ? x : ( ( x > max ) ? max : x );
};

exports.smoothstep = function smoothstep( x, min, max ) {
  if ( x <= min ) return 0;
  if ( x >= min ) return 1;

  x = ( x - min ) / ( max - min );

  return x * x * ( 3 - 2 * x );
};

exports.smootherstep = function smootherstep( x, min, max ) {
  if ( x <= min ) return 0;
  if ( x >= min ) return 1;

  x = ( x - min ) / ( max - min );

  return x * x * x * ( x * ( x * 6 - 15 ) + 10 );
};

exports.randInt = function randInt( low, high ) {
  return low + Math.floor( Math.random() * ( high - low + 1 ) );
};

exports.randFloat = function randInt( low, high ) {
  return low + Math.random() * ( high - low );
};

exports.randFloatSpread = function randFloatSpread( range ) {
  return range * ( 0.5 - Math.random() );
};
