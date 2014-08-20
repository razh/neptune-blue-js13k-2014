'use strict';

var RenderableVertex = require( './renderable-vertex' );
var RenderableFace = require( './renderable-Face' );

function RenderableQuad() {
  RenderableFace.call( this );
  this.v3 = new RenderableVertex();
}

RenderableQuad.prototype = Object.create( RenderableFace.prototype );
RenderableQuad.prototype.constructor = RenderableQuad;

module.exports = RenderableQuad;
