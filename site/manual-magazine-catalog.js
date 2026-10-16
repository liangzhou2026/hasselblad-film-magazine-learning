/* Catalog checked against the local 66-page Hasselblad Film Magazines manual.
 * Page numbers are PDF viewer pages, including the cover; never section numbers.
 * These are part identities and diagram relationships, not measured dimensions.
 */
(function (root) {
  'use strict';
  const component = (id, name, number, pages, description) => ({id, name, number, pages, description});
  const mechanicalBoundary = '依据原厂零件图整理结构关系；曲面、齿形和间隙未实测，属于维修学习示意。序列号不同的零件不能仅凭模型互换。';
  const electronicBoundary = '含片芯端盖电路、接触软片和导线的结构示意。原厂拆装正文涉及拆焊、量规和电气检测；动画不模拟焊接、电路功能或校准结果。';
  const structuralBoundary = '本册只提供该型号分解图与零件表，未给出逐步拆装程序。分层动画用于认件和理解装配关系，不能视作原厂维修顺序。尺寸和局部形状为示意。';
  const mechanical = (cfg) => {
    const isS = cfg.id === 'A16S';
    const is32 = cfg.id === 'A32';
    const is16 = cfg.id === 'A16';
    const is24 = cfg.id === 'A24';
    const mechanismPage = is32 ? 62 : 12;
    const mechanismTables = is32 ? [62,63,64] : [12,13,14];
    const shellPage = is32 ? 65 : isS ? 15 : 17;
    const insertPage = isS ? 25 : is16 || is32 ? 27 : 23;
    const insertPages = [insertPage,insertPage+1];
    const components = [
      component('support','后背支架',is32 ? '607311' : isS ? '30516' : is16 ? '30751' : '30752',mechanismTables,'承载画幅框、机械机构及与机身连接的结构。'),
      component('shell','外壳','308023 / 308024',[shellPage,shellPage+1],'对应本条选择的镀铬／黑色外壳版本。带插刀收纳槽的后续外壳可能另有编号。'),
      component('outer-plate','前连接外板','40380',mechanismTables,'朝向机身的连接外板；原厂要求订件时注明序列号。'),
      component('picture-frame','画幅框',isS ? '21587' : is16 || is32 ? '22712' : is24 ? '' : '22710',mechanismTables,is24 ? '普通 A24 的这份件表未单独指定画幅框编号，不能仅由 E24 编号反推。' : '各型号开口和部件编号按件表区分，开口尺寸未由本册实测。'),
      component('dark-slide','插刀','Z41068',mechanismTables,'位于前连接面与遮光结构之间。'),
      component('light-trap','插刀口遮光件','13067 + 13508',mechanismTables,'Light trap 与 foil 两件配合；foil 一词不代表已确认材料为铝箔。'),
      component('counter-dial','计数盘',is32 ? '607320' : is16 || isS ? '13849' : is24 ? '13819' : '13806',mechanismTables,'各型计数盘分开编号。'),
      component('spacing-gear','片距齿轮',is32 ? '607316' : isS ? '21583' : is16 ? '22841' : is24 ? '21484' : '22371',mechanismTables,is16 ? '本条取 S/N 31ET10601 起的 22841；此前 A16 以及 A16S 为 21583。' : '仅表达该型计数／片距机构位置，不代表齿数和齿形已测量。'),
      component('center-mechanism','中央机构',is32 ? '607313' : is24 ? '21483' : '21548',mechanismTables,'该型的中央机构总成；内部配合轮廓为示意。'),
      component('release-arm','释放臂',is32 || is24 ? '22315' : '22277',mechanismTables,'与计数、停片动作相关；装配定位应对照该型原厂图。'),
      component('drive-gear','传动齿轮总成',is16 || isS || is32 ? '309103' : is24 ? '311101' : '308109',mechanismTables,'总成编号不能当作单个齿轮编号。'),
      component('spring-housing','弹簧盒与轮毂','13030 + 14185 + 14184',mechanismTables,'弹簧盒、轮毂和簧片分别为原厂列出的零件。'),
      component('right-cover','卷片侧盖',is32 ? '607305 / 607304' : is16 || isS || is24 ? '30499 / 30640' : '30483 / 30639',[shellPage,shellPage+1],'镀铬／黑色侧盖总成，位于卷片摇柄侧。'),
      component('pressure-plate','压片板',isS ? '21615' : is16 || is32 ? '309102' : '22388',insertPages,'片芯中的压片板；本目录明确区分旧 A16S 片芯与新 A16/A32 片芯。'),
      component('roller','导片滚轴','13514',insertPages,'件表列 2 个导片滚轴。'),
      component('insert-lock','片芯锁轴',is16 || is32 ? '308103' : '13060',insertPages,'片芯锁轴位置及其端盖连接关系。')
    ];
    if (isS || is16) components.push(component('eccentric','偏心调节件','22171 + 820013',mechanismTables,'A16/A16S 的偏心件与固定螺钉；不是普通 A12 的止挡螺钉。'));
    if (is32) {
      components.push(component('counter-shade','计数遮片及弹簧','607089 + 607095',[62,63],'A32 特有计数遮片结构。图62空心圆注记为预紧 3 圈；不可套用别型数值。'));
      components.push(component('counter-stop','计数止挡及卡扣','607088 + 607096',[62,63],'A32 图中的止挡和卡扣。'));
      components.push(component('film-signal','曝光信号件','607314',[62,63],'A32 的信号件总成。'));
    }
    return {id:cfg.id,label:cfg.id,family:'mechanical',familyLabel:'A 系列机械后背',pages:cfg.pages,mechanismPage,shellPage,insertPage,scope:cfg.scope,boundary:is32 ? mechanicalBoundary+' A32 图62给出独立的 3 圈预紧注记；不能把 A12 的调校流程直接套用。' : mechanicalBoundary,components};
  };
  const electronic = (id) => {
    const count = id.includes('16') ? 16 : id.includes('24') ? 24 : 12;
    const tcc = id.includes('TCC');
    const dual = tcc || id === 'E12CC';
    const shellPage = tcc ? 38 : 34;
    const circuitPage = dual ? 45 : 43;
    const components = [
      component('support','后背支架',count === 16 ? '309344' : '308364',[31,32],'电子联络型支架，不能直接视作普通 A 系列支架。'),
      component('shell','外壳','308023 / 308024',[shellPage,shellPage+1],'本条按这一组完整外壳图显示；E 系列 1996 改型另见 PDF36–37。'),
      component('outer-plate','前连接外板','308321',[31,33],'与机身连接的外板；此前版本为 308106，订件须注明序列号。'),
      component('picture-frame','画幅框',count === 16 ? '22712' : '22710',[31,32],'电子后背件表明确列出 12/24 与 16 两组画幅框。'),
      component('dark-slide','插刀','Z41068',[31,32],'由插刀口进入机身连接面内侧。'),
      component('light-trap','插刀口遮光件','13067 + 13508',[31,32],'遮光件与薄片配合。'),
      component('counter-dial','计数盘',count === 16 ? '13849' : count === 24 ? '13819' : '13806',[31,32],'按 12/16/24 型号分别列件。'),
      component('spacing-gear','片距齿轮',count === 16 ? (id === 'E16' ? '22841' : '21583') : count === 24 ? '21484' : '22371',[31,32],id === 'E16' ? '本条取 E16 S/N 37ET10301 起的 22841；此前 E16 为 21583。' : 'A16TCC 的本表编号是 21583；不能把 E16 的后期改件一律套到 TCC。'),
      component('center-mechanism','中央机构',count === 24 ? '21483' : '21548',[31,32],'不同计数容量采用不同总成。'),
      component('release-arm','释放臂',count === 24 ? '22315' : '22277',[31,32],'件表按 12/16 与 24 区分。'),
      component('drive-gear','传动齿轮总成',count === 16 ? '309103' : count === 24 ? '311101' : '308109',[31,33],'机构齿轮总成。'),
      component('contact-flex','机身侧接触软片','308044',[31,32],'Contact flex 位于后背支架组件；与片芯端盖的接触总成 308043 分开识别。'),
      component('pressure-plate','压片板',count === 16 ? '309102' : '308104',[40,41],'电子联络型片芯的压片板编号。'),
      component('insert-end','片芯端板',count === 16 ? '313322' : '312323',[40,41],'电路端盖固定在片芯端板外侧；卷片侧盖位于对面。'),
      component('circuit-cover','电路端盖',dual ? '308431 / 308432' : '308519 / 308520',[circuitPage,circuitPage+1],dual ? '双拨盘开口的 TCC/E12CC 端盖。' : 'E12/E16/E24 的单 ISO 拨盘端盖。'),
      component('circuit-board','电路板',dual ? '308460' : '308524',[circuitPage,circuitPage+1],'按原厂外形和安装层次认件；不模拟电气信号。'),
      component('iso-dial','ISO 拨盘与刻度环','308107 + 308347',[circuitPage,circuitPage+1],dual ? '此型共有两个 308107 拨盘；ISO 一侧刻度环为 308347。' : '此型列 1 个 308107 拨盘与 308347 ISO 刻度环。'),
      component('contact-assembly','片芯接触总成及四条导线','308043',[circuitPage,circuitPage+1],'原图标示 GREEN/WHITE/RED/BLACK；正文拆下端盖涉及拆焊，导线走向只作层次示意。'),
      component('roller','导片滚轴','13514',[40,41],'片芯的两支导片滚轴。')
    ];
    if (dual) components.push(component('compensation-indicator','第二拨盘指示环','308348',[45,46],'TCC/E12CC 专用的第二指示环；名称 Indicator 按原件表翻译。'));
    if (count === 16) components.push(component('eccentric','偏心调节件','22171 + 820013',[31,33],'16 型的偏心调节件及固定螺钉。'));
    const pages = [31,32,33,shellPage,shellPage+1];
    if (!tcc) pages.push(36,37);
    pages.push(40,41,42,circuitPage,circuitPage+1);
    return {id,label:id,family:'electronic',familyLabel:tcc ? 'TCC 电子联络后背' : 'E 系列电子联络后背',pages,mechanismPage:31,shellPage,insertPage:40,scope:dual ? '原厂 TCC/E12CC 双拨盘电路端盖结构；片芯和计数机构按具体容量区分。' : '原厂 E 系列单 ISO 拨盘电路端盖结构；完整外壳图与 1996 外壳改型分别保留来源。',boundary:electronicBoundary,components};
  };
  const instant = (id, label, page) => {
    const is100 = id === 'POLAROID100';
    const basic = id === 'POLABASIC';
    const tablePages = basic ? [58,59,60,61] : [page,page+1];
    const components = [
      component('chassis','后背底架','303323',tablePages,'Chassie：容纳片包并连接各层框板的主体结构。'),
      component('clamp','锁夹','303403',tablePages,'沿侧边固定的夹扣组件。'),
      component('developing-mechanism','显影压辊机构','302427',tablePages,'件表将 Developing mechanism 作为一个总成；模型中的压辊外形用于理解工作区域，不拆造其内部零件编号。'),
      component('film-pack','即显片包','',tablePages,'片包是耗材而非编号维修零件；表中列 Type 107,108,665,667,668,669，不表示这些耗材当前仍供应。'),
      component('frame','内部框架','302428',tablePages,'位于玻璃板周围的内部框架。'),
      component('glass-plate','玻璃板','302404',tablePages,'原厂件表明确称 Glass plate，不能替换为卷片后背的压片板。'),
      component('glass-holder','玻璃固定件','302429',tablePages,is100 ? '100 型件表数量为 4。' : 'PolaPlus 件表数量为 2；PolaBasic 未另列，按其共用说明引用。'),
      component('locking-spring','锁定簧片','303402',tablePages,'连接框板的锁定簧片。'),
      component('inner-plate','中间板','303303',tablePages,'连接前外板和底架的中间板。'),
      component('outer-plate','前连接外板','302322',basic ? [60,61] : tablePages,basic ? '订件时明确注明用于 PolaBasic；同号不表示所有标记、细节均一致。' : '订件时须注明序列号及对应型号。'),
      component('light-trap','插刀遮光件','14195 + 302406',tablePages,'Light trap 与 foil 两件分别列件。'),
      component('locking-arm','锁定臂','302103',tablePages,'前连接面上的锁定臂。'),
      component('dark-slide','插刀',id === 'POLAPLUS' ? 'Z41126' : 'Z41122',basic ? [60,61] : tablePages,id === 'POLAPLUS' ? 'PolaPlus 插刀为 Z41126。' : '100 与 PolaBasic 件表为 Z41122。'),
      component('film-pack-holder','片包保持架','302432',tablePages,'与 302431 销配合，片包位置见分解图右上角小图。')
    ];
    if (is100) components.push(component('slide-holder','插刀收纳件','302101',[56,57],'100 型原表第31位专门列出的插刀收纳件。'));
    else components.push(component('detent','定位钢珠与弹簧','809120 + 815604',tablePages,'Plus 表第27/28位；Basic 表明确未列部件与 Plus 相同，因此也保留此结构。'));
    return {id,label,family:'instant',familyLabel:'Polaroid 即显后背',pages:tablePages,mechanismPage:page,shellPage:page,insertPage:page,scope:basic ? 'PolaBasic 专页及其明确引用的 PolaPlus 共用部件；只单独列出外板和插刀差异。' : '原厂即显片包后背分解图；保留玻璃板、显影压辊机构和片包保持架。',boundary:structuralBoundary,components};
  };
  root.MANUAL_MAGAZINES = [
    mechanical({id:'A12',pages:[12,13,14,15,16,17,18,19,20,21,22,23,24],scope:'沿用既有 A12 学习模型：1996 外观及 RI3250869 起片芯；旧版图作为查阅来源，不混装。'}),
    mechanical({id:'A16',pages:[12,13,14,15,16,17,18,19,20,25,26,27,28,29,30],scope:'沿用既有 A16 学习模型：31EP12395 起片芯、31ET10601 起片距齿轮；旧版仍保留原页。'}),
    mechanical({id:'A16S',pages:[12,13,14,15,16,25,26],scope:'A16S 的旧式壳体、21587 画幅框、30516 支架及 UV211701–31EP12394 片芯图。不能当作 A16 仅换标牌。'}),
    mechanical({id:'A24',pages:[12,13,14,15,16,17,18,19,20,21,22,23,24],scope:'沿用既有 A24 学习模型；21483 中央机构与 21484 片距齿轮分开列件，片芯范围 RI3250869 起。'}),
    mechanical({id:'A32',pages:[27,28,62,63,64,65,66],scope:'A32 独立机构及外壳分解图，共用 A16 后期片芯图；607 系列计数部件不得套成 A12。'}),
    electronic('A12TCC'), electronic('A16TCC'), electronic('A24TCC'),
    electronic('E12'), electronic('E16'), electronic('E24'), electronic('E12CC'),
    {id:'MAGAZINE70',label:'Magazine 70',family:'bulk',familyLabel:'70 型长卷后背',pages:[47,48,49,50,51,52,53,54,55],mechanismPage:49,shellPage:52,insertPage:54,scope:'原厂 Magazine 70 独立支架、机构、壳体与片芯四组图；双片盒和长卷传送结构不沿用 A12 片芯。',boundary:structuralBoundary,components:[
      component('support','后背支架','30759',[47,48],'较早支架为30510；与本型单独列出的机械结构配合。'),
      component('shell','长卷后背外壳','50115 / 50147',[52,53],'镀铬／黑色外壳。'),
      component('outer-plate','前连接外板','40212',[47,48],'前版本13911；原厂要求注明序列号。'),
      component('picture-frame','画幅框','22710',[47,48],'与机身对接的画幅框。'),
      component('dark-slide','插刀','Z41068',[47,48],'件表排版为 Z410 68，目录统一去空格。'),
      component('counter-disc','数字盘及计数轮','13670 + 13669',[49,50],'70 型自己的数字盘与计数轮，不能用 A12 计数盘替代。'),
      component('zero-lever','归零按钮与归零杆','13686 + 13672',[47,48,49,50],'按钮位于支架，归零杆位于机构图。'),
      component('film-feeder','送片件','13668',[49,50],'件表名称 Film feeder；表面轮廓和齿形为示意。'),
      component('film-feeler','感片件与凸轮板','13674 + 13675',[49,50],'感片件与凸轮板按本型机构关系展示。'),
      component('crank','卷片摇柄','21457',[49,51],'与本型传动齿轮相连的摇柄。'),
      component('right-cover','右侧盖','21459 / 22119',[52,53],'镀铬／黑色右盖总成。'),
      component('film-cassette','长卷片盒','51039',[54,55],'原表写 Code No.51039，是片盒产品代号，非内部每个零件的编号。'),
      component('insert-end','片芯端板与中间体','21396 / 22121',[54,55],'镀铬／黑色片芯端板与中间体组合。'),
      component('pressure-plate','压片板','13659',[54,55],'长卷片芯专用压片板。'),
      component('long-roller','长导片滚轴','13661',[54,55],'原表数量为 2。'),
      component('short-roller','短导片滚轴','13660',[54,55],'本型同时有长、短滚轴，不套用 A12 的 13514。')
    ]},
    instant('POLAROID100','Polaroid 100',56),
    instant('POLAPLUS','PolaPlus',58),
    instant('POLABASIC','PolaBasic',60)
  ];
})(typeof window !== 'undefined' ? window : globalThis);
