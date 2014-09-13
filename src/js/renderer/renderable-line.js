'use strict';

var RenderableVertex = require( './renderable-vertex' );

function RenderableLine() {
  this.v0 = new RenderableVertex();
  this.v1 = new RenderableVertex();

  this.z = 0;
}

module.exports = RenderableLine;
