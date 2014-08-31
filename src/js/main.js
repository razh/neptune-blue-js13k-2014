'use strict';

var Game = require( './game' );
var Color = require( './math/color' );
var Geometry = require( './geometry/geometry' );
var Material = require( './materials/material' );
var LambertMaterial = require( './materials/lambert-material' );
var LambertGlowMaterial = require( './materials/lambert-glow-material' );
var Mesh = require( './objects/mesh' );
var DirectionalLight = require( './lights/directional-light' );

var game = new Game(
  Math.min( window.innerWidth, 568 ),
  Math.min( window.innerHeight, 320 )
);

document.body.appendChild( game.canvas );

var scene = game.scene;
