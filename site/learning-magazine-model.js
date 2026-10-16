(function(global){
 'use strict';
 global.buildLearningMagazineModel=function(T,id){
  id=String(id).toUpperCase();
  const special=['MAGAZINE70','POLAROID100','POLAPLUS','POLABASIC'].includes(id);
  const model=special?global.buildSpecialMagazineDetails(T,global.buildManualMagazineModel(T,id),id):global.buildPrecisionMagazineModel(T,id);
  global.prepareMagazineSurfaces?.(T,model.root);
  const occluders=id==='MAGAZINE70'?['shell','right-cover','insert-endplate','insert-lock']:
   /^POLA/.test(id)?['chassis','rear-leather','film-pack']:
   ['shell','support','cover','p_cover_leather','p_40305','e_cover','e_leather'];
  model.parts.forEach(part=>part.inspectionOccluder=occluders.includes(part.id));
  if(typeof global.applyManualPartLabels==='function')global.applyManualPartLabels(id,model.parts);
  else model.parts.forEach(part=>{part.labelName='';part.labelNumber='';part.labelPages=part.pages;part.labelDescription='仅作形状演示，未标注零件名称。';});
  model.boundary='仅作自由拆解三维演示；展开间距和位置为观察而调整，不表示拆卸或安装顺序。名称仅采用手册可核对的件表；未确认处不标注。几何尺寸未经实测。';
  return model;
 };
})(window);
