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

var geometry = new Geometry();

geometry.push(
  // Vertices.
  [
    // Top 4.
    -0.7, -0.5, -0.7,
    -0.7, -0.5, 0.7,
    0.7, -0.5, 0.7,
    0.7, -0.5, -0.7,
    // Bottom
    0, 1, 0
  ],
  // Faces.
  [
    [ 0, 1, 4 ],
    [ 1, 2, 4 ],
    [ 2, 3, 4 ],
    [ 3, 0, 4 ],
    [ 3, 2, 1, 0 ]
  ]
).computeFaceNormals();

var material = new LambertGlowMaterial({
  // side: Material.DoubleSide,
  color: new Color( 0.5, 0.5, 0.5 ),
  strokeColor: new Color( 1, 0.5, 0.5 ),
  ambient: new Color( 0.5, 0.5, 0.5 ),
  diffuse: new Color( 0.5, 0.5, 0.5 ),
  emissive: new Color( 0, 0, 0 ),
  // fillVisible: false,
  wireframe: true,
  lineWidth: 10,
  opacity: 1,
  shadowColor: new Color( 1, 0, 0 ),
  blur: 32
});

var mesh = new Mesh( geometry, material );
scene.push( mesh );

game.ambient.setRGB( 0.2, 0.2, 0.2 );

var light = new DirectionalLight( new Color( 1, 0, 0 ) );
light.position.set( -10, 0, 0 );
scene.push( light );

var light2 = new DirectionalLight( new Color( 0, 0.4, 0 ) );
light2.position.set( 0, 10, 0 );
scene.push( light2 );

var light3 = new DirectionalLight( new Color( 0, 0, 0.4 ) );
light3.position.set( 0, -10, 0 );
scene.push( light3 );

game.ambient.setRGB( 0.5, 0.5, 0.5 );

game.camera.position.set( 0, -1, -2 );
game.camera.lookAt( mesh.position );
game.camera.updateProjectionMatrix();

game.play();
var time = 0;
mesh.update = function( dt ) {
  this.rotateY( 90 * Math.PI / 180 * dt );
  // this.rotateX( 20 * Math.PI / 180 * dt );
  time += dt;
  // game.camera.position.x = 2 * Math.sin( time );
  light3.color.r = Math.sin( time );
  light3.color.g = Math.cos( time );
};
