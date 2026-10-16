/* Real-object coordinate convention for roll-film magazines.
 * Looking directly at the camera coupling face (+Z), the removable insert and
 * dark-slide handle are on the right (+X); the crank/mechanism is on the left.
 * The older construction modules use the opposite local X convention. One
 * reflected model root corrects their geometry, labels and all local motion
 * together. Keep lights and the viewing stage outside this root.
 */
(function(global){
 'use strict';
 const models=new Set(['A12','A16','A24','A16S','A32','A12TCC','A16TCC','A24TCC','E12','E16','E24','E12CC']);
 global.ROLLFILM_MODEL_IDS=Object.freeze([...models]);
 global.orientRollfilmRoot=function(T,root,modelId){
  const id=String(modelId||'').toUpperCase();
  if(!models.has(id))return root;
  if(!root?.isObject3D)throw new Error('Roll-film orientation requires a model root');
  root.scale.x=-1;
  root.userData.orientationX=-1;
  root.userData.coordinateSystem={front:'+Z',up:'+Y',insert:'+X',mechanism:'-X',motionSpace:'parent-local',model:id};
  root.traverse(object=>{
   if(!object.isMesh||object.userData.orientationPrintedU)return;
   const materials=Array.isArray(object.material)?object.material:[object.material];
   if(!materials.some(material=>material?.map?.isCanvasTexture))return;
   const original=object.geometry,uv=original?.attributes?.uv;
   if(!uv)return;
   // Printed lettering must stay readable after the model reflection. Clone
   // per mesh: a shared geometry/texture can also belong to an untouched model.
   const geometry=original.clone(),printedUV=geometry.attributes.uv;
   for(let i=0;i<printedUV.count;i++)printedUV.setX(i,1-printedUV.getX(i));
   printedUV.needsUpdate=true;
   object.geometry=geometry;
   object.userData.orientationPrintedU=true;
  });
  root.updateMatrixWorld(true);
  return root;
 };
})(window);
