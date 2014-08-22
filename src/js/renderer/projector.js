'use strict';

var Vector3 = require( '../math/vector3' );
var Matrix3 = require( '../math/matrix3' );
var Matrix4 = require( '../math/matrix4' );
var Box3 = require( '../math/Box3' );

var Quad = require( '../geometry/quad' );

var Material = require( '../materials/material' );

var RenderableObject = require( './renderable-object' );
var RenderableVertex = require( './renderable-vertex' );
var RenderableFace = require( './renderable-face' );
var RenderableQuad = require( './renderable-quad' );

function Projector() {
  var _object, _objectCount, _objectPool = [],
  _vertex, _vertexCount = 0, _vertexPool = [],
  _face, _faceCount = 0, _facePool = [],
  _quadCount = 0, _quadPool = [],

  _renderData = { objects: [], elements: [] },

  _vector3 = new Vector3(),

  _clipBox = new Box3(
    new Vector3( -1, -1, -1 ),
    new Vector3(  1,  1,  1 )
  ),
  _boundingBox = new Box3(),
  _points3 = new Array( 3 ),

  _viewMatrix = new Matrix4(),
  _viewProjectionMatrix = new Matrix4(),

  _modelMatrix,
  _normalMatrix = new Matrix3();

  function RenderList() {
    var object = null,
        material = null;

    function setObject( value ) {
      object = value;
      material = object.material;
    }

    function projectVertex( vertex ) {
      var position = vertex.position;
      var positionWorld = vertex.positionWorld;
      var positionScreen = vertex.positionScreen;

      positionWorld.copy( position ).applyMatrix4( _modelMatrix );
      positionScreen.copy( positionWorld ).applyMatrix4( _viewProjectionMatrix );

      var invW = 1 / positionScreen.w;

      positionScreen.x *= invW;
      positionScreen.y *= invW;
      positionScreen.z *= invW;

      vertex.visible = -1 <= positionScreen.x && positionScreen.x <= 1 &&
        -1 <= positionScreen.y && positionScreen.y <= 1 &&
        -1 <= positionScreen.z && positionScreen.z <= 1;
    }

    function pushVertex( x, y, z ) {
      _vertex = getNextVertexInPool();
      _vertex.position.set( x, y, z );
      projectVertex( _vertex );
    }

    function checkTriangleVisibility( v0, v1, v2 ) {
      if ( v0.visible || v1.visible || v2.visible ) {
        return true;
      }

      _points3[ 0 ] = v0.positionScreen;
      _points3[ 1 ] = v1.positionScreen;
      _points3[ 2 ] = v2.positionScreen;

      return _clipBox.isIntersectionBox(
        _boundingBox.setFromPoints( _points3 )
      );
    }

    function checkBackfaceCulling( v0, v1, v2 ) {
      return ( ( v2.positionScreen.x - v0.positionScreen.x ) *
               ( v1.positionScreen.y - v0.positionScreen.y ) -
               ( v2.positionScreen.y - v0.positionScreen.y ) *
               ( v1.positionScreen.x - v0.positionScreen.x ) ) < 0;
    }

    return {
      setObject: setObject,
      projectVertex: projectVertex,
      pushVertex: pushVertex,
      checkTriangleVisibility: checkTriangleVisibility,
      checkBackfaceCulling: checkBackfaceCulling,
    };
  }

  var renderList = new RenderList();

  this.projectScene = function( scene, camera ) {
    _faceCount = 0;
    _quadCount = 0;
    _objectCount = 0;

    camera.updateMatrix();
    _viewMatrix.copy( camera.matrixWorldInverse.getInverse( camera.matrixWorld ) );
    _viewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, _viewMatrix );

    _renderData.objects.length = 0;
    _renderData.elements.length = 0;

    var object;
    var i, il;
    for ( i = 0, il = scene.length; i < il; i++ ) {
      object = scene[i];
      if ( !object.visible ) {
        continue;
      }

      object.updateMatrix();

      _object = getNextObjectInPool();
      _object.object = object;

      _vector3.setFromMatrixPosition( object.matrixWorld );
      _vector3.applyProjection( _viewProjectionMatrix );
      _object.z = _vector3.z;

      _renderData.objects.push( _object );
    }

    _renderData.objects.sort( painterSort );

    var geometry, material, side;
    var vertices, faces;
    var v, vl;
    var vertex;
    var f, fl;
    var face;
    var isQuad;
    var visible;
    var v0, v1, v2, v3;
    for ( i = 0, il = _renderData.objects.length; i < il; i++ ) {
      object = _renderData.objects[i].object;
      geometry = object.geometry;
      material = object.material;

      if ( !geometry || !material ) {
        continue;
      }

      renderList.setObject( object );
      _modelMatrix = object.matrixWorld;
      _vertexCount = 0;

      vertices = geometry.vertices;
      faces = geometry.faces;

      _normalMatrix.getNormalMatrix( _modelMatrix );
      side = material.side;

      for ( v = 0, vl = vertices.length; v < vl; v++ ) {
        vertex = vertices[v];
        renderList.pushVertex( vertex.x, vertex.y, vertex.z );
      }

      for ( f = 0, fl = faces.length; f < fl; f++ ) {
        face = faces[f];
        isQuad = face instanceof Quad;

        v0 = _vertexPool[ face.a ];
        v1 = _vertexPool[ face.b ];
        v2 = _vertexPool[ face.c ];

        if ( isQuad ) {
          v3 = _vertexPool[ face.d ];
        }

        if ( !renderList.checkTriangleVisibility( v0, v1, v2 ) ) {
          continue;
        }

        visible = renderList.checkBackfaceCulling( v0, v1, v2 );

        if ( side !== Material.DoubleSide ) {
          if ( side === Material.FrontSide && !visible ) continue;
          if ( side === Material.BackSide && visible ) continue;
        }

        _face = isQuad ? getNextQuadInPool() : getNextFaceInPool();

        _face.v0.copy( v0 );
        _face.v1.copy( v1 );
        _face.v2.copy( v2 );
        if ( isQuad ) {
          _face.v3.copy( v3 );
        }

        _face.normalModel.copy( face.normal );

        if ( !visible &&
            ( side === Material.BackSide || side === Material.DoubleSide ) ) {
          _face.normalModel.negate();
        }

        _face.normalModel.applyMatrix3( _normalMatrix )
          .normalize();

        _face.color = face.color;
        _face.material = material;

        if ( isQuad ) {
          _face.z = (
            v0.positionScreen.z +
            v1.positionScreen.z +
            v2.positionScreen.z +
            v3.positionScreen.z
          ) / 4;
        } else {
          _face.z = (
            v0.positionScreen.z +
            v1.positionScreen.z +
            v2.positionScreen.z
          ) / 3;
        }

        _renderData.elements.push( _face );
      }
    }

    // We do not sort render elements since they might be batched in the
    // canvas renderer.
    return _renderData;
  };

  function getNextObjectInPool() {
    if ( _objectCount === _objectPool.length ) {
      var object = new RenderableObject();
      _objectPool.push( object );
      _objectCount++;
      return object;
    }

    return _objectPool[ _objectCount++ ];
  }

  function getNextVertexInPool() {
    if ( _vertexCount === _vertexPool.length ) {
      var vertex = new RenderableVertex();
      _vertexPool.push( vertex );
      _vertexCount++;
      return vertex;
    }

    return _vertexPool[ _vertexCount++ ];
  }

  function getNextFaceInPool() {
    if ( _faceCount === _facePool.length ) {
      var face = new RenderableFace();
      _facePool.push( face );
      _faceCount++;
      return face;
    }

    return _facePool[ _faceCount++ ];
  }

  function getNextQuadInPool() {
    if ( _quadCount === _quadPool.length ) {
      var quad = new RenderableQuad();
      _quadPool.push( quad );
      _quadCount++;
      return quad;
    }

    return _quadPool[ _quadCount++ ];
  }

  function painterSort( a, b ) {
    return b.z - a.z;
  }
}

module.exports = Projector;
