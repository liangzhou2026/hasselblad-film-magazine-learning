/* Names only from the local Film Magazines service-manual parts tables.
 * Source SHA256: 5D0B9D73A224F6A09F834F72D0D34A9DF927E8C70BCD4CB9C6528793B476C653
 * No positional/function labels are taken from generated geometry metadata.
 */
(function (root) {
  'use strict';

  const names = {
    "Washer": "垫圈",
    "Screw": "螺钉",
    "Plate": "板件",
    "Spring": "弹簧",
    "Shaft": "轴",
    "Arm": "臂",
    "Release arm": "释放臂",
    "Pin": "销",
    "Stop screw": "止挡螺钉",
    "Dial": "刻度盘",
    "Spacing gear": "片距齿轮",
    "Center mechanism": "中央机构",
    "Center mechaniam": "中央机构",
    "Light seal": "遮光密封件",
    "Tape": "胶带",
    "Signal": "信号件",
    "Tape washer": "胶带垫圈",
    "Tape Washer": "胶带垫圈",
    "Cover plate": "盖板",
    "Exposure lock": "曝光锁定件",
    "Plate spring": "板簧",
    "Magazine support": "后背支架",
    "Picture frame": "画幅框",
    "Rivet": "铆钉",
    "Foil": "薄片",
    "Light trap": "遮光件",
    "Magazine slide": "插刀",
    "Ribbon": "带条",
    "Outer plate": "外板",
    "Locking arm": "锁定臂",
    "Locking spring": "锁定弹簧",
    "Return stop": "回位止挡",
    "Gear": "齿轮",
    "Clip": "卡簧",
    "Bracket": "支架",
    "Link": "连杆",
    "Hub": "轮毂",
    "Spring housing": "弹簧壳",
    "Gear assembly": "齿轮总成",
    "Cover": "盖",
    "Eccentric": "偏心件",
    "Leather": "蒙皮",
    "Cover right, complete": "右侧盖总成",
    "Handle": "手柄",
    "Crank mounting": "摇柄座",
    "Film indicator": "胶片指示件",
    "Film Indicator": "胶片指示件",
    "Shell": "外壳",
    "Teflon washer": "聚四氟乙烯垫圈",
    "Button": "按钮",
    "Plate, compl.": "板件总成",
    "Holder": "保持件",
    "Locking shaft": "锁定轴",
    "Number plate": "编号牌",
    "Sealing cord": "密封绳",
    "Roller": "滚轴",
    "Journal": "轴颈",
    "Film guide": "导片件",
    "Lock": "锁定件",
    "Window": "窗口片",
    "Film signal": "胶片信号件",
    "Felt ring": "毡环",
    "Shim": "调整垫片",
    "End plate": "端板",
    "Pressure plate": "压片板",
    "Guide plate": "导向板",
    "Intermed. part + End plate": "中间件与端板",
    "Take-up arm": "收片臂",
    "Plunger": "柱塞",
    "Coupling": "联轴件",
    "Intermed. part": "中间件",
    "Spool center": "卷轴定位芯",
    "Contact flex": "柔性接触件",
    "Dark slide holder": "插刀保持架",
    "Dark slide Holder": "插刀保持架",
    "Support": "支承件",
    "C over": "盖",
    "ISO indicator": "ISO 指示件",
    "Circuit board": "电路板",
    "Steel ball": "钢珠",
    "Contact assembly": "接触总成",
    "Contact assembley": "接触总成",
    "Rubber plate": "橡胶板",
    "Indicator": "指示件",
    "Zero button": "归零按钮",
    "Number disc": "数字盘",
    "Counter wheel": "计数轮",
    "Coil spring": "螺旋弹簧",
    "Pawl": "止动爪",
    "Zero-lever": "归零杆",
    "Catch": "卡扣",
    "Cam": "凸轮",
    "Exposure signal": "曝光信号件",
    "Cam plate": "凸轮板",
    "Film feeler": "感片件",
    "Film feeder": "送片件",
    "Signal catch": "信号卡扣",
    "Gear, lower": "下部齿轮",
    "Cam disc": "凸轮盘",
    "Return coupling": "回位联轴件",
    "Gear, top": "上部齿轮",
    "Magazine shell": "后背外壳",
    "Roller, short": "短滚轴",
    "Endplate + Intermed. part": "端板与中间件",
    "Roller, long": "长滚轴",
    "Chassie": "底架",
    "Clamp": "夹扣",
    "Developing mechanism": "显影机构",
    "Frame": "框架",
    "Glass plate": "玻璃板",
    "Glass holder": "玻璃保持件",
    "Slide holder": "插刀保持架",
    "Film pack holder": "片包保持架",
    "Shade": "遮片",
    "Stop": "止挡"
  };
  // PDF viewer page -> original table description -> verified, normalized numbers.
  // Original spelling is retained, including Chassie, C over and assembley.
  const tables = {
    13: {"Washer":"810927 810926","Screw":"823012 824202","Plate":"308485","Spring":"816505 814527 816502 814508 814852 814803 816611 816509 13820","Shaft":"12819","Arm":"22715","Release arm":"22277 22315","Pin":"812005 13754 812107","Stop screw":"822065","Dial":"13806 13849 13819","Spacing gear":"22371 21583 22841 21484","Center mechanism":"21548 21483","Light seal":"22716 14309 309407","Tape":"22745 309408","Signal":"13031","Tape washer":"308488","Cover plate":"22747","Exposure lock":"21535","Plate spring":"13821","Magazine support":"30752 30751 30516","Picture frame":"22710 22712 21587","Rivet":"833105","Foil":"13508","Light trap":"13067","Magazine slide":"Z41068","Ribbon":"12295"},
    14: {"Locking arm":"20843","Outer plate":"40380 13804","Spring":"814752 814307 14184 816707 814303","Locking spring":"20684","Return stop":"20717","Washer":"810802","Gear":"12209 12215","Clip":"817132","Screw":"823015 823012 824060 820013","Bracket":"21568","Link":"21494","Hub":"14185","Spring housing":"13030","Shaft":"308426","Gear assembly":"308109 309103 311101","Cover":"21490","Eccentric":"22171"},
    16: {"Leather":"13080 12290 21537","Cover right, complete":"30483 30639 30499 30640","Screw":"823012 823015 823013 823017","Pin":"812207","Handle":"13810","Crank mounting":"21572","Spring":"13826","Film indicator":"308328","Tape":"308507","Shell":"308023 308024","Light seal":"22409 12942","Teflon washer":"810761","Button":"22356","Cover":"21456","Rivet":"832203","Plate spring":"21418","Shaft":"13692"},
    26: {"Plate, compl.":"13917","Arm":"13797","Holder":"12279","Plate":"13916 13792","Locking shaft":"13060","Cover":"13795","Number plate":"14261","Screw":"821204 823045 821060 820012 822001 820014 824033","Sealing cord":"308522","Roller":"13514","Journal":"12273","Film guide":"13912 13510","Leather":"12289","Spring":"12267 12307 12769 12540 814522","Lock":"13784","Window":"13791","Film signal":"13785","Clip":"817140","Felt ring":"12268","Washer":"810925 810928 810933 810403","Shim":"12722","End plate":"90394 90458","Plate spring":"13913","Pressure plate":"21615","Guide plate":"21616","Intermed. part + End plate":"21620 22131","Bracket":"21524","Gear":"13794"},
    28: {"Take-up arm":"22398","Plate":"313101 13792","Roller":"13514 22406","Number plate":"14261","Spring":"815608 815512 12267 13913 816616 12540 814952","Plunger":"40318 308356","Screw":"822438 821060 820014 822433 824033","Washer":"810778 308506 810925 810928 810933","Coupling":"308358","Journal":"12273","Film guide":"309403 308345","Lock":"308101","Window":"13791","Film signal":"22382","Clip":"817140 817289","Felt ring":"308410","End plate":"313322","Intermed. part":"309506","Pressure plate":"309102","Bracket":"22379","Gear":"22375","Spool center":"308408","Locking shaft":"308103","Sealing cord":"308522"},
    32: {"Washer":"810927 810926","Screw":"823012 824202","Plate":"308485","Spring":"816505 814527 816502 814508 814852 814803 816611 816509 13820","Shaft":"12819","Arm":"22715","Release arm":"22277 22315","Pin":"812005 13754 812107","Stop screw":"822065","Dial":"13806 13849 13819","Spacing gear":"22371 21583 22841 21484","Center mechanism":"21548","Center mechaniam":"21483","Light seal":"22716 14309 309407","Tape":"22745 309408","Signal":"13031","Tape washer":"308496","Contact flex":"308044","Tape Washer":"308488","Cover":"22747","Exposure lock":"21535","Plate spring":"13821","Magazine support":"308364 309344","Picture frame":"22710 22712","Rivet":"833105","Foil":"13508","Light trap":"13067","Magazine slide":"Z41068","Ribbon":"12295"},
    33: {"Outer plate":"308321 308106","Screw":"823015 823012 824060 820013","Spring":"814752 814307 14184 816707 814303","Locking arm":"20843","Locking spring":"20684","Return stop":"20717","Washer":"810802","Gear":"12209 12215","Clip":"817132","Bracket":"21568","Link":"21494","Hub":"14185","Spring housing":"13030","Shaft":"308426","Gear assembly":"308109 309103 311101","Cover":"308402","Eccentric":"22171"},
    35: {"Film indicator":"308328","Tape":"308507 308487","Dark slide holder":"308366","Support":"308400","Leather":"30312 22404 12290 308411","Screw":"823013 823017 823015 823012","Light seal":"22409","Shell":"308023 308024","Teflon washer":"810761","Button":"22356","Spring":"13826","Pin":"812207","Crank mounting":"21572","Handle":"13810","Cover right, complete":"30483 30639 30499 30640"},
    39: {"Film indicator":"308328","Tape":"308507","Leather":"21537 12290 308411","Screw":"823013 823017 823015 823012","Light seal":"22409 12942","Shell":"308023 308024","Teflon washer":"810761","Button":"22356","Spring":"13826","Pin":"812207","Crank mounting":"21572","Handle":"13810","Cover right, complete":"30483 30639 30499 30640"},
    41: {"Take-up arm":"22398","Plate":"312105 313101 13792","Roller":"13514 22406","Number plate":"14261","Spring":"815608 815512 12267 13913 816616 12540 814952","Plunger":"40318 308356","Screw":"822438 821060 820014 822433 824033 826040","Washer":"810778 308506 810925 810928 810933","Coupling":"308358","Journal":"12273","Film guide":"308346 309403 308345","Lock":"308101","Window":"13791","Film signal":"22382","Clip":"817140 817289","Felt ring":"308410","End plate":"312323 313322","Intermed. part":"308516 309506","Pressure plate":"308104 309102","Bracket":"22379","Gear":"22375","Spool center":"308408","Locking shaft":"308103","Sealing cord":"308522"},
    44: {"Leather":"308521","Screw":"823435 820445 820425 823450 823650","C over":"308519 308520","ISO indicator":"308347","Dial":"308107","Circuit board":"308524","Tape":"308495 308523","Spring":"815604","Steel ball":"809020","Contact assembly":"308043","Rubber plate":"308368"},
    46: {"Leather":"308403","Screw":"823435 820445 823450 823650","C over":"308431 308432","ISO indicator":"308347","Dial":"308107","Circuit board":"308460","Tape":"308495 308492","Contact assembley":"308043","Rubber plate":"309343","Indicator":"308348","Spring":"815604","Steel ball":"809020"},
    48: {"Magazine support":"30759 30510","Zero button":"13686","Washer":"810611","Plate spring":"21413 13821","Rivet":"831305 833105","Return stop":"21414","Pin":"835325 812107","Light seal":"14309","Exposure lock":"21535","Spring":"13820 814752","Foil":"13508","Light trap":"13067","Magazine slide":"Z41068","Ribbon":"12295","Outer plate":"40212 13911","Picture frame":"22710","Screw":"823015 823017","Locking arm":"20843","Locking spring":"20684","Cover":"30676"},
    50: {"Screw":"821004 821035 821205 821230 820020 821830 821011 820014","Number disc":"13670","Clip":"817119 817115 817112 13700","Counter wheel":"13669","Coil spring":"21407 21406","Washer":"810903 810506 21433","Pawl":"13679","Spring":"816708 814307 814518 814507 814309 816710 814303 814310 814515 21434 816711 13699","Zero-lever":"13672","Catch":"13671 13676 13682","Arm":"13673","Cam":"13666","Gear":"13665 21400","Film signal":"21408","Exposure signal":"13677","Pin":"812208","Cam plate":"13675","Film feeler":"13674","Film guide":"21409","Film feeder":"13668","Signal catch":"13678","Gear, lower":"21447","Cam disc":"13681","Return coupling":"21458","Gear, top":"21532"},
    51: {"Return stop":"21432","Spring":"816713","Catch":"13687","Gear":"13667 21403","Washer":"810927","Handle":"21457","Screw":"821013","Leather":"12288"},
    53: {"Cover right, complete":"21459 22119","Film indicator":"308328","Tape":"308507","Light seal":"12942","Leather":"30459 21423 21422","Screw":"823013 820013 823017","Magazine shell":"50115 50147","Sealing cord":"22409","Teflon washer":"810761","Button":"22356","Window":"12492","Cover":"21456","Rivet":"832203","Plate spring":"21418","Shaft":"13692"},
    55: {"Plate, compl.":"21394","Holder":"21375 21376","Coupling":"21378","Spring":"13655 12267 12540","Roller, short":"13660","Number plate":"14261","Sealing cord":"14183","Endplate + Intermed. part":"21396 22121","Leather":"21387 12288","Shim":"12722","Lock":"12728","Screw":"821060 824611 823015","Clip":"817140","Felt ring":"12268","Washer":"810925 810928 810933","Locking shaft":"13662","Film guide":"21389","Journal":"12273","Plate spring":"21388","Pressure plate":"13659","Roller, long":"13661"},
    57: {"Leather":"303401","Chassie":"303323","Clamp":"303403","Developing mechanism":"302427","Frame":"302428","Glass plate":"302404","Screw":"823755 823620 823640","Light seal":"302405 302415 302417 302416 302418","Locking spring":"303402","Glass holder":"302429","Plate spring":"13821","Outer plate":"302322","Ribbon":"12295","Washer":"810528","Locking arm":"302103","Light trap":"14195","Foil":"302406","Plate":"303303","Spring":"814704","Magazine slide":"Z41122","Pin":"812109 302431","Slide holder":"302101","Film pack holder":"302432"},
    59: {"Leather":"303404","Chassie":"303323","Clamp":"303403","Developing mechanism":"302427","Frame":"302428","Glass plate":"302404","Screw":"829845 829525 829540","Light seal":"302405 302415 302417 302416 302418","Locking spring":"303402","Glass holder":"302429","Plate spring":"13821","Outer plate":"302322","Ribbon":"12295","Washer":"810528","Locking arm":"302103","Light trap":"14195","Foil":"302406","Plate":"303303","Spring":"814704 815604","Steel ball":"809120","Pin":"812109 302431","Magazine slide":"Z41126","Film pack holder":"302432"},
    61: {"Outer plate":"302322","Magazine slide":"Z41122"},
    63: {"Washer":"810927 810926 810778","Screw":"823012 824202 820012 823015","Plate":"308485","Spring":"816505 814527 816502 814508 607094 816611 607095 814852 814803 816509 13820 814752","Shaft":"12819","Arm":"607318","Release arm":"22315","Dial":"607320","Shade":"607089","Spacing gear":"607316","Pin":"812005 13754 812107","Clip":"817132","Center mechanism":"607313","Catch":"607096","Stop":"607088","Tape":"22745 309408","Light seal":"22716 309407 14309","Signal":"607314","Tape washer":"308488","Cover plate":"22747","Exposure lock":"21535","Plate spring":"13821","Magazine support":"607311","Foil":"13508","Light trap":"13067","Magazine slide":"Z41068","Picture frame":"22712","Rivet":"833105","Ribbon":"12295","Outer plate":"40380","Locking arm":"20843","Locking spring":"20684"},
    64: {"Return stop":"20717","Washer":"810802","Gear":"12209 12215","Screw":"823012 824060","Bracket":"21568","Link":"21494","Hub":"14185","Spring":"14184 816707 814303 814307","Spring housing":"13030","Shaft":"308426","Gear assembly":"309103"},
    66: {"Film Indicator":"308328","Tape":"308507","Dark slide Holder":"308536","Support":"308400","Leather":"30312 22404 12290 308411","Screw":"823013 826038 823017 823015 823012","Light seal":"22409","Teflon washer":"810761","Button":"22356","Shell":"308023 308024","Spring":"13826","Pin":"812207","Crank mounting":"21572","Handle":"13810","Cover right, complete":"607305 607304"}
  };
  const electronicCore = [32, 33, 41];
  const scopes = {
    A16S: [13, 14, 16, 26],
    A32: [28, 63, 64, 66],
    A12TCC: electronicCore.concat([39, 46]),
    A16TCC: electronicCore.concat([39, 46]),
    A24TCC: electronicCore.concat([39, 46]),
    E12: electronicCore.concat([35, 44]),
    E16: electronicCore.concat([35, 44]),
    E24: electronicCore.concat([35, 44]),
    E12CC: electronicCore.concat([35, 46]),
    MAGAZINE70: [48, 50, 51, 53, 55],
    POLAROID100: [57],
    POLAPLUS: [59],
    POLABASIC: [61, 59]
  };
  const byPage = {};
  for (const [page, descriptions] of Object.entries(tables)) {
    const entries = byPage[page] = {};
    for (const [english, numbers] of Object.entries(descriptions)) {
      for (const number of numbers.split(' ')) {
        if (entries[number]) throw new Error('Conflicting manual name: PDF ' + page + ', ' + number);
        entries[number] = {page:Number(page), number, english};
      }
    }
  }

  function singleNumber(value) {
    const raw = String(value || '').trim();
    // This exact legacy spelling represents one identified slide, not two parts.
    if (raw === 'Z41068（正文写 41068）') return 'Z41068';
    const match = raw.match(/^([Z]?\d{5,6})(?:\s*×\s*\d+)?$/);
    // Composite numbers, consumables, annotations and fabricated identifiers are
    // intentionally left without a part name or part number.
    return match ? match[1] : '';
  }

  root.applyManualPartLabels = function (modelId, parts) {
    const pages = scopes[modelId] || [];
    for (const part of parts) {
      part.labelName = '';
      part.labelNumber = '';
      part.nameSource = null;
      part.labelPages = Array.from(new Set((part.pages || []).filter(Number.isInteger)));
      part.labelDescription = '仅显示形状示意；本图元未核实到单一手册零件名称，不作名称或件号标注。';
      const number = singleNumber(part.number);
      if (!number) continue;
      let source = null;
      for (const page of pages) {
        if (!part.labelPages.includes(page)) continue;
        const candidate = byPage[page] && byPage[page][number];
        if (candidate) { source = candidate; break; }
      }
      if (!source || !names[source.english]) continue;
      const inherited = modelId === 'POLABASIC' && source.page === 59;
      part.labelName = names[source.english];
      part.labelNumber = source.number;
      part.nameSource = Object.assign({}, source, inherited ? {sharedPartsNotePage:61} : {});
      part.labelPages = inherited ? [59,61] : [source.page];
      part.labelDescription = '手册原文：' + source.english + '。名称按 PDF 第 ' + source.page + ' 页件表翻译；位置、形状为演示。' +
        (inherited ? 'PolaBasic 共用件依据 PDF 第 61 页的共用说明。' : '');
    }
    return parts;
  };
}(window));

