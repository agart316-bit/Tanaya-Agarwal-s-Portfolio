/* =========================================================
   liquid-ether-vanilla.js  (v2 — full rewrite)
   Vanilla JS port of the LiquidEther React component.
   Requires THREE.js r128 on window.THREE.

   Usage:
     const le = new LiquidEther(containerElement, options);
     le.start();
     le.dispose();
========================================================= */

(function (global) {
  'use strict';

  /* ----------------------------------------------------------
     GLSL SHADERS
  ---------------------------------------------------------- */
  var SHADERS = {
    face_vert: [
      'precision highp float;',
      'attribute vec3 position;',
      'uniform vec2 px;',
      'uniform vec2 boundarySpace;',
      'varying vec2 uv;',
      'void main(){',
      '  vec3 pos = position;',
      '  vec2 scale = 1.0 - boundarySpace * 2.0;',
      '  pos.xy = pos.xy * scale;',
      '  uv = vec2(0.5) + pos.xy * 0.5;',
      '  gl_Position = vec4(pos, 1.0);',
      '}'
    ].join('\n'),

    line_vert: [
      'precision highp float;',
      'attribute vec3 position;',
      'uniform vec2 px;',
      'varying vec2 uv;',
      'void main(){',
      '  vec3 pos = position;',
      '  uv = 0.5 + pos.xy * 0.5;',
      '  vec2 n = sign(pos.xy);',
      '  pos.xy = abs(pos.xy) - px * 1.0;',
      '  pos.xy *= n;',
      '  gl_Position = vec4(pos, 1.0);',
      '}'
    ].join('\n'),

    mouse_vert: [
      'precision highp float;',
      'attribute vec3 position;',
      'attribute vec2 uv;',
      'uniform vec2 center;',
      'uniform vec2 scale;',
      'uniform vec2 px;',
      'varying vec2 vUv;',
      'void main(){',
      '  vec2 pos = position.xy * scale * 2.0 * px + center;',
      '  vUv = uv;',
      '  gl_Position = vec4(pos, 0.0, 1.0);',
      '}'
    ].join('\n'),

    advection_frag: [
      'precision highp float;',
      'uniform sampler2D velocity;',
      'uniform float dt;',
      'uniform bool isBFECC;',
      'uniform vec2 fboSize;',
      'uniform vec2 px;',
      'varying vec2 uv;',
      'void main(){',
      '  vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;',
      '  if(isBFECC == false){',
      '    vec2 vel = texture2D(velocity, uv).xy;',
      '    vec2 uv2 = uv - vel * dt * ratio;',
      '    vec2 newVel = texture2D(velocity, uv2).xy;',
      '    gl_FragColor = vec4(newVel, 0.0, 0.0);',
      '  } else {',
      '    vec2 spot_new = uv;',
      '    vec2 vel_old = texture2D(velocity, uv).xy;',
      '    vec2 spot_old = spot_new - vel_old * dt * ratio;',
      '    vec2 vel_new1 = texture2D(velocity, spot_old).xy;',
      '    vec2 spot_new2 = spot_old + vel_new1 * dt * ratio;',
      '    vec2 error = spot_new2 - spot_new;',
      '    vec2 spot_new3 = spot_new - error / 2.0;',
      '    vec2 vel_2 = texture2D(velocity, spot_new3).xy;',
      '    vec2 spot_old2 = spot_new3 - vel_2 * dt * ratio;',
      '    vec2 newVel2 = texture2D(velocity, spot_old2).xy;',
      '    gl_FragColor = vec4(newVel2, 0.0, 0.0);',
      '  }',
      '}'
    ].join('\n'),

    color_frag: [
      'precision highp float;',
      'uniform sampler2D velocity;',
      'uniform sampler2D palette;',
      'uniform vec4 bgColor;',
      'varying vec2 uv;',
      'void main(){',
      '  vec2 vel = texture2D(velocity, uv).xy;',
      '  float lenv = clamp(length(vel), 0.0, 1.0);',
      '  vec3 c = texture2D(palette, vec2(lenv, 0.5)).rgb;',
      '  vec3 outRGB = mix(bgColor.rgb, c, lenv);',
      '  float outA = mix(bgColor.a, 1.0, lenv);',
      '  gl_FragColor = vec4(outRGB, outA);',
      '}'
    ].join('\n'),

    divergence_frag: [
      'precision highp float;',
      'uniform sampler2D velocity;',
      'uniform float dt;',
      'uniform vec2 px;',
      'varying vec2 uv;',
      'void main(){',
      '  float x0 = texture2D(velocity, uv - vec2(px.x, 0.0)).x;',
      '  float x1 = texture2D(velocity, uv + vec2(px.x, 0.0)).x;',
      '  float y0 = texture2D(velocity, uv - vec2(0.0, px.y)).y;',
      '  float y1 = texture2D(velocity, uv + vec2(0.0, px.y)).y;',
      '  float divergence = (x1 - x0 + y1 - y0) / 2.0;',
      '  gl_FragColor = vec4(divergence / dt);',
      '}'
    ].join('\n'),

    externalForce_frag: [
      'precision highp float;',
      'uniform vec2 force;',
      'uniform vec2 center;',
      'uniform vec2 scale;',
      'uniform vec2 px;',
      'varying vec2 vUv;',
      'void main(){',
      '  vec2 circle = (vUv - 0.5) * 2.0;',
      '  float d = 1.0 - min(length(circle), 1.0);',
      '  d *= d;',
      '  gl_FragColor = vec4(force * d, 0.0, 1.0);',
      '}'
    ].join('\n'),

    poisson_frag: [
      'precision highp float;',
      'uniform sampler2D pressure;',
      'uniform sampler2D divergence;',
      'uniform vec2 px;',
      'varying vec2 uv;',
      'void main(){',
      '  float p0 = texture2D(pressure, uv + vec2(px.x * 2.0, 0.0)).r;',
      '  float p1 = texture2D(pressure, uv - vec2(px.x * 2.0, 0.0)).r;',
      '  float p2 = texture2D(pressure, uv + vec2(0.0, px.y * 2.0)).r;',
      '  float p3 = texture2D(pressure, uv - vec2(0.0, px.y * 2.0)).r;',
      '  float div = texture2D(divergence, uv).r;',
      '  float newP = (p0 + p1 + p2 + p3) / 4.0 - div;',
      '  gl_FragColor = vec4(newP);',
      '}'
    ].join('\n'),

    pressure_frag: [
      'precision highp float;',
      'uniform sampler2D pressure;',
      'uniform sampler2D velocity;',
      'uniform vec2 px;',
      'uniform float dt;',
      'varying vec2 uv;',
      'void main(){',
      '  float p0 = texture2D(pressure, uv + vec2(px.x, 0.0)).r;',
      '  float p1 = texture2D(pressure, uv - vec2(px.x, 0.0)).r;',
      '  float p2 = texture2D(pressure, uv + vec2(0.0, px.y)).r;',
      '  float p3 = texture2D(pressure, uv - vec2(0.0, px.y)).r;',
      '  vec2 v = texture2D(velocity, uv).xy;',
      '  vec2 gradP = vec2(p0 - p1, p2 - p3) * 0.5;',
      '  v = v - gradP * dt;',
      '  gl_FragColor = vec4(v, 0.0, 1.0);',
      '}'
    ].join('\n'),

    viscous_frag: [
      'precision highp float;',
      'uniform sampler2D velocity;',
      'uniform sampler2D velocity_new;',
      'uniform float v;',
      'uniform vec2 px;',
      'uniform float dt;',
      'varying vec2 uv;',
      'void main(){',
      '  vec2 old = texture2D(velocity, uv).xy;',
      '  vec2 n0 = texture2D(velocity_new, uv + vec2(px.x * 2.0, 0.0)).xy;',
      '  vec2 n1 = texture2D(velocity_new, uv - vec2(px.x * 2.0, 0.0)).xy;',
      '  vec2 n2 = texture2D(velocity_new, uv + vec2(0.0, px.y * 2.0)).xy;',
      '  vec2 n3 = texture2D(velocity_new, uv - vec2(0.0, px.y * 2.0)).xy;',
      '  vec2 newv = 4.0 * old + v * dt * (n0 + n1 + n2 + n3);',
      '  newv /= 4.0 * (1.0 + v * dt);',
      '  gl_FragColor = vec4(newv, 0.0, 0.0);',
      '}'
    ].join('\n')
  };

  /* ----------------------------------------------------------
     LiquidEther constructor
  ---------------------------------------------------------- */
  function LiquidEther(container, userOpts) {
    var THREE = global.THREE;
    if (!THREE) { console.error('LiquidEther: THREE.js not found'); return; }

    var self = this;

    /* --- options --- */
    var opts = Object.assign({
      mouseForce:        20,
      cursorSize:        85,
      isViscous:         false,
      viscous:           30,
      iterationsViscous: 32,
      iterationsPoisson: 25,
      dt:                0.014,
      BFECC:             true,
      resolution:        0.5,
      isBounce:          false,
      colors:            ['#41051dff', '#ff9fc2ff', '#992d68ff'],
      autoDemo:          true,
      autoSpeed:         0.3,
      autoIntensity:     1,
      takeoverDuration:  0.25,
      autoResumeDelay:   3000,
      autoRampDuration:  0.6,
    }, userOpts || {});

    /* --- internal state --- */
    var running   = false;
    var rafId     = null;
    var isVisible = true;
    var resizeRaf = null;
    var lastInteraction = performance.now();

    /* --- container --- */
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }
    container.style.overflow = 'hidden';

    /* --- measure size --- */
    function getSize() {
      var r = container.getBoundingClientRect();
      return {
        cw: Math.max(1, Math.floor(r.width)),
        ch: Math.max(1, Math.floor(r.height))
      };
    }
    var sz = getSize();
    var cw = sz.cw, ch = sz.ch;

    /* --- renderer --- */
    var pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.autoClear = false;
    renderer.setClearColor(new THREE.Color(0x000000), 0);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(cw, ch, false);

    var canvas = renderer.domElement;
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;pointer-events:none;';
    container.prepend(canvas);

    /* --- palette --- */
    function makePalette(stops) {
      var arr = (stops && stops.length >= 2) ? stops : ['#ffffff', '#ffffff'];
      var w   = arr.length;
      var buf = new Uint8Array(w * 4);
      for (var i = 0; i < w; i++) {
        var c = new THREE.Color(arr[i]);
        buf[i*4]   = Math.round(c.r * 255);
        buf[i*4+1] = Math.round(c.g * 255);
        buf[i*4+2] = Math.round(c.b * 255);
        buf[i*4+3] = 255;
      }
      var tex = new THREE.DataTexture(buf, w, 1, THREE.RGBAFormat);
      tex.magFilter = tex.minFilter = THREE.LinearFilter;
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      return tex;
    }
    var paletteTex = makePalette(opts.colors);
    var bgVec4     = new THREE.Vector4(0, 0, 0, 0);

    /* --- FBO factory --- */
    var isIOS   = /iPad|iPhone|iPod/i.test(navigator.userAgent);
    var texType = isIOS ? THREE.HalfFloatType : THREE.FloatType;

    function makeFBO(w, h) {
      return new THREE.WebGLRenderTarget(w, h, {
        type:          texType,
        depthBuffer:   false,
        stencilBuffer: false,
        minFilter:     THREE.LinearFilter,
        magFilter:     THREE.LinearFilter,
        wrapS:         THREE.ClampToEdgeWrapping,
        wrapT:         THREE.ClampToEdgeWrapping
      });
    }

    var fw = Math.max(1, Math.round(opts.resolution * cw));
    var fh = Math.max(1, Math.round(opts.resolution * ch));

    var fbo = {
      vel_0:        makeFBO(fw, fh),
      vel_1:        makeFBO(fw, fh),
      vel_viscous0: makeFBO(fw, fh),
      vel_viscous1: makeFBO(fw, fh),
      div:          makeFBO(fw, fh),
      pressure_0:   makeFBO(fw, fh),
      pressure_1:   makeFBO(fw, fh)
    };

    /* shared uniform objects (mutated in place each frame) */
    var cellScale     = new THREE.Vector2(1/fw, 1/fh);
    var fboSize       = new THREE.Vector2(fw, fh);
    var boundarySpace = new THREE.Vector2(0, 0);

    /* --- camera --- */
    var cam = new THREE.Camera();

    /* --- scene/pass factory --- */
    function makePass(vSrc, fSrc, uniforms, matOpts) {
      var scene = new THREE.Scene();
      var mat   = new THREE.RawShaderMaterial(Object.assign({
        vertexShader:   vSrc,
        fragmentShader: fSrc,
        uniforms:       uniforms
      }, matOpts || {}));
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
      return { scene: scene, mat: mat, uniforms: uniforms };
    }

    function rp(pass, target) {
      renderer.setRenderTarget(target !== undefined ? target : null);
      renderer.render(pass.scene, cam);
      renderer.setRenderTarget(null);
    }

    /* --- Advection pass --- */
    var advU = {
      boundarySpace: { value: cellScale },
      px:            { value: cellScale },
      fboSize:       { value: fboSize },
      velocity:      { value: fbo.vel_0.texture },
      dt:            { value: opts.dt },
      isBFECC:       { value: true }
    };
    var advPass = makePass(SHADERS.face_vert, SHADERS.advection_frag, advU);

    /* boundary lines (same uniforms) */
    var bGeo = new THREE.BufferGeometry();
    bGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      -1,-1,0, -1,1,0,  -1,1,0, 1,1,0,  1,1,0, 1,-1,0,  1,-1,0, -1,-1,0
    ]), 3));
    var bLine = new THREE.LineSegments(bGeo, new THREE.RawShaderMaterial({
      vertexShader:   SHADERS.line_vert,
      fragmentShader: SHADERS.advection_frag,
      uniforms:       advU
    }));
    advPass.scene.add(bLine);

    /* --- External force pass --- */
    var efU = {
      px:     { value: cellScale },
      force:  { value: new THREE.Vector2(0, 0) },
      center: { value: new THREE.Vector2(0, 0) },
      scale:  { value: new THREE.Vector2(opts.cursorSize, opts.cursorSize) }
    };
    var efScene = new THREE.Scene();
    efScene.add(new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.RawShaderMaterial({
        vertexShader:   SHADERS.mouse_vert,
        fragmentShader: SHADERS.externalForce_frag,
        uniforms:       efU,
        blending:       THREE.AdditiveBlending,
        depthWrite:     false
      })
    ));

    /* --- Viscous pass --- */
    var visU = {
      boundarySpace: { value: boundarySpace },
      velocity:      { value: fbo.vel_1.texture },
      velocity_new:  { value: fbo.vel_viscous0.texture },
      v:             { value: opts.viscous },
      px:            { value: cellScale },
      dt:            { value: opts.dt }
    };
    var visPass = makePass(SHADERS.face_vert, SHADERS.viscous_frag, visU);

    /* --- Divergence pass --- */
    var divU = {
      boundarySpace: { value: boundarySpace },
      velocity:      { value: fbo.vel_1.texture },
      px:            { value: cellScale },
      dt:            { value: opts.dt }
    };
    var divPass = makePass(SHADERS.face_vert, SHADERS.divergence_frag, divU);

    /* --- Poisson pass --- */
    var poisU = {
      boundarySpace: { value: boundarySpace },
      pressure:      { value: fbo.pressure_0.texture },
      divergence:    { value: fbo.div.texture },
      px:            { value: cellScale }
    };
    var poisPass = makePass(SHADERS.face_vert, SHADERS.poisson_frag, poisU);

    /* --- Pressure correction pass --- */
    var presU = {
      boundarySpace: { value: boundarySpace },
      pressure:      { value: fbo.pressure_0.texture },
      velocity:      { value: fbo.vel_1.texture },
      px:            { value: cellScale },
      dt:            { value: opts.dt }
    };
    var presPass = makePass(SHADERS.face_vert, SHADERS.pressure_frag, presU);

    /* --- Color output pass --- */
    var outU = {
      velocity:      { value: fbo.vel_0.texture },
      boundarySpace: { value: new THREE.Vector2() },
      palette:       { value: paletteTex },
      bgColor:       { value: bgVec4 }
    };
    var outPass = makePass(SHADERS.face_vert, SHADERS.color_frag, outU, {
      transparent: true,
      depthWrite:  false
    });

    /* --- Mouse state --- */
    var mouse = {
      coords:     new THREE.Vector2(0, 0),
      coords_old: new THREE.Vector2(0, 0),
      diff:       new THREE.Vector2(0, 0),
      isHoverInside:  false,
      isAutoActive:   false,
      hasUserControl: false,
      takeoverActive: false,
      takeoverStartTime: 0,
      takeoverFrom: new THREE.Vector2(),
      takeoverTo:   new THREE.Vector2()
    };

    function isInside(cx, cy) {
      var r = container.getBoundingClientRect();
      return r.width > 0 && r.height > 0 &&
             cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
    }

    function setMouseCoords(cx, cy) {
      var r = container.getBoundingClientRect();
      if (!r.width || !r.height) return;
      mouse.coords.set(
        ((cx - r.left) / r.width)  * 2 - 1,
       -((cy - r.top)  / r.height) * 2 + 1
      );
    }

    function onInteract() {
      lastInteraction = performance.now();
      if (autoDriver) autoDriver.forceStop();
    }

    function onMouseMove(e) {
      mouse.isHoverInside = isInside(e.clientX, e.clientY);
      if (!mouse.isHoverInside) return;
      onInteract();
      if (mouse.isAutoActive && !mouse.hasUserControl && !mouse.takeoverActive) {
        var r  = container.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width;
        var ny = (e.clientY - r.top)  / r.height;
        mouse.takeoverFrom.copy(mouse.coords);
        mouse.takeoverTo.set(nx * 2 - 1, -(ny * 2 - 1));
        mouse.takeoverStartTime = performance.now();
        mouse.takeoverActive  = true;
        mouse.hasUserControl  = true;
        mouse.isAutoActive    = false;
        return;
      }
      setMouseCoords(e.clientX, e.clientY);
      mouse.hasUserControl = true;
    }

    function onTouchStart(e) {
      if (e.touches.length !== 1) return;
      var t = e.touches[0];
      mouse.isHoverInside = isInside(t.clientX, t.clientY);
      if (!mouse.isHoverInside) return;
      onInteract();
      setMouseCoords(t.clientX, t.clientY);
      mouse.hasUserControl = true;
    }

    function onTouchMove(e) {
      if (e.touches.length !== 1) return;
      var t = e.touches[0];
      mouse.isHoverInside = isInside(t.clientX, t.clientY);
      if (!mouse.isHoverInside) return;
      setMouseCoords(t.clientX, t.clientY);
    }

    function onTouchEnd()   { mouse.isHoverInside = false; }
    function onMouseLeave() { mouse.isHoverInside = false; }

    window.addEventListener('mousemove',    onMouseMove);
    window.addEventListener('touchstart',   onTouchStart,  { passive: true });
    window.addEventListener('touchmove',    onTouchMove,   { passive: true });
    window.addEventListener('touchend',     onTouchEnd);
    document.addEventListener('mouseleave', onMouseLeave);

    function updateMouse() {
      if (mouse.takeoverActive) {
        var t = (performance.now() - mouse.takeoverStartTime) / (opts.takeoverDuration * 1000);
        if (t >= 1) {
          mouse.takeoverActive = false;
          mouse.coords.copy(mouse.takeoverTo);
          mouse.coords_old.copy(mouse.coords);
          mouse.diff.set(0, 0);
        } else {
          var k = t * t * (3 - 2 * t);
          mouse.coords.lerpVectors(mouse.takeoverFrom, mouse.takeoverTo, k);
        }
      }
      mouse.diff.subVectors(mouse.coords, mouse.coords_old);
      mouse.coords_old.copy(mouse.coords);
      if (mouse.coords_old.x === 0 && mouse.coords_old.y === 0) mouse.diff.set(0, 0);
      if (mouse.isAutoActive && !mouse.takeoverActive) {
        mouse.diff.multiplyScalar(opts.autoIntensity);
      }
    }

    /* --- Auto-driver --- */
    var autoDriver = null;

    if (opts.autoDemo) {
      autoDriver = (function () {
        var cur     = new THREE.Vector2(0, 0);
        var tgt     = new THREE.Vector2(0, 0);
        var tmpDir  = new THREE.Vector2();
        var active  = false;
        var t_last  = performance.now();
        var t_act   = 0;
        var margin  = 0.2;

        function pickTgt() {
          tgt.set(
            (Math.random() * 2 - 1) * (1 - margin),
            (Math.random() * 2 - 1) * (1 - margin)
          );
        }
        pickTgt();

        return {
          forceStop: function () {
            active = false;
            mouse.isAutoActive = false;
          },
          update: function () {
            var now  = performance.now();
            var idle = now - lastInteraction;
            if (idle < opts.autoResumeDelay) { if (active) this.forceStop(); return; }
            if (mouse.isHoverInside)         { if (active) this.forceStop(); return; }

            if (!active) {
              active = true;
              cur.copy(mouse.coords);
              t_last = now;
              t_act  = now;
            }

            mouse.isAutoActive = true;

            var dtSec = Math.min((now - t_last) / 1000, 0.05);
            t_last = now;

            var dir  = tmpDir.subVectors(tgt, cur);
            var dist = dir.length();
            if (dist < 0.01) { pickTgt(); return; }
            dir.normalize();

            var ramp = 1;
            var rampMs = opts.autoRampDuration * 1000;
            if (rampMs > 0) {
              var tp = Math.min(1, (now - t_act) / rampMs);
              ramp = tp * tp * (3 - 2 * tp);
            }

            var move = Math.min(opts.autoSpeed * dtSec * ramp, dist);
            cur.addScaledVector(dir, move);
            mouse.coords.copy(cur);
          }
        };
      }());
    }

    /* --- Simulation step --- */
    function simUpdate() {
      var i, vIn, vOut, pIn, pOut;

      /* boundary */
      if (opts.isBounce) {
        boundarySpace.set(0, 0);
      } else {
        boundarySpace.copy(cellScale);
      }

      /* Advection: vel_0 -> vel_1 */
      advU.velocity.value  = fbo.vel_0.texture;
      advU.dt.value        = opts.dt;
      advU.isBFECC.value   = opts.BFECC;
      bLine.visible        = opts.isBounce;
      rp(advPass, fbo.vel_1);

      /* External force: additive into vel_1 */
      var fx  = (mouse.diff.x / 2) * opts.mouseForce;
      var fy  = (mouse.diff.y / 2) * opts.mouseForce;
      var csx = opts.cursorSize * cellScale.x;
      var csy = opts.cursorSize * cellScale.y;
      var ecx = Math.min(Math.max(mouse.coords.x, -1 + csx + cellScale.x * 2), 1 - csx - cellScale.x * 2);
      var ecy = Math.min(Math.max(mouse.coords.y, -1 + csy + cellScale.y * 2), 1 - csy - cellScale.y * 2);
      efU.force.value.set(fx, fy);
      efU.center.value.set(ecx, ecy);
      efU.scale.value.set(opts.cursorSize, opts.cursorSize);
      renderer.setRenderTarget(fbo.vel_1);
      renderer.render(efScene, cam);
      renderer.setRenderTarget(null);

      /* Viscous or pass-through */
      var vel = fbo.vel_1;
      if (opts.isViscous) {
        visU.v.value        = opts.viscous;
        visU.dt.value       = opts.dt;
        visU.velocity.value = fbo.vel_1.texture;
        for (i = 0; i < opts.iterationsViscous; i++) {
          vIn  = (i % 2 === 0) ? fbo.vel_viscous0 : fbo.vel_viscous1;
          vOut = (i % 2 === 0) ? fbo.vel_viscous1 : fbo.vel_viscous0;
          visU.velocity_new.value = vIn.texture;
          rp(visPass, vOut);
        }
        vel = vOut;
      }

      /* Divergence */
      divU.velocity.value = vel.texture;
      rp(divPass, fbo.div);

      /* Poisson */
      for (i = 0; i < opts.iterationsPoisson; i++) {
        pIn  = (i % 2 === 0) ? fbo.pressure_0 : fbo.pressure_1;
        pOut = (i % 2 === 0) ? fbo.pressure_1 : fbo.pressure_0;
        poisU.pressure.value = pIn.texture;
        rp(poisPass, pOut);
      }

      /* Pressure correction -> vel_0 */
      presU.velocity.value = vel.texture;
      presU.pressure.value = pOut.texture;
      rp(presPass, fbo.vel_0);

      /* Color output to screen */
      outU.velocity.value = fbo.vel_0.texture;
      rp(outPass, null);
    }

    /* --- Render loop --- */
    function loop() {
      if (!running) return;
      if (autoDriver) autoDriver.update();
      updateMouse();
      renderer.clear();
      simUpdate();
      rafId = requestAnimationFrame(loop);
    }

    /* --- Resize --- */
    function resize() {
      var r  = container.getBoundingClientRect();
      cw = Math.max(1, Math.floor(r.width));
      ch = Math.max(1, Math.floor(r.height));
      renderer.setSize(cw, ch, false);
      fw = Math.max(1, Math.round(opts.resolution * cw));
      fh = Math.max(1, Math.round(opts.resolution * ch));
      cellScale.set(1/fw, 1/fh);
      fboSize.set(fw, fh);
      for (var k in fbo) {
        if (Object.prototype.hasOwnProperty.call(fbo, k)) {
          fbo[k].setSize(fw, fh);
        }
      }
    }

    /* --- Observers --- */
    var ro = new ResizeObserver(function () {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    });
    ro.observe(container);

    var io = new IntersectionObserver(function (entries) {
      isVisible = entries[0].isIntersecting && entries[0].intersectionRatio > 0;
      if (isVisible && !document.hidden) { self.start(); }
      else { self.pause(); }
    }, { threshold: [0, 0.01, 0.1] });
    io.observe(container);

    function onVisChange() {
      if (document.hidden) { self.pause(); }
      else if (isVisible)  { self.start(); }
    }
    document.addEventListener('visibilitychange', onVisChange);

    function onWinResize() { resize(); }
    window.addEventListener('resize', onWinResize);

    /* --- Public API --- */
    this.start = function () {
      if (running) return;
      running = true;
      loop();
    };

    this.pause = function () {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    };

    this.dispose = function () {
      self.pause();
      try { ro.disconnect(); } catch (e) {}
      try { io.disconnect(); } catch (e) {}
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('resize', onWinResize);
      window.removeEventListener('mousemove',    onMouseMove);
      window.removeEventListener('touchstart',   onTouchStart);
      window.removeEventListener('touchmove',    onTouchMove);
      window.removeEventListener('touchend',     onTouchEnd);
      document.removeEventListener('mouseleave', onMouseLeave);
      var c = renderer.domElement;
      if (c && c.parentNode) c.parentNode.removeChild(c);
      renderer.dispose();
    };
  }

  global.LiquidEther = LiquidEther;

}(typeof window !== 'undefined' ? window : this));
