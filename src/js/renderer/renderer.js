'use strict';

var Color = require( '../math/color' );
var Vector3 = require( '../math/vector3' );
var Utils = require( '../math/utils' );

var RenderableFace = require( './renderable-face' );
var RenderableQuad = require( './renderable-quad' );

var Projector = require( './projector' );

var PointLight = require( '../lights/point-light' );
var LambertMaterial = require( '../materials/lambert-material' );

function Renderer( options ) {
  options = options || {};

  var _this = this,
  _renderData, _elements, _lights,
  _projector = new Projector(),

  _ctx = options.ctx,

  _canvasWidth,
  _canvasHeight,
  _canvasWidthHalf,
  _canvasHeightHalf,

  _camera,

  _v0, _v1, _v2, _v3,

  _v0x, _v0y,
  _v1x, _v1y,
  _v2x, _v2y,
  _v3x, _v3y,

  _color = new Color(),
  _diffuseColor = new Color(),
  _emissiveColor = new Color(),
  _lightColor = new Color(),

  _ambientLight = options.ambient || new Color(),
  _intensity = 0,
  _fogDensity,

  _vector3 = new Vector3(),
  _centroid = new Vector3();

  if ( !_ctx ) {
    return;
  }

  // Set default line attributes to avoid miters.
  _ctx.lineCap = _ctx.lineJoin = 'round';

  this.info = {
    render: {
      vertices: 0,
      faces: 0,
      quads: 0
    }
  };

  this.clear = function( width, height ) {
    _ctx.clearRect( 0, 0, width, height );
  };

  this.render = function( scene, camera ) {
    _this.info.render.vertices = 0;
    _this.info.render.faces = 0;
    _this.info.render.quads = 0;

    _canvasWidth  = _ctx.canvas.width;
    _canvasHeight = _ctx.canvas.height;
    _canvasWidthHalf = _canvasWidth / 2;
    _canvasHeightHalf = _canvasHeight / 2;

    this.clear( _canvasWidth, _canvasHeight );

    _ctx.save();

    _ctx.setTransform( 1, 0, 0, -1, 0, _canvasHeight );
    _ctx.translate( _canvasWidthHalf, _canvasHeightHalf );

    _renderData = _projector.projectScene( scene, camera );
    _elements = _renderData.elements;
    _lights = _renderData.lights;
    _camera = camera;

    _fogDensity = scene.fogDensity;

    var element, material, prevMaterial;
    var isQuad;
    for ( var e = 0, el = _elements.length; e < el; e++ ) {
      element = _elements[e];
      material = element.material;

      if ( !material || !material.opacity ) {
        continue;
      }

      if ( material !== prevMaterial ) {
        // End batch drawing.
        if ( prevMaterial && prevMaterial.batch ) {
          prevMaterial.draw( _ctx );
        }

        // Set basic properties.
        material.set( _ctx );

        // Start batch drawing.
        if ( material.batch ) {
          _ctx.beginPath();
        }
      }

      prevMaterial = material;

      if ( element instanceof RenderableFace ||
           element instanceof RenderableQuad ) {
        isQuad = element instanceof RenderableQuad;

        _v0 = element.v0;
        _v1 = element.v1;
        _v2 = element.v2;
        if ( isQuad ) {
          _v3 = element.v3;
        }

        if ( -1 > _v0.positionScreen.z || _v0.positionScreen.z > 1 ) { continue; }
        if ( -1 > _v1.positionScreen.z || _v1.positionScreen.z > 1 ) { continue; }
        if ( -1 > _v2.positionScreen.z || _v2.positionScreen.z > 1 ) { continue; }
        if ( isQuad &&
             ( -1 > _v3.positionScreen.z || _v3.positionScreen.z > 1 ) ) {
          continue;
        }

        // Start non-batch individal element drawing.
        if ( !material.batch ) {
          _ctx.beginPath();
        }

        _v0.positionScreen.x *= _canvasWidthHalf;
        _v0.positionScreen.y *= _canvasHeightHalf;
        _v1.positionScreen.x *= _canvasWidthHalf;
        _v1.positionScreen.y *= _canvasHeightHalf;
        _v2.positionScreen.x *= _canvasWidthHalf;
        _v2.positionScreen.y *= _canvasHeightHalf;

        if ( isQuad ) {
          _v3.positionScreen.x *= _canvasWidthHalf;
          _v3.positionScreen.y *= _canvasHeightHalf;

          renderFace( element, material, isQuad, _v0, _v1, _v2, _v3 );
        } else {
          renderFace( element, material, isQuad, _v0, _v1, _v2 );
        }
      }
    }

    // End batch drawing for last element(s).
    if ( prevMaterial && prevMaterial.batch ) {
      prevMaterial.draw( _ctx );
    }

    _ctx.restore();
  };

  function calculateLight( element, position, material, color ) {
    var normal = element.normalModel;
    // Cumulative blur intensity of directional lights.
    var intensity = 0;
    var light, lightPosition, isPointLight;
    var amount;
    for ( var l = 0, ll = _lights.length; l < ll; l++ ) {
      light = _lights[l];
      _lightColor.copy( light.color );

      lightPosition = _vector3.setFromMatrixPosition( light.matrixWorld );

      isPointLight = light instanceof PointLight;
      if ( isPointLight ) {
        amount = normal.dot( _vector3.subVectors( lightPosition, position ).normalize() );
      } else {
        amount = normal.dot( lightPosition.normalize() );
      }

      if ( amount <= 0 ) {
        continue;
      }

      if ( isPointLight ) {
        amount *= light.distance ?
          1 - Math.min( position.distanceTo( lightPosition ) / light.distance, 1 )
          : 1;

        if ( !amount ) {
          continue;
        }
      }

      amount *= light.intensity;

      // Blur filter.
      if ( !material.filter || material.filter.collides( light.filter ) ) {
        intensity += amount;
      }

      color.add( _lightColor.multiplyScalar( amount ) );
    }

    return intensity;
  }

  function renderFace( element, material, isQuad, v0, v1, v2, v3 ) {
    _this.info.render.vertices += isQuad ? 4 : 3;

    _v0x = v0.positionScreen.x;
    _v0y = v0.positionScreen.y;
    _v1x = v1.positionScreen.x;
    _v1y = v1.positionScreen.y;
    _v2x = v2.positionScreen.x;
    _v2y = v2.positionScreen.y;

    if ( isQuad ) {
      _v3x = v3.positionScreen.x;
      _v3y = v3.positionScreen.y;

      drawQuad( _v0x, _v0y, _v1x, _v1y, _v2x, _v2y, _v3x, _v3y );
      _this.info.render.quads++;
    } else {
      drawTriangle( _v0x, _v0y, _v1x, _v1y, _v2x, _v2y );
      _this.info.render.faces++;
    }

    var fogAlpha = 1;
    if ( !material.batch ) {
      // Compute fogAlpha.
      if ( _fogDensity ) {
        var w = v0.positionScreen.w + v1.positionScreen.w + v2.positionScreen.w;
        w = isQuad ? ( ( w + v3.positionScreen.w ) / 4 ) : w / 3;
        // w here is clip.w, where gl_FragCoord.w = 1 / clip.w.
        var depth = element.z * w;

        fogAlpha = Utils.clamp(
          Math.pow( 2, -_fogDensity * _fogDensity * depth * depth / Math.LN2 ),
          0, 1
        );
      }

      if ( material instanceof LambertMaterial ) {
        _diffuseColor.copy( material.color );
        _emissiveColor.copy( material.emissive );
        _color.copy( _ambientLight );

        _centroid.copy( v0.positionWorld )
          .add( v1.positionWorld )
          .add( v2.positionWorld );

        if ( isQuad ) {
          _centroid.add( v3.positionWorld ).multiplyScalar( 1 / 4 );
        } else {
          _centroid.multiplyScalar( 1 / 3 );
        }

        _intensity = calculateLight( element, _centroid, material, _color );

        _color.multiply( _diffuseColor ).add( _emissiveColor );
        material.draw( _ctx, _color, fogAlpha, _intensity );
      } else {
        material.draw( _ctx, fogAlpha );
      }
    }
  }

  function drawTriangle( x0, y0, x1, y1, x2, y2 ) {
    _ctx.moveTo( x0, y0 );
    _ctx.lineTo( x1, y1 );
    _ctx.lineTo( x2, y2 );
    _ctx.lineTo( x0, y0 );
  }

  function drawQuad( x0, y0, x1, y1, x2, y2, x3, y3 ) {
    _ctx.moveTo( x0, y0 );
    _ctx.lineTo( x1, y1 );
    _ctx.lineTo( x2, y2 );
    _ctx.lineTo( x3, y3 );
    _ctx.lineTo( x0, y0 );
  }
}

module.exports = Renderer;
