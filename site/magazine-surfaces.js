/* Visual surface reconstruction, not a claim about alloy, coating or wear.
 * Deterministic, local textures use millimetre-scale model coordinates. */
(function(global){
 'use strict';
 const caches=new WeakMap();
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const hash=(x,y)=>{let n=Math.imul(x+17,374761393)^Math.imul(y+31,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
 function surfaces(T){
  if(caches.has(T))return caches.get(T);
  const size=256,sets={};
  function texture(data,name){const t=new T.DataTexture(data,size,size,T.RGBAFormat);t.name=name;t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=4;t.needsUpdate=true;return t;}
  function make(kind,span,depth){
   const height=new Float32Array(size*size),rough=new Uint8Array(size*size*4),normal=new Uint8Array(size*size*4);
   for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const n=hash(x,y);let h,r;
    if(kind==='leather'){
     // Rounded, irregular pebbles with narrow recessed seams, tileable in both axes.
     const cells=19,u=x/size*cells,v=y/size*cells,ix=Math.floor(u),iy=Math.floor(v);let first=9,second=9;
     for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      const xx=ix+dx,yy=iy+dy,wx=(xx+cells)%cells,wy=(yy+cells)%cells;
      const d=Math.hypot(u-xx-(.2+.6*hash(wx,wy)),v-yy-(.2+.6*hash(wx+71,wy+43)));
      if(d<first){second=first;first=d;}else if(d<second)second=d;
     }
     h=clamp((second-first)*3.2)*.78+n*.09;r=.77+h*.16;
    }else if(kind==='grain'){
     h=.5+(hash(x,0)-.5)*.36+(n-.5)*.08;r=.8+(hash(x,0)-.5)*.14+(n-.5)*.04;
    }else{h=n;r=.88+(n-.5)*.12;}
    height[y*size+x]=h;const i=(y*size+x)*4;
    // G is roughness; B=1 preserves the material's metalness in glTF as well.
    rough[i]=255;rough[i+1]=Math.round(clamp(r)*255);rough[i+2]=255;rough[i+3]=255;
   }
   const at=(x,y)=>height[((y+size)%size)*size+(x+size)%size];
   for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const dx=(at(x+1,y)-at(x-1,y))*depth*size/(2*span),dy=(at(x,y+1)-at(x,y-1))*depth*size/(2*span),len=Math.hypot(dx,dy,1),i=(y*size+x)*4;
    normal[i]=Math.round((-.5*dx/len+.5)*255);normal[i+1]=Math.round((-.5*dy/len+.5)*255);normal[i+2]=Math.round((.5/len+.5)*255);normal[i+3]=255;
   }
   return{span,normal:texture(normal,kind+' normal'),rough:texture(rough,kind+' roughness')};
  }
  sets.leather=make('leather',9,.1);sets.grain=make('grain',16,.006);sets.paint=make('paint',8,.003);
  caches.set(T,sets);return sets;
 }
 global.refineMagazineMaterials=function(T,materials){
  const tex=surfaces(T);
  const profiles={
   chrome:[0xcbd0d3,1,.19,'grain',.24],silver:[0xadb2b5,.92,.34,'grain',.5],steel:[0x999fa4,.92,.36,'grain',.5],
   brass:[0xb6a073,.92,.33,'grain',.38],dark:[0x202224,.45,.44,'paint',.35],black:[0x151719,.14,.43,'paint',.22],
   leather:[0x17191a,0,.92,'leather',1],seal:[0x111313,0,.99,'paint',.35],rubber:[0x111315,0,.96,'paint',.4],
   pale:[0xd4d5cb,.08,.48],ivory:[0xdbd8c9,.05,.5],film:[0x514034,.04,.62]
  };
  for(const[name,m]of Object.entries(materials)){
   const p=profiles[name];if(!p||!m.isMeshStandardMaterial)continue;
   m.name='Magazine '+name;m.color.setHex(p[0]);m.metalness=p[1];m.roughness=p[2];m.envMapIntensity=name==='chrome'?1.3:1;
   m.userData.surface=name;
   if(p[3]){const t=tex[p[3]];m.bumpMap=null;m.normalMap=t.normal;m.normalScale.set(p[4],p[4]);m.roughnessMap=t.rough;m.userData.textureSpan=t.span;}
   m.needsUpdate=true;
  }
  return materials;
 };
 global.prepareMagazineSurfaces=function(T,root){
  root.traverse(object=>{
   if(!object.isMesh||Array.isArray(object.material))return;
   const material=object.material,span=material.userData.textureSpan;
   if(!span||material.map)return; // Preserve the counter figures and printed marks.
   let geo=object.geometry;if(geo.userData.magazineTextureSpan===span)return;
   if(geo.userData.magazineTextureSpan)geo=object.geometry=geo.clone();
   const positions=geo.attributes.position,normals=geo.attributes.normal;if(!positions||!normals)return;
   const uv=new Float32Array(positions.count*2);
   for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),nx=Math.abs(normals.getX(i)),ny=Math.abs(normals.getY(i)),nz=Math.abs(normals.getZ(i));
    // Project by local face normal so thin stamped plates and deep shell walls
    // have the same fine grain instead of stretching a texture over each face.
    const u=nx>ny&&nx>nz?z:x,v=ny>nx&&ny>nz?z:y;uv[i*2]=u/span;uv[i*2+1]=v/span;
   }
   geo.setAttribute('uv',new T.BufferAttribute(uv,2));geo.userData.magazineTextureSpan=span;
  });
 };
})(window);
