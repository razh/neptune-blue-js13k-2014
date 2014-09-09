/*jshint bitwise:false*/
'use strict';

var _ = require( '../../../src/js/utils' );

var rate = 44100;

// Notes.
var A4 = 69;
var E1 = 28;
var E3 = 52;
var CS3 = 49;
var DS3 = 51;
var GS3 = 56;
var FS3 = 54;

var prefix = 'data:audio/wav;base64,UklGRjUrAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAA';

// Convert big-endian 32-bit (8-byte) number to little-endian string for
// PCM headers.
function dataLength( n ) {
  return String.fromCharCode.apply( null, [
    n & 0xFF,
    ( n >> 8 ) & 0xFF,
    ( n >> 16 ) & 0xFF,
    ( n >> 24 ) & 0xFF
  ]);
}

function toFreq( note ) {
  return Math.pow( 2, ( note - A4 ) / 12 ) * 440;
}

function create( data, volume ) {
  // Add 'data' prefix.
  var audio = new Audio( prefix + btoa( 'data' + dataLength( data ) + data ) );
  audio.volume = volume;
  return audio;
}

function play( sound ) {
  if ( sound.readyState ) {
    sound.currentTime = 0;
  }

  sound.play();
}

// Delay is in seconds.
function playOn( sound, delay ) {
  setTimeout(function() {
    playAudio( sound );
  }, delay * 1e3 );
}

function generate( freq, duration, fn ) {
  var sound = '';

  // duration is in seconds.
  var length = duration * rate;
  var sample, wave;
  for ( var i = 0; i < length; i++ ) {
    sample = freq * i / rate;
    wave = 32767 * fn( sample, i / length );
    sound += String.fromCharCode( wave & 0xFF );
    sound += String.fromCharCode( ( wave >> 8 ) & 0xFF );
  }

  return sound;
}

// Generate audio data and create an audio file.
function synth( note, fn, duration, volume ) {
  return create( generate( toFreq( note ), duration, fn ), volume );
}

function sine( sample ) {
  return Math.sin( sample * 2 * Math.PI );
}

function waveformFn( noise, decay ) {
  return function waveform( sample, time ) {
    var wave = _.clamp( sine( sample ) + _.randFloatSpread( noise ), -1, 1 );
    var env = Math.exp( -time * decay );
    return wave * env;
  };
}

// Waveforms.
var kick = waveformFn( 0.1, 32 );
var snare = waveformFn( 0.8, 16 );

function bass( sample, time ) {
  var wave = 0.5 * ( sine( sample ) + sine( 0.5 * sample ) );
  var env = Math.exp( -time * 4 );
  return wave * env;
}

var BPM = 140;
var NOTE = 2 * 60 / BPM * 1000;

// Note duration values (s_.
var _n2 = 1e-3 * NOTE / 2;
var _n4 = _n2 / 2;
var _n8 = _n4 / 2;

// Sounds.
var snarenote = synth( E3, snare, _n4, 0.3 );
var snarenote2 = synth( E3, snare, _n4, 0.2 );
var snarenote3 = synth( E3, snare, _n4 + _n8, 0.4 );

var kicknote = synth( E1, kick, _n2 + _n8, 1 );
var kicknote2 = synth( E1, kick, _n2 + _n8, 0.6 );
var kicknote3 = synth( E1, kick, _n2 + _n8, 0.6 );

var gs3bass = synth( GS3, bass, _n2, 0.3 );
var gs3bass2 = synth( GS3, bass, _n2, 0.2 );
var gs3bass3 = synth( GS3, bass, _n2 + _n8, 0.2 );

var fs3bass = synth( FS3, bass, _n2, 0.3 );
var fs3bass2 = synth( FS3, bass, _n2, 0.2 );
var fs3bass3 = synth( FS3, bass, _n2 + _n8, 0.2 );

var e3bass = synth( E3, bass, _n2, 0.3 );
var e3bass2 = synth( E3, bass, _n2, 0.2 );
var e3bass3 = synth( E3, bass, _n2 + _n8, 0.2 );

var ds3bass = synth( DS3, bass, _n2, 0.3 );
var ds3bass2 = synth( DS3, bass, _n2, 0.2 );
var ds3bass3 = synth( DS3, bass, _n2 + _n8, 0.2 );

var cs3bass = synth( CS3, bass, _n2, 0.3 );
var cs3bass2 = synth( CS3, bass, _n2, 0.2 );
var cs3bass3 = synth( CS3, bass, _n2 + _n8, 0.2 );

function bassline( b0, b1, b2 ) {
  playOn( b0 );
  playOn( b1, _n4 );
  playOn( b2, _n2 );
}

var bar = 0;

function playAll() {
  if ( bar % 2 < 1 ) {
    playOn( kicknote );
    if ( bar % 16 >= 12 ) {
      playOn( kicknote3, _n4 + _n8 );
    }

    playOn( snarenote, _n2 );
    playOn( kicknote2, _n2 + _n4 + _n8 );

  } else if ( bar % 4 < 2 ) {
    playOn( kicknote, _n4 );
    playOn( snarenote, _n2 );
    playOn( kicknote2, _n2 + _n4 + _n8 );

  } else if ( bar % 8 < 4 ){
    playOn( kicknote, _n4 );
    playOn( snarenote, _n2 );
    playOn( kicknote2, _n2 + _n4 );

  } else if ( bar % 16 < 8 ) {
    playOn( kicknote, _n4 );
    playOn( snarenote, _n2 );
    playOn( kicknote2, _n2 + _n4 );
    playOn( kicknote3, _n2 + _n4 + _n8 );

  } else {
    playOn( kicknote, _n4 );
    playOn( snarenote, _n2 );
    playOn( kicknote2, _n2 + _n8 );
    playOn( snarenote2, _n2 + _n4 );
    playOn( snarenote3, _n2 + _n4 + _n8 );

  }

  var bassIndex = bar % 32;

  if ( bassIndex < 4 ) {
    bassline( gs3bass, gs3bass2, gs3bass3 );
  } else if ( bassIndex < 8 ) {
    bassline( fs3bass, fs3bass2, fs3bass3 );
  } else if ( bassIndex < 12 ) {
    bassline( e3bass, e3bass2, e3bass3 );
  } else if ( bassIndex < 16 ) {
    bassline( ds3bass, ds3bass2, ds3bass3 );
  } else if ( bassIndex < 20 ) {
    bassline( cs3bass, cs3bass2, cs3bass3 );
  } else if ( bassIndex < 24 ) {
    bassline( e3bass, e3bass2, e3bass3 );
  } else if ( bassIndex < 28 ) {
    bassline( fs3bass, fs3bass2, fs3bass3 );
  } else {
    bassline( gs3bass, gs3bass2, gs3bass3 );
  }
}

playAll();
