'use strict';

var Vector3 = require( '../math/vector3' );

// Temp vectors.
var cb = new Vector3(),
    ab = new Vector3();

function Geometry() {
  this.vertices = [];
  this.faces = [];
}

Geometry.prototype.computeFaceNormals = function() {
  var face;
  var vA, vB, vC;
  for ( var f = 0, fl = this.faces.length; f < fl; f++ ) {
    face = this.faces[f];

    vA = this.vertices[ face.a ];
    vB = this.vertices[ face.b ];
    vC = this.vertices[ face.c ];

    cb.subVectors( vC, vB );
    ab.subVectors( vA, vB );

    cb.cross( ab ).normalize();
    face.normal.copy( cb );
  }
};

module.exports = Geometry;
