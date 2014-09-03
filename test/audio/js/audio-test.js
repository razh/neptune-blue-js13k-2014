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

  var A4 = 69;
  var A2 = 45;
  var A1 = 33;

  var B0 = 23;
  var B1 = 35;
  var B2 = 47;
  var B3 = 59;
  var B4 = 71;

  var E1 = 28;
  var E2 = 40;
  var E3 = 52;
  var E4 = 64;

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
      sample = freq * i / 44100;
      wave = fn( sample, i / length );
      sound += String.fromCharCode( wave * 127 + 128 );
    }

    return sound;
  }

  function waveformFn( noise, decay ) {
    return function waveform( sample, time ) {
      var wave = _.clamp( sine( sample ) - _.randFloatSpread( noise ), -1, 1 );
      var env = Math.exp( -time * decay );
      return wave * env;
    };
  }

  function bell( sample, time ) {
    var wave = sine( sample );
    var env = Math.exp( -time * 8 );
    return wave * env;
  }

  function sine( sample ) {
    return Math.sin( sample * 2 * Math.PI );
  }

  function square( sample ) {
    return sample < 0.5 ? 1 : -1;
  }

  var kick = waveformFn( 0.05, 32 );
  var snare = waveformFn( 0.8, 16 );

  function hat( sample, time ) {
    var wave = _.clamp( sine( sample ) + _.randFloatSpread( 1.2 ), -1, 1 );
    var env = Math.exp( -time * 4 );
    return wave * env;
  }

  function ambience( sample, time ) {
    var wave = sine( sample );
    var env = Math.exp( -time * 4 );
    if ( time > 0.5 ) {
      env *= 2 - 2 * time;
    }

    return wave * env;
  }

  function bass( sample, time ) {
    var wave = 0.5 * ( sine( sample ) + sine( 0.5 * sample ) );
    var env = Math.exp( -time * 4 );
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
  var snarenote = build( E3, snare, 0.25, 0.4 );
  var snarenote2 = build( E3, snare, 0.25, 0.2 );
  var snarenote2a = build( E3, snare, 0.25, 0.2 );
  var snarenote3 = build( E3, snare, 0.3, 0.6 );
  var kicknote = build( E2, kick, 0.5, 0.8 );
  var bkicknote = build( B1, kick, 0.5, 0.8 );
  var kicknote2 = build( E2, kick, 0.5, 0.6 );
  var kicknote3 = build( E2, kick, 0.5, 0.6 );
  var b1amb = build( B1, ambience, 1, 0.1 );
  var e2amb = build( E2, ambience, 1, 0.1 );
  var a1amb = build( A1, ambience, 1, 0.1 );
  var a2amb = build( A2, ambience, 1, 0.1 );
  var e3amb1 = build( E3, ambience, 1, 0.01, 1 );
  var e2amb1n = build( E2, ambience, 1, 0.1, -1 );

  var e2bass = build( E2, bass, 0.25, 0.2 );

  var gs3bass = build( E3 + 4, bass, 0.25, 0.2 );
  var gs3bass2 = build( E3 + 4, bass, 0.25, 0.1 );
  var gs3bass3 = build( E3 + 4, bass, 0.375, 0.1 );

  var fs3bass = build( E3 + 2, bass, 0.25, 0.2 );
  var fs3bass2 = build( E3 + 2, bass, 0.25, 0.1 );
  var fs3bass3 = build( E3 + 2, bass, 0.375, 0.1 );

  var e3bass = build( E3, bass, 0.25, 0.2 );
  var e3bass2 = build( E3, bass, 0.25, 0.1 );
  var e3bass3 = build( E3, bass, 0.375, 0.1 );

  var ds3bass = build( E3 - 1, bass, 0.25, 0.2 );
  var ds3bass2 = build( E3 - 1, bass, 0.25, 0.1 );
  var ds3bass3 = build( E3 - 1, bass, 0.375, 0.1 );

  var cs3bass = build( E3 - 3, bass, 0.25, 0.2 );
  var cs3bass2 = build( E3 - 3, bass, 0.25, 0.1 );
  var cs3bass3 = build( E3 - 3, bass, 0.375, 0.1 );

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

  // playOn( e4hat, 1000 );
  playOn( e3bass, 1000 );


  var bar = 0;
  function playAll() {

    if ( bar % 4 < 3 ) {
      playOn( kicknote, 0 );
      playOn( kicknote2, 0.25 * NOTE );
      playOn( kicknote2, 0.5 * NOTE );
      playOn( snarenote, 0.75 * NOTE );
      play( e2amb, 0 );
    } else {
      playOn( bkicknote, 0 );
      playOn( kicknote2, 0.25 * NOTE );
      playOn( snarenote, 0.5 * NOTE );
      playOn( snarenote2, 0.625 * NOTE );
      playOn( snarenote2a, 0.75 * NOTE );
      playOn( snarenote3, 0.875 * NOTE );

      if ( bar % 8 < 7 ) {
        playOn( b1amb, 0 );
      } else  {
        playOn( a1amb, 0 );
      }
    }

    bar++;
  }

  function playAll2() {
    if ( bar % 3 < 1 ) {
      playOn( kicknote2, 0 );
      playOn( kicknote2, 0.66 * NOTE );
      // playOn( snarenote, 0.9 * NOTE );
      play( e2amb, 0 );
    } else if ( bar % 3 < 2 ){
      playOn( kicknote, 0 * NOTE );
      playOn( kicknote2, 0.5 * NOTE );
      playOn( snarenote, 0.33 * NOTE );
      playOn( b1amb, 0 );
    } else {
      playOn( kicknote, 0 * NOTE );
      playOn( snarenote, 0.33 * NOTE );
      // playOn( snarenote, 0.33 * NOTE );
      playOn( snarenote2, 0.83 * NOTE );
      // playOn( kicknote, 0.5 * NOTE );
      playOn( a1amb, 0 );
    }

    bar++;
  }

  // Flagrant plagiarization of the xx's Intro drum beat.
  function playAll3() {
    if ( bar % 2 < 1 ) {
      playOn( kicknote, 0 );
      if ( bar % 16 > 8 ) {
        playOn( kicknote3, 0.375 * NOTE );
      }

      playOn( snarenote, 0.5 * NOTE );
      playOn( kicknote2, 0.875 * NOTE );

    } else if ( bar % 4 < 2 ) {
      playOn( kicknote, 0.25 * NOTE );
      playOn( snarenote, 0.5 * NOTE );
      playOn( kicknote2, 0.875 * NOTE );

    } else if ( bar % 8 < 4 ){
      playOn( kicknote, 0.25 * NOTE );
      playOn( snarenote, 0.5 * NOTE );
      playOn( kicknote2, 0.75 * NOTE );

    } else if ( bar % 16 < 8 ) {
      playOn( kicknote, 0.25 * NOTE );
      playOn( snarenote, 0.5 * NOTE );
      playOn( kicknote2, 0.75 * NOTE );
      playOn( kicknote3, 0.875 * NOTE );

    } else {
      playOn( kicknote, 0.25 * NOTE );
      playOn( snarenote, 0.5 * NOTE );
      playOn( kicknote2, 0.625 * NOTE );
      playOn( snarenote2a, 0.75 * NOTE );
      playOn( snarenote3, 0.875 * NOTE );

    }

    if ( bar % 32 < 4 ) {
      playOn( gs3bass, 0 );
      playOn( gs3bass2, 0.25 * NOTE );
      playOn( gs3bass3, 0.5 * NOTE );

    } else if ( bar % 32 < 8 ) {
      playOn( fs3bass, 0 );
      playOn( fs3bass2, 0.25 * NOTE );
      playOn( fs3bass3, 0.5 * NOTE );

    } else if ( bar % 32 < 12 ) {
      playOn( e3bass, 0 );
      playOn( e3bass2, 0.25 * NOTE );
      playOn( e3bass3, 0.5 * NOTE );

    } else if ( bar % 32 < 16 ) {
      playOn( ds3bass, 0 );
      playOn( ds3bass2, 0.25 * NOTE );
      playOn( ds3bass3, 0.5 * NOTE );

    } else if ( bar % 32 < 20 ) {
      playOn( cs3bass, 0 );
      playOn( cs3bass2, 0.25 * NOTE );
      playOn( cs3bass3, 0.5 * NOTE );

    } else if ( bar % 32 < 24 ) {
      playOn( e3bass, 0 );
      playOn( e3bass2, 0.25 * NOTE );
      playOn( e3bass3, 0.5 * NOTE );

    } else if ( bar % 32 < 28 ) {
      playOn( fs3bass, 0 );
      playOn( fs3bass2, 0.25 * NOTE );
      playOn( fs3bass3, 0.5 * NOTE );

    } else {
      playOn( gs3bass, 0 );
      playOn( gs3bass2, 0.25 * NOTE );
      playOn( gs3bass3, 0.5 * NOTE );
    }

    bar++;
  }

  var pt, t;
  var time = 0;
  function tick() {
    t = Date.now();
    time += t - pt;
    pt = t;

    if ( time > NOTE ) {
      playAll3();
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
