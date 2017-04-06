'use strict';

import React from 'react';

import { GLView } from 'expo';


const vertSrc = `
attribute vec2 position;
varying vec2 uv;
void main() {
  gl_Position = vec4(position.x, -position.y, 0.0, 1.0);
  uv = vec2(0.5, 0.5) * (position+vec2(1.0, 1.0));
}`;

const fragSrc = `
precision highp float;
varying vec2 uv;
void main () {
  gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
}`;


export default class BasicScene extends React.Component {
  static meta = {
    description: 'Basic Scene',
  };

  render() {
    return (
      <GLView
        style={this.props.style}
        onContextCreate={this._onContextCreate}
      />
    );
  }

  _onContextCreate = (gl) => {
    // Compile vertex and fragment shader
    const vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vert, vertSrc);
    gl.compileShader(vert);
    const frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(frag, fragSrc);
    gl.compileShader(frag);

    // Link together into a program
    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    // Save position attribute
    const positionAttrib = gl.getAttribLocation(program, 'position');

    // Create buffer
    const buffer = gl.createBuffer();

    // Animate!
    let skip = false;
    const animate = () => {
      try {
        if (skip) {
          // return;
        }

        // Clear
        gl.clearColor(0, 0, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Bind buffer, program and position attribute for use
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.useProgram(program);
        gl.enableVertexAttribArray(positionAttrib);
        gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);

        // Buffer data and draw!
        const speed = this.props.speed || 1;
        const a = 0.48 * Math.sin(0.001 * speed * Date.now()) + 0.5;
        const verts = new Float32Array([
          -a, -a, a, -a, -a,  a,
          -a,  a, a, -a,  a,  a,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

        // Submit frame
        gl.flush();
        gl.endFrameEXP();
      } finally {
        skip = !skip;
        gl.enableLogging = false;
        requestAnimationFrame(animate);
      }
    };
    animate();
  }
}
