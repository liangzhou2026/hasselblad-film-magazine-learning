/* Assembly teaching routes for later mechanical A12 / A16 / A24.
 * Run AFTER A12_VARIANTS.prepare(), using a pristine assembly snapshot taken
 * AFTER buildMagazineFasteners() and BEFORE A12_VARIANTS.prepare().
 * S3 PDF 7–11 supplies the order; PDF 13–14 supplies variant part identities.
 * S7 Service Info supplies the version exceptions. See the evidence note.
 * The stable p_* IDs identify existing animation slots, not display part numbers.
 */
(() => {
  'use strict';
  const configurations = {
    A12: {dial:'13806', spacing:'22371', center:'21548', release:'22277', drive:'308109', support:'30752', insertPages:[23,24]},
    A16: {dial:'13849', spacing:'22841', center:'21548', release:'22277', drive:'309103', support:'30751', insertPages:[27,28,29,30]},
    A24: {dial:'13819', spacing:'21484', center:'21483', release:'22315', drive:'311101', support:'30752', insertPages:[23,24]}
  };
  const commonBoundary = '拆卸与安装均按所选后期机械版本提供教学顺序；安装独立依据手册装回正文，包含润滑、预紧提示和修后检查。动画只显示零件先后与层次，不模拟真实弹簧预紧、齿轮相位、涂油或校准结果。片芯按完整总成装回。';
  const modelBoundary = {
    A12:'选用后期轴308426、机构板308485和短弹簧814527；不混入旧轴12781、旧机构板13805及长弹簧814507。',
    A16:'选用22841间距齿轮、814527双弹簧、偏心件22171及机械片芯309022/309023；片芯内部只作认件，未提供逐件安装路线。画框遮光条与首张位置须按A16专用说明检查。',
    A24:'选用21483中央机构、22315释放臂及后期固定止挡822065；不套用A16偏心调整。短弹簧支架需按实物销位确认，通告未给A24起始序号。方形画框独立备件号仍未核实。'
  };

  window.prepareA12AssemblyVariant = function(profile, sequences, baseAssembly) {
    const id = profile && profile.id;
    const cfg = configurations[id];
    if (!cfg || !sequences || !Array.isArray(baseAssembly)) throw new Error('安装演示缺少有效型号或原始步骤');
    const expected = Array.from({length:26}, (_,i) => 'a' + String(i+1).padStart(2,'0'));
    if (baseAssembly.length !== expected.length || expected.some((sid,i) => baseAssembly[i]?.id !== sid)) {
      throw new Error('安装变体需要完整、有序的 a01–a26 原始步骤');
    }
    // Copy every action array and any future nested metadata; never mutate the
    // baseline or borrow a different model's already rewritten prose.
    const route = JSON.parse(JSON.stringify(baseAssembly));
    const numberMap = {'13806':cfg.dial,'22371':cfg.spacing,'21548':cfg.center,'22277':cfg.release,'308109':cfg.drive};
    for (const item of route) {
      for (const key of ['title','body','note']) {
        if (typeof item[key] === 'string') item[key] = item[key].replace(/\b(13806|22371|21548|22277|308109)\b/g, n => numberMap[n]);
      }
      item.model = id;
      item.assemblyEvidence = 'S3 PDF 7–11 装回正文；型号件号据 PDF 13–14 对应。三维运动为教学分离与合拢。';
      item.serviceInfoPages = [];
    }
    const byId = new Map(route.map(item => [item.id,item]));
    const patch = (sid, values) => Object.assign(byId.get(sid), values);
    const info = (sid, pages) => { byId.get(sid).serviceInfoPages = pages.slice(); };

    patch('a01', {
      body:'先按 PDF 7 图 2 的相对位置把外壳装到 '+id+' 支架 '+cfg.support+'。本演示为改型壳体：将原位的 3 枚 823013 和 2 枚 823017 装回，再复位饰皮。',
      note:'S3 PDF 7 正文写 5 枚 820013/823017；PDF 18 改型件表写 3 枚 823013 加 2 枚 823017。此处按选定的后期壳体件表，不追加早期侧向螺钉；没有原厂扭矩数值。'
    });
    info('a01',[78,79,81]);
    patch('a07', {
      body:'使用后背量规 V-4548 检查 '+id+' 画幅框边缘与前外板之间的距离。S3 PDF 7 图 3 给出 3.55 mm ± 0.05 mm；该距离须在实体上测量。',
      note:'保留支架上的原画幅框，本路线没有拆铆或重新铆接动作。模型无测量精度；屏幕上合拢不能证明胶片平面合格。'
    });
    patch('a08', {
      body:'按 S3 PDF 8 图 4 的实心点查找需涂脂的接触处，使用 ISOFLEX TOPAS L 32，然后装入 '+id+' 释放臂 '+cfg.release+'。',
      note:'装回正文用A12图例说明共用机构；本型号件号按PDF13选择。先对照实际零件确认接触部位，不能把示意高亮整面当作涂脂区。'
    });
    patch('a09', {
      body:'给 '+id+' 中央机构 '+cfg.center+' 的齿轮和轴使用少量润滑油，再将机构套到 S3 PDF 8 图 4 的 A 标记销上，暂候装入间距轮。',
      note:'共用装回正文写 some drops of oil，PDF13分别列出本型号中央机构；不能把总成浸油或以脂代替油。图7才明确标注PDP48的空心点，不能凭此句补造额外加油点。'
    });
    patch('a10', {
      body:'装入 '+id+' 间距齿轮 '+cfg.spacing+'，再将中央机构 '+cfg.center+' 放入支架 '+cfg.support+' 的轴毂。',
      note:'安装先后来自S3 PDF8；'+id+'零件身份来自PDF13。不能因总成外形相近而跨型号互换。'
    });
    patch('a11', {
      body:'将弹簧 816611 装入 '+id+' 间距齿轮 '+cfg.spacing+'。共用装回正文要求：按 PDF 8 图 4、图 5 的机构侧正视方向，顺时针预紧约 1½ 圈；将轮转向止挡后检查能回到零位。',
      note:'这是手册规定的实体预紧与回零检查。动画不转动弹簧或模拟止挡，不能从屏幕旋向、轮齿或拖动次数取得预紧量。'
    });
    patch('a12', {
      body:'装摆臂 22715；按图 4 给轴 12819 涂脂后安装，再把 2 根后期短弹簧 814527 挂到图示 A 销。支架销位必须与所选弹簧配置一致。',
      note: id === 'A24'
        ? 'S7 PDF112包括A24，但没有给出A24改型起始序号。须核对实物支架销位；不可把814527拉伸后代替旧814507。'
        : id === 'A16'
          ? 'S7 PDF110–111：自31ET10601起，22841间距轮、改变销位的30751支架与两根814527配套；旧轮21583/旧簧814507不能混用。'
          : 'S7 PDF112：A12自30ET14879起改变支架销位并改用两根814527；旧簧814507不能仅按外观替代。'
    });
    info('a12',id === 'A16' ? [110,111] : [112]);
    if (id === 'A16') info('a10',[110,111]);
    patch('a14', {
      body:'将 '+id+' 计数盘 '+cfg.dial+' 装到间距齿轮 '+cfg.spacing+'，用 3 枚 824202 固定。按手册先不要拧得过紧，保留自动停片相位调整条件。',
      note:'刻度分别为该型号的12/16/24张计数范围。最终拧紧和防松漆在a22相位核对后完成；手册未给数值扭矩。'
    });
    patch('a17', {
      body:'在装回 '+id+' 传动齿轮组 '+cfg.drive+' 前，查阅 S3 PDF 9 图 7：实心点用 ISOFLEX TOPAS L 32，空心点用 ISOFLEX PDP 48，箭头特别指出的齿部在其内侧润滑。',
      note:id === 'A12'
        ? '图7以308109为例；严格对应原图与实物接触处，不能把整组外齿涂满。动画只索引油与脂，不演示未经测量的点油量。'
        : '图7正文以A12的308109为例；本型号总成号据PDF14和S7 PDF120确定。应在实物上核对对应接触面，不把A12示意圆点直接当成本型号所有内部润滑点已逐点确认。'
    });
    info('a17',[120]);
    patch('a18', {
      body:'按 S3 PDF 9 图 8 的机构侧正视方向，将弹簧壳 13030 顺时针转约 1½ 圈，使卷簧 14184 预紧；保持该位置，再装 '+id+' 传动齿轮组 '+cfg.drive+' 并核对原图相位。',
      note:'共用正文中的约1½圈保留为实物操作提示。动画不模拟释放能量、齿轮啮合或预紧；本型号总成由PDF14与S7 PDF120对应。'
    });
    info('a18',[120]);
    info('a19',[120]);
    info('a20',[120]);
    const stopBody = '按入销 13754，按 S3 PDF 9 图 9 的机构侧正视方向顺时针转齿轮 12209，直到 '+id+' 释放臂 '+cfg.release+' 落入间距轮 '+cfg.spacing+' 下方第一个凹口。此时压板 308485 的止挡也应落入计数盘 '+cfg.dial+' 的凹口；通过转动计数盘核对同步。';
    patch('a22', {
      body:stopBody,
      note:'达到正确相位后，拧紧3枚824202并按手册使用防松漆。本型号不采用A16的偏心调整；动画没有验证首张位置、自动停片或计数相位。'
    });
    if (id === 'A16') {
      patch('a07', {
        body:byId.get('a07').body+' 如需更换后期画框的遮光条，先确认画框22712已固定在支架，再装2条胶带309408与2条遮光条309407，使遮光条边与支架边齐平。',
        note:'遮光条次序与齐边要求来自S7 PDF109（10/97）；这是维护分支，不要求为更换遮光条拆除画框铆钉。三维把画框和遮光条作为认件总成，不模拟贴胶过程。',
        focus:[...new Set([...byId.get('a07').focus,'p_22710'])]
      });
      info('a07',[109]);
      patch('a22', {
        title:'校准自动停片，再核对A16偏心件',
        body:stopBody+' 计数盘相位正确后紧固3枚824202并用防松漆固定。首张位置还需单独核对偏心件22171：确需调整时松开820013，按原图及试片结果调整，再紧固并依手册用Loctite固定。',
        focus:[...new Set([...byId.get('a22').focus,'p_22171','p_822065'])],
        pages:[9,12,13,14],
        note:'S3 PDF9基本位以原厂Kodak Plus-X参考胶片为基准。S7 PDF169（2/2000）要求：序号31EE10250–31EE10740且有首张位置问题的A16，检查并回到图2基本位。不要凭模型偏心外形、画面角度或所有胶片通用的假设调节；动画不自动转动22171。'
      });
      info('a22',[169]);
    } else if (id === 'A24') {
      patch('a22', {
        note:'相位正确后，紧固3枚824202并用防松漆固定。本示例采用32ET10135起的固定止挡822065（S7 PDF92，220胶片的24系列），不用A16偏心件22171调整。旧A24若仍装偏心件须另查版本；画面不能证明首张或片距合格。'
      });
      info('a22',[92]);
    }
    patch('a23', {
      body:'装回 '+id+' 右侧盖与随盖保留的摇柄总成，用 3 枚 823012 固定，再复位饰皮。仅当实物具备该配置时装回插刀收纳架。',
      note:'只采用S3 PDF10的Right cover段。其后的电路板拆焊与电子片芯装配不属于普通机械'+id+'，不能因部分共用件号而套用。'
    });
    patch('a24', {
      body:'将完整 '+id+' 机械片芯装回后背，过片并在实体上检查首张自动停片。'+(id === 'A16' ? '本示例为31EP12395起片芯309022/309023；端板改型还须核对31ET10171起的紧固件。' : '本示例为S3 PDF23–24列出的RI3250869起A12/A24机械片芯。'),
      pages:[11,...cfg.insertPages],
      note:'片芯内部未在本路线拆散，因此只整组装回。没有把电子片芯的PDF10施工步骤换号套用；片芯配对、压力和首张位置仍需实物检查。'
    });
    if (id === 'A16') info('a24',[80,93]);
    patch('a25', {
      body:'把 '+id+' 后背装到兼容机身，做数次试曝光，检查计数盘 '+cfg.dial+'、曝光指示和联动。取出片芯检查计数是否归零，再按正常流程装回。',
      note:'S3 PDF11的机械检查要求；A16按16张机构、A24按24张机构识别。动画播放完毕不代表这些实体项目已经通过。'
    });
    patch('a26', {
      body:'用与 '+id+' 及其片芯配置相符的可牺牲测试胶片，按S3 PDF11在每次曝光后于画幅框内作标记，检查各画幅位置及间距，同时检查余片指示随过片逐渐由白变红。',
      note:id === 'A24'
        ? '本后期A24固定止挡依据的S7 PDF92明确限定220胶片24系列；不能由本模型推导120胶片也能获得24张或片距合格。另做实拍冲洗检查漏光、划痕是补充验收建议。'
        : '试卷须验证实际首张位置与全卷间距；摇柄手感或三维合拢都不能代替。另做实拍冲洗检查漏光与划痕是补充验收建议。'
    });
    if (id === 'A24') info('a26',[92]);
    profile.assemblyVerified = true;
    profile.assemblyVerification = 'manual-order-teaching';
    profile.assemblyScope = 'S3装回正文与分型号件表对应的26阶段教学；实体校准未验证';
    profile.boundary = modelBoundary[id]+' '+commonBoundary+' 三维尺寸、齿形与移动路径仍为示意。';
    sequences.assembly = route;
    sequences.boundary = profile.scope+'。'+profile.boundary+' '+profile.serial;
    return profile;
  };
})();
