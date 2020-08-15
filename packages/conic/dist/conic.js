/*!
 * @pixi-essentials/conic - v1.0.1
 * Compiled Sat, 15 Aug 2020 19:41:52 UTC
 *
 * @pixi-essentials/conic is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
this.PIXI=this.PIXI||{};var _pixi_essentials_conic=function(n,t,e,i,r,o,s){"use strict";s=s&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s;const a=new t.AttributeRedirect({source:"vertexData",attrib:"aWorldPosition",type:"float32",size:2,glType:e.TYPES.FLOAT,glSize:2}),c=new t.AttributeRedirect({source:"uvData",attrib:"aTexturePosition",type:"float32",size:2,glType:e.TYPES.FLOAT,glSize:2}),l=new t.UniformRedirect({source:"k",uniform:"k"}),d=new t.UniformRedirect({source:"l",uniform:"l"}),v=new t.UniformRedirect({source:"m",uniform:"m"}),u=new t.BatchShaderFactory("#version 100\n#define SHADER_NAME Conic-Renderer-Fallback-Shader\n\nprecision mediump float;\n\nattribute vec2 aWorldPosition;\nattribute vec2 aTexturePosition;\nattribute float aMasterID;\nattribute float aUniformID;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vWorldCoord;\nvarying vec2 vTextureCoord;\nvarying float vMasterID;\nvarying float vUniformID;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aWorldPosition, 1)).xy, 0, 1);\n\n    vWorldCoord = gl_Position.xy;\n    vTextureCoord = aTexturePosition;\n    vMasterID = aMasterID;\n    vUniformID = aUniformID;\n}","#version 100\n#ifdef GL_OES_standard_derivatives\n    #extension GL_OES_standard_derivatives : enable\n#endif\n#define SHADER_NAME Conic-Renderer-Fallback-Shader\n\nprecision mediump float;\n\nuniform sampler2D uSamplers[%texturesPerBatch%];\n\nvarying vec2 vWorldCoord;\nvarying vec2 vTextureCoord;\nvarying float vMasterID;\nvarying float vUniformID;\n\nuniform vec3 k[%uniformsPerBatch%];\nuniform vec3 l[%uniformsPerBatch%];\nuniform vec3 m[%uniformsPerBatch%];\nuniform bool inside;\n\nfloat sampleCurve(vec2 point, vec3 kv, vec3 lv, vec3 mv)\n{\n    float k = dot(vec3(vTextureCoord, 1), kv);\n    float l = dot(vec3(vTextureCoord, 1), lv);\n    float m = dot(vec3(vTextureCoord, 1), mv);\n\n    return k*k - l*m;\n}\n\nvoid main(void)\n{\n    vec3 kv, lv, mv;\n\n    for (int i = 0; i < %uniformsPerBatch%; i++)\n    {\n        if (float(i) > vUniformID - 0.5) \n        {\n            kv = k[i];\n            lv = l[i];\n            mv = m[i];\n            break;\n        }\n    }\n\n    float k_ = dot(vec3(vTextureCoord, 1), kv);\n    float l_ = dot(vec3(vTextureCoord, 1), lv);\n    float m_ = dot(vec3(vTextureCoord, 1), mv);\n\n    float cv = k_ * k_ - l_ * m_;\n\n#ifdef GL_OES_standard_derivatives\n    float cvdx = dFdx(cv);\n    float cvdy = dFdy(cv);\n    vec2 gradientTangent = vec2(cvdx, cvdy);\n\n    float signedDistance = cv / length(gradientTangent);\n    bool antialias = signedDistance > -1. && signedDistance < 1.;\n#endif\n\n    vec4 color;\n\n    if ((inside && cv < 0.) || (!inside && cv >= 0.) \n#ifdef GL_OES_standard_derivatives\n            || antialias\n#endif\n    )\n    {\n        for (int i = 0; i < %texturesPerBatch%; i++)\n        {\n            if (float(i) > vMasterID - 0.5)\n            {\n                color = texture2D(uSamplers[i], vTextureCoord);\n                break;\n            }\n        }\n    }\n    else\n    {\n        color = vec4(0, 0, 0, 0);\n    }\n\n#ifdef GL_OES_standard_derivatives\n    if (antialias)\n    {\n        float weight = inside ? (1. - signedDistance) / 2. : (1. + signedDistance) / 2.;\n        \n        color = weight * color + (1. - weight) * vec4(0, 0, 0, 0);\n    }\n#endif\n\n    gl_FragColor = color;\n}",{inside:!0}).derive(),f=new t.BatchShaderFactory("#version 300 es\n\n#define SHADER_NAME Conic-Renderer-Shader\n\nprecision mediump float;\n\nin vec2 aWorldPosition;\nin vec2 aTexturePosition;\nin float aMasterID;\nin float aUniformID;\n\nuniform mat3 projectionMatrix;\n\nout vec2 vWorldCoord;\nout vec2 vTextureCoord;\nout float vMasterID;\nout float vUniformID;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aWorldPosition, 1)).xy, 0, 1);\n\n    vWorldCoord = gl_Position.xy;\n    vTextureCoord = aTexturePosition;\n    vMasterID = aMasterID;\n    vUniformID = aUniformID;\n}","#version 300 es\n#define SHADER_NAME Conic-Renderer-Shader\n\nprecision mediump float;\n\nuniform sampler2D uSamplers[%texturesPerBatch%];\n\nin vec2 vWorldCoord;\nin vec2 vTextureCoord;\nin float vMasterID;\nin float vUniformID;\n\nout vec4 fragmentColor;\n\nuniform vec3 k[%uniformsPerBatch%];\nuniform vec3 l[%uniformsPerBatch%];\nuniform vec3 m[%uniformsPerBatch%];\nuniform bool inside;\n\nvoid main(void)\n{\n    vec3 kv, lv, mv;\n\n    for (int i = 0; i < %uniformsPerBatch%; i++)\n    {\n        if (float(i) > vUniformID - 0.5) \n        {\n            kv = k[i];\n            lv = l[i];\n            mv = m[i];\n            break;\n        }\n    }\n\n    float k_ = dot(vec3(vTextureCoord, 1), kv);\n    float l_ = dot(vec3(vTextureCoord, 1), lv);\n    float m_ = dot(vec3(vTextureCoord, 1), mv);\n\n    float cv = k_ * k_ - l_ * m_;\n\n    float cvdx = dFdx(cv);\n    float cvdy = dFdy(cv);\n    vec2 gradientTangent = vec2(cvdx, cvdy);\n\n    float signedDistance = cv / length(gradientTangent);\n    bool antialias = signedDistance > -1. && signedDistance < 1.;\n\n    vec4 color;\n\n    if ((inside && cv < 0.) || (!inside && cv >= 0.) || antialias)\n    {\n        for (int i = 0; i < %texturesPerBatch%; i++)\n        {\n            if (float(i) > vMasterID - 0.5)\n            {\n                color = texture(uSamplers[i], vTextureCoord);\n                break;\n            }\n        }\n    }\n    else\n    {\n        color = vec4(0, 0, 0, 0);\n    }\n\n    if (antialias)\n    {\n        float weight = inside ? (1. - signedDistance) / 2. : (1. + signedDistance) / 2.;\n        \n        color = weight * color + (1. - weight) * vec4(0, 0, 0, 0);\n    }\n\n    fragmentColor = color;\n}",{inside:!0}).derive(),h=t.BatchRendererPluginFactory.from({attribSet:[a,c],uniformSet:[l,d,v],indexProperty:"indexData",textureProperty:"_texture",texIDAttrib:"aMasterID",uniformIDAttrib:"aUniformID",inBatchIDAttrib:"aBatchID",shaderFunction:n=>{const t=n.renderer,e=t.context;return 1!==e.webGLVersion||e.extensions.standardDerivatives||(e.extensions.standardDerivatives=t.gl.getExtension("OES_standard_derivatives")),1===e.webGLVersion?u(n):f(n)},BatchFactoryClass:t.AggregateUniformsBatchFactory});i.Renderer.registerPlugin("conic",h);const m=h,x=Math.sqrt(2);class g{constructor(){this.k=[1,0,0],this.l=[0,1,0],this.m=[0,0,1],this.controlPoints=[new r.Point(0,0),new r.Point(.5,0),new r.Point(1,1)],this._dirtyID=0}setk(n,t,e){return this.k[0]=n,this.k[1]=t,this.k[2]=e,this._dirtyID++,this}setl(n,t,e){return this.l[0]=n,this.l[1]=t,this.l[2]=e,this._dirtyID++,this}setm(n,t,e){return this.m[0]=n,this.m[1]=t,this.m[2]=e,this._dirtyID++,this}setControlPoints(n,t,e){this.controlPoints[0]=n,this.controlPoints[1]=t,this.controlPoints[2]=e}update(){return this._dirtyID++,this}static createCircle(n){const t=new g;return t.setk(1/x,1/x,-n/x),t.setl(1,0,0),t.setm(0,1,0),t}static createEllipse(n,t){const e=new g;return e.setk(1/n,1/t,-1),e.setl(2/n,0,0),e.setm(0,1/t,0),e}static createParabola(n){const t=new g;return t.setk(1,0,0),t.setl(0,4*n,0),t.setm(0,0,1),t}static createHyperbola(n,t){const e=new g;return e.setk(0,0,1),e.setl(-1/n,1/t,0),e.setm(1/n,1/t,0),e}}const D=new r.Matrix;class _ extends o.Container{constructor(n=new g,t){super(),this.shape=n,this._dirtyID=0,this._transformID=0,this._updateID=-1,this.vertexData=[],this.uvData=[],this._texture=t||i.Texture.WHITE}get k(){return this.shape.k}set k(n){this.shape.setk(...n)}get l(){return this.shape.l}set l(n){this.shape.setl(...n)}get m(){return this.shape.m}set m(n){this.shape.setm(...n)}get texture(){return this._texture}set texture(n){this._texture=n||i.Texture.WHITE}_calculateBounds(){this._bounds.addVertexData(this.vertexData,0,this.vertexData.length)}_render(n){n.plugins.conic||(n.plugins.conic=new m(n,null)),n.batch.setObjectRenderer(n.plugins.conic),n.plugins.conic.render(this)}drawControlPoints(){const n=this.shape.controlPoints;return this.drawTriangle(n[0].x,n[0].y,n[1].x,n[1].y,n[2].x,n[2].y),this}drawTriangle(n,t,e,i,r,o){const s=this.uvData,a=s.length;return s.length+=6,s[a]=n,s[a+1]=t,s[a+2]=e,s[a+3]=i,s[a+4]=r,s[a+5]=o,this}drawRect(n,t,e,i){const r=this.uvData,o=r.length;return r.length+=12,r[o]=n,r[o+1]=t,r[o+2]=n+e,r[o+3]=t,r[o+4]=n+e,r[o+5]=t+i,r[o+6]=n,r[o+7]=t,r[o+8]=n+e,r[o+9]=t+i,r[o+10]=n,r[o+11]=t+i,this}updateConic(){const n=this.vertexData,t=this.uvData;n.length=t.length;const e=D.copyFrom(this.worldTransform),{a:i,b:r,c:o,d:s,tx:a,ty:c}=e;for(let e=0,l=n.length/2;e<l;e++){const l=t[2*e],d=t[2*e+1];n[2*e]=i*l+o*d+a,n[2*e+1]=r*l+s*d+c}this._updateID=this._dirtyID;const l=this.indexData=new Array(n.length/2);for(let n=0,t=l.length;n<t;n++)l[n]=n}setControlPoints(n,t,e){const i=this.shape.controlPoints;this.setTransform(i[0],i[1],i[2],n,t,e)}setTransform(...n){const t=this.transform,e=t.localTransform;if(t._localID++,1===n.length)return e.copyFrom(n[0]),this;let i,r,o,a,c,l,d,v,u,f,h,m;if(9===n.length&&super.setTransform(...n),e.identity(),6===n.length){const t=n;i=t[0].x,r=t[0].y,o=t[1].x,a=t[1].y,c=t[2].x,l=t[2].y,d=t[3].x,v=t[3].y,u=t[4].x,f=t[4].y,h=t[5].x,m=t[5].y}else{const t=n;i=t[0],r=t[1],o=t[2],a=t[3],c=t[4],l=t[5],d=t[6],v=t[7],u=t[8],f=t[9],h=t[10],m=t[11]}const x=[i,o,c,r,a,l,1,1,1],g=s.invert(x,x);return e.a=g[0]*d+g[3]*u+g[6]*h,e.c=g[1]*d+g[4]*u+g[7]*h,e.tx=g[2]*d+g[5]*u+g[8]*h,e.b=g[0]*v+g[3]*f+g[6]*m,e.d=g[1]*v+g[4]*f+g[7]*m,e.ty=g[2]*v+g[5]*f+g[8]*m,t.setFromMatrix(e),this}updateTransform(){const n=super.updateTransform();return this._transformID!==this.transform._worldID&&(this.updateConic(),this._transformID=this.transform._worldID),n}}return n.Conic=g,n.ConicDisplay=_,n}({},PIXI.brend,PIXI,PIXI,PIXI,PIXI,mat3);Object.assign(this.PIXI,_pixi_essentials_conic);
//# sourceMappingURL=conic.js.map
