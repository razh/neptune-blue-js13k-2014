/*globals requestAnimationFrame*/
'use strict';

var _ = require( '../../../src/js/utils' );

window.AudioTest = function() {
  var rate = 44100;
  // base64 encoding:
  // http://codebase.es/riffwave/
  // Version 0.02 of riffwave:
  // https://github.com/grumdrig/jsfxr/blob/master/riffwave.js
  // http://games.23inch.de/chime/doc/
  var header = btoa(
    'RIFF' +
    '\x35\x2B\x00\x00' +
    'WAVE' +
    'fmt ' +
    '\x10\x00\x00\x00' +
    '\x01\x00' +
    '\x01\x00' +
    '\x44\xAC\x00\x00' +
    '\x44\xAC\x00\x00' +
    '\x01\x00' +
    '\x08\x00' +
    'data' +
    '\x11\x2B'
  );

  var prefix = 'data:audio/wav;base64,UklGRjUrAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YREr';

  var A4 = 57;

  var B0 = 11;
  var B1 = 23;
  var B2 = 35;
  var B3 = 47;
  var B4 = 59;

  var E1 = 16;
  var E2 = 28;
  var E3 = 40;
  var E4 = 52;

  function toFreq( note ) {
    return Math.pow( 2, ( note - A4 ) / 12 ) * 440;
  }

  function create( data, volume ) {
    var audio = new Audio( prefix + btoa( data ) );
    audio.volume = volume;
    return audio;
  }

  function play( sound ) {
    if ( sound.readyState ) {
      sound.currentTime = 0;
    }

    sound.play();
  }

  function generate( freq, duration, fn ) {
    var sound = '';

    // duration is in seconds.
    var length = duration * rate;
    var sample, wave;
    for ( var i = 0; i < length; i++ ) {
      sample = freq * i / 44100 * 2 * Math.PI;
      wave = fn( sample, i / length );
      sound += String.fromCharCode( wave * 127 + 128 );
    }

    return sound;
  }

  function waveformFn( noise, decay ) {
    return function( sample, time ) {
      var wave = _.clamp( Math.sin( sample ) + _.randFloatSpread( noise ), -1, 1 );
      var env = Math.exp( -time * decay );
      return wave * env;
    };
  }

  function bell( sample, time ) {
    var wave = Math.sin( sample );
    var env = Math.exp( -time * 8 );
    return wave * env;
  }

  var kick = waveformFn( 0.1, 12 );
  var snare = waveformFn( 0.8, 16 );

  function hat( sample, time ) {
    var wave = _.clamp( Math.sin( sample ) + _.randFloatSpread( 1.2 ), -1, 1 );
    var env = Math.exp( -time * 4 );
    return wave * env;
  }

  function ambience( sample, time ) {
    var wave = Math.sin( sample );
    var env = Math.exp( -time );
    if ( time > 0.5 ) {
      env *= 2 - 2 * time;
    }

    return wave * env;
  }

  function build( note, fn, duration, volume, detune ) {
    detune = detune || 0;
    return create( generate( toFreq( note ) + detune, duration, fn ), volume );
  }

  var b2note = build( B2, bell, 0.5, 0.2 );
  var e2note = build( E2, bell, 0.5, 0.2 );
  var b3note = build( B3, bell, 0.5, 0.2 );
  var e3note = build( E3, bell, 0.5, 0.2 );
  var b4note = build( B4, bell, 0.5, 0.2 );
  var e4note = build( E4, bell, 0.5, 0.2 );
  var b1note = build( B1, bell, 1, 0.2 );
  var e1note = build( E1, bell, 1, 0.2 );
  var e4hat = build( B4, hat, 0.05, 0.02 );
  var snarenote = build( E3, snare, 0.25, 0.6 );
  var snarenote2 = build( E3, snare, 0.25, 0.4 );
  var kicknote = build( E2, kick, 0.5, 0.6 );
  var bkicknote = build( B1, kick, 0.5, 0.6 );
  var kicknote2 = build( E2, kick, 0.5, 0.4 );
  var b1amb = build( B1, ambience, 2, 0.1 );
  var e2amb = build( E2, ambience, 2, 0.1 );
  var e3amb1 = build( E3, ambience, 2, 0.01, 1 );
  var e2amb1n = build( E2, ambience, 1.5, 0.1, -1 );

  function playOn( sound, delay ) {
    setTimeout(function() {
      play( sound );
    }, delay );
  }

  var BPM = 140;
  var NOTE = 2 * 60 / BPM * 1000;
  play( kicknote );
  // playOn( snarenote, 800 );
  // playOn( e4note, 0.75 * NOTE );

  playOn( e4hat, 1000 );


  var bar = 0;
  function playAll() {
    // playOn( b2note, 400 );
    // playOn( b3note, 400 );
    // playOn( b2note, 800 );
    // playOn( b3note, 800 );
    // playOn( e2note, 1200 );
    // playOn( e3note, 1200 );
    // playOn( snarenote, 0.75 * NOTE );
    // playOn( snarenote, 0.875 * NOTE );

    // playOn( e4hat, 0 );
    // playOn( e4hat, 0.125 * NOTE );
    // playOn( e4hat, 0.25 * NOTE );
    // playOn( e4hat, 0.375 * NOTE );
    // playOn( e4hat, 0.5 * NOTE );
    // playOn( e4hat, 0.625 * NOTE );
    // playOn( e4hat, 0.75 * NOTE );
    // playOn( e4hat, 0.875 * NOTE );

    if ( bar % 4 < 3 ) {
      playOn( kicknote, 0 );
      playOn( kicknote2, 0.25 * NOTE );
      playOn( kicknote2, 0.5 * NOTE );
      playOn( snarenote, 0.75 * NOTE );
      play( e2amb, 0 );
    } else {
      playOn( bkicknote, 0 );
      playOn( kicknote2, 0.25 * NOTE );
      playOn( snarenote2, 0.5 * NOTE );
      playOn( snarenote, 0.75 * NOTE );
      playOn( b1amb, 0 );
    }

    // playOn( e1note, 0 );
    // playOn( e4note, 0 );
    // // playOn( b2note, 250 );
    // playOn( e3note, 0.5 * NOTE );
    // playOn( b4note, 0.5 * NOTE );
    // switch ( bar % 3 ) {
    //   case 0:
    //     playOn( e4note, 0 * NOTE );
    //     playOn( e3note, 0.5 * NOTE );
    //     playOn( e4note, 0.75 * NOTE );
    //     break;
    //   case 1:
    //     playOn( e4note, 0 * NOTE );
    //     playOn( e4note, 0.5 * NOTE );
    //     playOn( b3note, 0.75 * NOTE );
    //     break;
    //   case 2:
    //     playOn( b4note, 0 * NOTE );
    //     playOn( b4note, 0.33 * NOTE );
    //     playOn( e4note, 0.66 * NOTE );
    //     break;
    // }
    bar++;
  }

  var pt, t;
  var time = 0;
  function tick() {
    t = Date.now();
    time += t - pt;
    pt = t;

    if ( time > NOTE ) {
      playAll();
      time = 0;
    }

    requestAnimationFrame( tick );
  }

  function start() {
    pt = Date.now();
    requestAnimationFrame( tick );
  }

  document.addEventListener( 'keydown', function( event ) {
    // Space.
    if ( event.keyCode === 32 ) {
      start();
    }
  });
};
