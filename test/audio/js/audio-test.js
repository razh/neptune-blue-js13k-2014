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
    '\x88\x58\x01\x00' +
    '\x02\x00' +
    '\x10\x00' +
    'data' +
    '\x22\x56'
  );

  var prefix = 'data:audio/wav;base64,UklGRjUrAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YSJW';

  var A1 = 33;
  var A2 = 45;
  var A3 = 57;
  var A4 = 69;

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
      wave *= 32767;
      sound += String.fromCharCode( wave & 0xFF );
      sound += String.fromCharCode( ( wave >> 8 ) & 0xFF );
    }

    return sound;
  }

  // Based off of dsp.js.
  function adsrFn( attack, decay, sustain, release, sustainLevel ) {
    decay += attack;
    sustain += decay;
    release += sustain;
    console.log( attack, decay, sustain, release );

    return function adsr( time ) {
      var amplitude = 0;

      if ( time <= attack ) {
        amplitude = time / attack;
      } else if ( time <= decay ) {
        amplitude = 1 + ( sustainLevel - 1 ) * ( time - attack ) / ( decay - attack );
      } else if ( time <= sustain ) {
        amplitude = sustainLevel;
      } else if ( time <= release ) {
        amplitude = sustainLevel * ( 1 - ( time - sustain ) / ( release - sustain ) );
      }

      return amplitude;
    };
  }

  function waveformFn( noise, decay ) {
    return function waveform( sample, time ) {
      var wave = _.clamp( sine( sample ) + _.randFloatSpread( noise ), -1, 1 );
      var env = Math.exp( -time * decay );
      return wave * env;
    };
  }

  function waveformADSRFn( noise, adsr ) {
    return function waveformADSR( sample, time ) {
      var wave = _.clamp( sine( sample ) + _.randFloatSpread( noise ), -1, 1 );
      return wave * adsr( time );
    };
  }

  function bell( sample, time ) {
    var wave = _.lerp( square( sample ), sine( sample ), 0.4 );
    var env = Math.exp( -time * 2 );
    if ( time > 0.5 ) {
      env *= 2 - 2 * time;
    }

    return wave * env;
  }

  function sine( sample ) {
    return Math.sin( sample * 2 * Math.PI );
  }

  function square( sample ) {
    return ( sample % 1 ) < 0.5 ? 1 : -1;
  }

  var kick = waveformFn( 0.1, 32 );
  var snare = waveformFn( 0.8, 16 );

  var kickADSR = waveformADSRFn( 0, adsrFn( 0.01, 0.1, 0.1, 0.1, 0.2 ) );

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
    var env = Math.exp( -time * 8 );
    return wave * env;
  }

  function build( note, fn, duration, volume, detune ) {
    detune = detune || 0;
    return create( generate( toFreq( note ) + detune, duration, fn ), volume );
  }


  var GS1 = E3 - 20;
  var GS2 = E3 - 8;
  var GS3 = E3 + 4;
  var GS4 = E3 + 16;

  var FS2 = E3 - 10;
  var FS3 = E3 + 2;
  var FS4 = E3 + 14;

  var DS2 = E3 - 13;
  var DS3 = E3 - 1;
  var DS4 = E3 + 11;

  var CS2 = E3 - 15;
  var CS3 = E3 - 3;
  var CS4 = E3 + 9;


  var b1note = build( B1, bell, 2, 0.05 );
  var b2note = build( B2, bell, 2, 0.05 );
  var b3note = build( B3, bell, 2, 0.05 );
  var b4note = build( B4, bell, 2, 0.05 );

  var e1note = build( E1, bell, 2, 0.05 );
  var e2note = build( E2, bell, 2, 0.05 );
  var e3note = build( E3, bell, 2, 0.05 );
  var e4note = build( E4, bell, 2, 0.05 );

  var a1note = build( A1, bell, 2, 0.05 );
  var a2note = build( A2, bell, 2, 0.05 );
  var a3note = build( A3, bell, 2, 0.05 );
  var a4note = build( A4, bell, 2, 0.05 );

  var gs1note = build( GS1, bell, 2, 0.05 );
  var gs2note = build( GS2, bell, 2, 0.05 );
  var gs3note = build( GS3, bell, 2, 0.05 );

  var fs2note = build( FS2, bell, 2, 0.05 );
  var fs3note = build( FS3, bell, 2, 0.05 );

  var ds2note = build( DS2, bell, 2, 0.05 );
  var ds3note = build( DS3, bell, 2, 0.05 );
  var ds4note = build( DS4, bell, 2, 0.05 );

  var cs2note = build( CS2, bell, 2, 0.05 );
  var cs3note = build( CS3, bell, 2, 0.05 );
  var cs4note = build( CS4, bell, 2, 0.05 );

  var e4hat = build( B4, hat, 0.05, 0.02 );

  var snarenote = build( E3, snare, 0.25, 0.3 );
  var snarenote2 = build( E3, snare, 0.25, 0.2 );
  var snarenote2a = build( E3, snare, 0.25, 0.2 );
  var snarenote3 = build( E3, snare, 0.3, 0.4 );

  var kicknote = build( E1, kick, 0.5, 1 );
  var bkicknote = build( B1, kick, 0.5, 0.8 );
  var kicknote2 = build( E1, kick, 0.5, 0.6 );
  var kicknote3 = build( E1, kick, 0.5, 0.6 );

  var b1amb = build( B1, ambience, 1, 0.1 );
  var e2amb = build( E2, ambience, 1, 0.1 );
  var a1amb = build( A1, ambience, 1, 0.1 );
  var a2amb = build( A2, ambience, 1, 0.1 );
  var e3amb1 = build( E3, ambience, 1, 0.01, 1 );
  var e2amb1n = build( E2, ambience, 1, 0.1, -1 );

  var e2bass = build( E2, bass, 0.25, 0.2 );

  var gs3bass = build( GS3, bass, 0.4, 0.3 );
  var gs3bass2 = build( GS3, bass, 0.4, 0.2 );
  var gs4bass2 = build( GS4, bass, 0.4, 0.2 );
  var gs3bass3 = build( GS3, bass, 0.5, 0.2 );

  var fs3bass = build( FS3, bass, 0.4, 0.3 );
  var fs3bass2 = build( FS3, bass, 0.4, 0.2 );
  var fs4bass2 = build( FS4, bass, 0.4, 0.2 );
  var fs3bass3 = build( FS3, bass, 0.5, 0.2 );

  var e3bass = build( E3, bass, 0.4, 0.3 );
  var e3bass2 = build( E3, bass, 0.4, 0.2 );
  var e4bass2 = build( E4, bass, 0.4, 0.2 );
  var e3bass3 = build( E3, bass, 0.5, 0.2 );

  var ds3bass = build( DS3, bass, 0.4, 0.3 );
  var ds3bass2 = build( DS3, bass, 0.4, 0.2 );
  var ds4bass2 = build( DS4, bass, 0.4, 0.2 );
  var ds3bass3 = build( DS3, bass, 0.5, 0.2 );

  var cs3bass = build( CS3, bass, 0.4, 0.3 );
  var cs3bass2 = build( CS3, bass, 0.4, 0.2 );
  var cs4bass2 = build( CS4, bass, 0.4, 0.2 );
  var cs3bass3 = build( CS3, bass, 0.5, 0.2 );

  var kicknoteADSR = build( E3, kickADSR, 1, 0.5 );

  function playOn( sound, delay ) {
    setTimeout(function() {
      play( sound );
    }, delay );
  }

  var BPM = 140;
  var NOTE = 2 * 60 / BPM * 1000;
  play( kicknote, 500 );
  // playOn( snarenote, 800 );
  // playOn( e4note, 0.75 * NOTE );

  // playOn( e4hat, 1000 );
  playOn( e3bass, 1500 );
  playOn( e3note, 2000 );
  playOn( kicknoteADSR, 1000 );


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
      if ( bar % 16 >= 12 ) {
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

    var bassIndex = bar % 32;
    if ( bassIndex < 4 ) {
      playBass3( gs3bass, gs3bass2, gs3bass3 );
    } else if ( bassIndex < 8 ) {
      playBass3( fs3bass, fs3bass2, fs3bass3 );
    } else if ( bassIndex < 12 ) {
      playBass3( e3bass, e3bass2, e3bass3 );
    } else if ( bassIndex < 16 ) {
      playBass3( ds3bass, ds3bass2, ds3bass3 );
    } else if ( bassIndex < 20 ) {
      playBass3( cs3bass, cs3bass2, cs3bass3 );
    } else if ( bassIndex < 24 ) {
      playBass3( e3bass, e3bass2, e3bass3 );
    } else if ( bassIndex < 28 ) {
      playBass3( fs3bass, fs3bass2, fs3bass3 );
    } else {
      playBass3( gs3bass, gs3bass2, gs3bass3 );
    }

    // if ( bassIndex < 1 ) {
    //   playOn( gs2note, 0.5 * NOTE );
    //   playOn( gs3note, 0.5 * NOTE );
    // } else if ( bassIndex < 2 ) {
    //   playOn( cs3note, 0 * NOTE );
    //   playOn( cs4note, 0 * NOTE );
    // } else if ( bassIndex < 3 ) {
    //   playOn( gs2note, 0.5 * NOTE );
    //   playOn( gs3note, 0.5 * NOTE );
    // } else if ( bassIndex < 4 ) {
    //   playOn( cs3note, 0 * NOTE );
    //   playOn( cs4note, 0 * NOTE );
    // } else if ( bassIndex < 5 ) {
    //   playOn( b2note, 0 * NOTE );
    //   playOn( b3note, 0 * NOTE );
    // } else if ( bassIndex === 7 ) {
    //   playOn( gs2note, 0.5 * NOTE );
    //   playOn( gs3note, 0.5 * NOTE );
    // } else if ( bassIndex === 8 ) {
    //   playOn( b2note, 0 * NOTE );
    //   playOn( b3note, 0 * NOTE );
    // } else if ( bassIndex === 9 ) {
    //   playOn( gs2note, 0.5 * NOTE );
    //   playOn( gs3note, 0.5 * NOTE );
    // }

    bar++;
  }

  function playBass3( b0, b1, b2 ) {
    playOn( b0, 0 );
    playOn( b1, 0.25 * NOTE );
    playOn( b2, 0.5 * NOTE );
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
