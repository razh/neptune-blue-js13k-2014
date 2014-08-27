'use strict';

var Color = require( '../math/color' );
var Vector3 = require( '../math/vector3' );

var RenderableFace = require( './renderable-face' );
var RenderableQuad = require( './renderable-quad' );

var Projector = require( './projector' );

var LambertMaterial = require( '../materials/lambert-material' );

function Renderer( options ) {
  options = options || {};

  var _this = this,
  _renderData, _elements,
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
  _directionalLights = options.lights,
  _directionalIntensity = 0,

  _vector3 = new Vector3();

  if ( !_ctx ) {
    return;
  }

  // Set default line attributes to avoid miters.
  _ctx.lineCap = 'round';
  _ctx.lineJoin = 'round';

  this.info = {
    render: {
      vertices: 0,
      faces: 0,
      quads: 0
    }
  };

  this.clear = function() {
    _ctx.clearRect( 0, 0, _ctx.canvas.width, _ctx.canvas.height );
  };

  this.render = function( scene, camera ) {
    this.clear();

    _this.info.render.vertices = 0;
    _this.info.render.faces = 0;
    _this.info.render.quads = 0;

    _canvasWidth  = _ctx.canvas.width;
    _canvasHeight = _ctx.canvas.height;
    _canvasWidthHalf = _canvasWidth / 2;
    _canvasHeightHalf = _canvasHeight / 2;

    _ctx.save();

    _ctx.setTransform( 1, 0, 0, -1, 0, _canvasHeight );
    _ctx.translate( _canvasWidthHalf, _canvasHeightHalf );

    _renderData = _projector.projectScene( scene, camera );
    _elements = _renderData.elements;
    _camera = camera;

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

  function calculateLight( element, material, color ) {
    var normal = element.normalModel;
    // Cumulative intensity of directional lights.
    var intensity = 0;
    var light;
    for ( var l = 0, ll = _directionalLights.length; l < ll; l++ ) {
      light = _directionalLights[l];

      var lightPosition = _vector3
        .setFromMatrixPosition( light.matrixWorld )
        .normalize();

      var amount = normal.dot( lightPosition );
      if ( amount <= 0 ) {
        continue;
      }

      amount *= light.intensity;
      if ( !material.filter || material.filter.collides( light.filter ) ) {
        intensity += amount;
      }

      _lightColor.copy( light.color )
        .multiplyScalar( amount );

      color.add( _lightColor );
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

    if ( material instanceof LambertMaterial ) {
      _diffuseColor.copy( material.color );
      _emissiveColor.copy( material.emissive );
      _color.copy( _ambientLight );

      _directionalIntensity = calculateLight( element, material, _color );

      _color.multiply( _diffuseColor ).add( _emissiveColor );
      material.draw( _ctx, _color, _directionalIntensity );
    } else if ( !material.batch ) {
      material.draw( _ctx );
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
