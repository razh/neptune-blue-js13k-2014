'use strict';

var Game = require( './game' );
var Color = require( './math/color' );
var Geometry = require( './geometry/geometry' );
var Material = require( './materials/material' );
var LambertMaterial = require( './materials/lambert-material' );
var LambertGlowMaterial = require( './materials/lambert-glow-material' );
var Mesh = require( './objects/mesh' );
var DirectionalLight = require( './lights/directional-light' );

var $ = document.querySelector.bind( document );

function on( el, type, listener ) {
  el.addEventListener( type, listener );
}

function off( el, type, listener ) {
  el.removeEventListener( type, listener );
}

function create( type ) {
  return document.createElement( type );
}

function append( parent, el ) {
  parent.appendChild( el );
}

function prepend( parent, el ) {
  parent.insertBefore( el, parent.firstChild );
}

function remove( el ) {
  if ( el.parentNode ) {
    el.parentNode.removeChild( el );
  }
}

function textContent( el, text ) {
  el.textContent = text;
}

function addClass( el, className ) {
  el.classList.add( className );
}

function removeClass( el, className ) {
  el.classList.remove( className );
}


var game = new Game(
  Math.min( window.innerWidth, 568 ),
  Math.min( window.innerHeight, 320 )
);

document.body.appendChild( game.canvas );

var scene = game.scene;
