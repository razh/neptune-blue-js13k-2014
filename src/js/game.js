/*global requestAnimationFrame*/
'use strict';

function Game() {
  this.canvas = document.createElement( 'canvas' );
  this.ctx = this.canvas.getContext( '2d' );

  this.running = false;
  this.prevTime = 0;
  this.currTime = 0;

  this.entities = [];

  this.tick = this.tick.bind( this );
}

Game.prototype.tick = function() {
  if ( !this.running ) {
    return;
  }

  this.update();
  this.draw();
  requestAnimationFrame( this.tick );
};

Game.prototype.update = function() {
  this.currTime = Date.now();
  var dt = this.currTime - this.prevTime;
  this.prevTime = this.currTime;

  if ( dt > 1e2 ) {
    dt = 1e2;
  }

  dt *= 1e-3;

  this.entities.forEach(function( entity ) {
    entity.update( dt );
  });
};

Game.prototype.draw = function() {
  var ctx = this.ctx;

  this.entities.forEach(function( entity ) {
    entity.draw( ctx );
  });
};

Game.prototype.play = function() {
  this.running = true;
  this.prevTime = Date.now();
  requestAnimationFrame( this.tick );
};

Game.prototype.pause = function() {
  this.running = false;
};

module.exports = Game;
