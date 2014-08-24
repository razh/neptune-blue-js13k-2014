'use strict';

var Game = require( './game' );
var Color = require( './math/color' );
var Vector3 = require( './math/vector3' );
var Face3 = require( './geometry/face3' );
var Quad = require( './geometry/quad' );
var Geometry = require( './geometry/geometry' );
var Material = require( './materials/material' );
var LambertMaterial = require( './materials/lambert-material' );
var LambertGlowMaterial = require( './materials/lambert-glow-material' );
var Entity = require( './entities/entity' );
var DirectionalLight = require( './lights/directional-light' );

var game = new Game(
  Math.min( window.innerWidth, 568 ),
  Math.min( window.innerHeight, 320 )
);

document.body.appendChild( game.canvas );

var entities = game.entities;

var geometry = new Geometry();

// Top 4.
geometry.vertices.push( new Vector3( -0.7, -0.5, -0.7 ) );
geometry.vertices.push( new Vector3( -0.7, -0.5, 0.7 ) );
geometry.vertices.push( new Vector3( 0.7, -0.5, 0.7 ) );
geometry.vertices.push( new Vector3( 0.7, -0.5, -0.7 ) );
// Bottom
geometry.vertices.push( new Vector3( 0, 1, 0 ) );


geometry.faces.push( new Face3( 0, 1, 4 ) );
geometry.faces.push( new Face3( 1, 2, 4 ) );
geometry.faces.push( new Face3( 2, 3, 4 ) );
geometry.faces.push( new Face3( 3, 0, 4 ) );
geometry.faces.push( new Quad( 3, 2, 1, 0 ) );
geometry.computeFaceNormals();

var material = new LambertGlowMaterial({
  // side: Material.DoubleSide,
  color: new Color( 0.5, 0.5, 0.5 ),
  ambient: new Color( 0.5, 0.5, 0.5 ),
  diffuse: new Color( 0.5, 0.5, 0.5 ),
  emissive: new Color( 0, 0, 0 ),
  // fillVisible: false,
  wireframe: true,
  opacity: 1,
  shadowColor: new Color( 1, 0, 0 ),
  blur: 32
});

var entity = new Entity( geometry, material );
entities.push( entity );

game.ambient.setRGB( 0.2, 0.2, 0.2 );

var light = new DirectionalLight( new Color( 1, 0, 0 ) );
light.position.set( -10, 0, 0 );
light.updateMatrix();
game.lights.push( light );

var light2 = new DirectionalLight( new Color( 0, 0.4, 0 ) );
light2.position.set( 0, 10, 0 );
light2.updateMatrix();
game.lights.push( light2 );

var light3 = new DirectionalLight( new Color( 0, 0, 0.4 ) );
light3.position.set( 0, -10, 0 );
light3.updateMatrix();
game.lights.push( light3 );

game.ambient.setRGB( 0.5, 0.5, 0.5 );

game.camera.position.set( 0, -1, -2 );
game.camera.lookAt( entity.position );
game.camera.updateProjectionMatrix();

game.play();
var time = 0;
entity.update = function( dt ) {
  this.rotateY( 90 * Math.PI / 180 * dt );
  // this.rotateX( 20 * Math.PI / 180 * dt );
  time += dt;
  // game.camera.position.x = 2 * Math.sin( time );
  light3.color.r = Math.sin( time );
  light3.color.g = Math.cos( time );
};
