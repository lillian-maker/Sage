(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const data=window.SAGE_CATALOG;
if(!data){$('#case-screen-title').textContent='案例资料未能加载，请刷新重试。';return;}
const {scenes,people}=data;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const person=id=>people.find(p=>p.id===id);
const heroRoles={'AGT-007':'市场研究','AGT-006':'消费者研究','AGT-003':'经营决策','AGT-023':'独立站经营','AGT-016':'需求与补货','AGT-014':'供应商协同','AGT-019':'物流关务','AGT-024':'新市场经营','AGT-009':'产品定义','AGT-021':'Amazon 经营','AGT-036':'购买指导','AGT-034':'客户复购','AGT-047':'系统与工具','AGT-045':'业务口径','AGT-046':'数据工程','AGT-018':'质量控制','AGT-002':'任务编排','AGT-038':'体验洞察','AGT-001':'目标与资源','AGT-004':'组织能力','AGT-008':'新品孵化','AGT-011':'工程验证','AGT-048':'知识与技能','AGT-005':'独立复核'};
const labels=scenes.map(s=>s.title);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
// Illustrative briefs, grounded in the approved nine-stream catalog.
// No quantitative effect, customer quotation or production receipt is fabricated.
const studioBriefs=[
 {tags:['流量与内容','库存约束','资源预算'],rows:[['商品与渠道','先锁定店铺、商品和可比时间窗'],['增长线索','联合查看内容、广告与库存约束'],['行动优先级','有证据的约束，进入下一步诊断']],note:'先确认增长受限的原因，再决定把资源投向哪里。'},
 {tags:['产品属性','使用情境','支持与反证'],rows:[['舒适体验','柔软与透气：作为正向体验编码'],['稳定性顾虑','支撑与稳定性：按使用情境拆分'],['证据边界','同一条反馈可包含多个方面与不同情感']],note:'舒适体验与稳定性诉求并存，需要分情境验证，不直接推断市场占比。'},
 {tags:['需求版本','交期与产能','库存与资金'],rows:[['需求快照','对齐 SKU、节点与需求版本'],['供应约束','并列查看现货、在途和供应交期'],['资金边界','补货候选与资金占用一起评估']],note:'缺货风险和库存占用一起看，关键交期未知时不承诺到货。'},
 {tags:['目标市场','准入资料','本地化内容'],rows:[['市场范围','锁定市场、渠道、账号和产品'],['资料缺口','产品主数据与准入要求逐项对应'],['发布准备','商品内容、本地化与履约资料一起准备']],note:'翻译完成不等于准入完成，资料缺口必须保留。'},
 {tags:['购买旅程','服务事件','授权触达'],rows:[['旅程断点','归集售前、售后与退货中的同类问题'],['原因分群','区分产品体验、内容理解和服务问题'],['修复协作','让内容、产品与服务岗位分别接住问题']],note:'先修复体验，再设计有授权边界的客户触达。'},
 {tags:['业务决策','数据口径','工具验收'],rows:[['决策问题','明确谁要基于什么信息做出决定'],['口径差异','对齐数据来源、时间范围与质量'],['最小工具','围绕一个可验收的业务问题交付']],note:'从具体决策出发，数据和工具为同一个验收目标服务。'},
 {tags:['影响范围','最小保护','恢复条件'],rows:[['事件信号','记录权威来源和受影响对象'],['保护范围','限定需要暂停的高风险动作'],['恢复依据','列出未决风险与待核实回执']],note:'未证实的告警先核验，不直接触发破坏性操作。'},
 {tags:['经营事实','能力差距','资源调整'],rows:[['经营证据','对齐可比事实、异常与财务口径'],['差距判断','区分经营差距与能力缺口的关系'],['下一周期','把调整建议转成待验证的投入选择']],note:'复盘既看经营结果，也看岗位、知识与工具该如何调整。'},
 {tags:['公开页面','内容诊断','优先行动'],rows:[['访问范围','公开首页与一个代表性商品页'],['问题定位','每一项建议对应具体页面证据'],['运营建议','内容草稿与优先行动分开交付']],note:'先定位已有店铺的问题，再按授权范围推进优化，不自动修改店铺。'}
];
const studio=$('#hero-studio'),savedSteps=scenes.map(()=>0);
let studioScene=1,studioStep=0,studioElapsed=0,studioVisible=false,studioHover=false,studioFocus=false;
const sceneDuration=3000;
const vocPages=[
 {title:'需求证据包',eyebrow:'消费者研究 / 属性 × 情境',rows:studioBriefs[1].rows,note:studioBriefs[1].note,aside:'研究发现',state:'示例归纳 · 非原文引述'},
 {title:'把体验差异，变成机会命题',eyebrow:'机会定义 / 从需求到假设',rows:[['目标情境','明确哪类使用情境需要更稳定的支撑'],['产品取舍','舒适、稳定与低可见性并列评估'],['反证保留','不把所有消费者归入同一种需求']],note:'机会命题：在明确使用情境中，验证舒适与稳定能否同时满足。',aside:'待验证机会',state:'假设待验证'},
 {title:'样品验证，需要真实依据',eyebrow:'验证准备 / 样品与准入',rows:[['样品测试','将舒适与稳定性转成可观察测试项'],['供应可行性','确认材料、制造与质量资料'],['准入缺口','缺失的安全与合规证据保持待补']],note:'AI 组织证据与验证要求，不能替代外部实测和准入资料。',aside:'验证门槛',state:'实测与准入待补'},
 {title:'先定义实验，再投入资源',eyebrow:'商业验证 / 方案草稿',rows:[['实验对象','限定产品、使用人群与渠道'],['观察指标','明确评价方法与反证条件'],['资源边界','预算、授权和停止条件先确认']],note:'验证方案等待人确认；不把演示动画当作真实投放或实验结果。',aside:'实验设计',state:'方案待确认'},
 {title:'让下一步判断有依据',eyebrow:'经营决策 / 组合评估',rows:[['研究依据','需求、情境、反证与样本限制'],['验证依据','核对样品与商业实验的真实记录'],['决策记录','继续、转向或停止，分别保留理由']],note:'验证证据未齐前，保留机会与缺口，不宣布新品成功。',aside:'决策边界',state:'等待验证证据'}
];
function studioState(){
 return reduced.matches||studioHover||studioFocus||!studioVisible||document.hidden;
}
function paintStudio(){
 const s=scenes[studioScene],brief=studioBriefs[studioScene],step=s.steps[studioStep],team=s.team[studioStep];
 studioElapsed=0;
 $('#studio-panel').dataset.scene=s.id;$('#studio-panel').dataset.step=String(studioStep);
 $('#studio-breadcrumb').textContent=labels[studioScene];
 const steps=$('#studio-steps');
 if(steps.dataset.scene!==s.id){steps.innerHTML=s.steps.map((x,i)=>'<button type="button" data-studio-step="'+i+'"><span class="studio-step-dot" aria-hidden="true"></span>'+esc(x.label)+'</button>').join('');steps.dataset.scene=s.id;}
 $$('#studio-steps button').forEach((b,i)=>{b.setAttribute('aria-current',i===studioStep?'step':'false');b.classList.toggle('is-past',i<studioStep);});
 const genericRows=studioStep===0?brief.rows:[
  [step.label,step.detail],
  ['阶段交付',s.deliverables[studioStep]],
  ['接受条件',studioStep===4?s.boundary:'本阶段证据与产物通过验收，再推进下一步。']
 ];
 const p=studioScene===1?vocPages[studioStep]:{title:s.deliverables[studioStep],rows:genericRows,note:studioStep===0?brief.note:studioStep===4?s.boundary:'下一步：'+s.steps[studioStep+1].label+'。'+s.steps[studioStep+1].detail,aside:studioStep===4?'交付边界':'下一步',state:studioStep>=3?'执行与效果待核验':'方案结构示例'};
 $('#studio-title').textContent=p.title;$('#studio-eyebrow').textContent=s.product+' · '+(studioScene===1?'VOC 案例 / ':'')+step.label;
 $('#studio-page-number').textContent=String(studioStep+1).padStart(2,'0')+' / 05';
 $('#studio-document').innerHTML='<div class="studio-evidence"><div class="studio-tags">'+brief.tags.map(t=>'<span>'+esc(t)+'</span>').join('')+'</div><div class="studio-rows">'+p.rows.map((r,i)=>'<article class="studio-row" style="--row:'+i+'"><span class="studio-evidence-dot" aria-hidden="true"></span><div><h3>'+esc(r[0])+'</h3><p>'+esc(r[1])+'</p></div><span class="studio-row-index" aria-hidden="true">0'+(i+1)+'</span></article>').join('')+'</div></div><aside class="studio-insight"><svg viewBox="0 0 28 28" aria-hidden="true"><path d="m14 3 3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/></svg><h3>'+esc(p.aside)+'</h3><p>'+esc(p.note)+'</p><span>'+esc(p.state)+'</span></aside>';
 const roles=[...new Set([team.lead,...team.contributors.slice(0,2),...team.assurance.slice(0,1)])].slice(0,4);
 $('#studio-team').innerHTML=roles.map((id,i)=>{const p=person(id);return '<div class="studio-member'+(i===0?' is-lead':'')+'"><span class="studio-avatar"><img src="'+esc(p.avatar)+'" alt="" width="36" height="36"></span><div><strong>'+esc(p.name)+'</strong><span>'+esc(heroRoles[id]||p.role)+'</span></div></div>';}).join('');
 $('.studio-team-label').textContent=team.label;
 // Keep active controls visible without scrolling the surrounding page.
 for(const [container,active] of [[steps,steps.querySelector('[aria-current="step"]')]]){
  const c=container.getBoundingClientRect(),a=active.getBoundingClientRect();
  if(a.left<c.left||a.right>c.right)container.scrollLeft+=a.left-c.left-(c.width-a.width)/2;
 }
}
const warmedAvatars=new Set();
function preloadNextStudio(){
 const next=(studioScene+1)%scenes.length,s=scenes[next],team=s.team[savedSteps[next]];
 const ids=[...new Set([team.lead,...team.contributors.slice(0,2),...team.assurance.slice(0,1)])];
 for(const id of ids){const p=person(id);if(warmedAvatars.has(p.avatar))continue;const image=new Image();image.decoding='async';image.fetchPriority='low';image.src=p.avatar;warmedAvatars.add(p.avatar);}
}
function chooseStudio(i){studioScene=(i+scenes.length)%scenes.length;studioStep=savedSteps[studioScene];paintStudio();preloadNextStudio();}
$('#studio-prev').addEventListener('click',()=>chooseStudio(studioScene-1));
$('#studio-next').addEventListener('click',()=>chooseStudio(studioScene+1));
$('#studio-steps').addEventListener('click',e=>{const b=e.target.closest('[data-studio-step]');if(!b)return;studioStep=Number(b.dataset.studioStep);savedSteps[studioScene]=studioStep;paintStudio();});
studio.addEventListener('mouseenter',()=>studioHover=true);studio.addEventListener('mouseleave',()=>studioHover=false);
studio.addEventListener('focusin',()=>studioFocus=true);studio.addEventListener('focusout',()=>requestAnimationFrame(()=>studioFocus=studio.contains(document.activeElement)));
new IntersectionObserver(entries=>{studioVisible=entries[0].isIntersecting;},{threshold:.25}).observe($('#studio-panel'));
let lastStudioTick=performance.now();
const studioTimer=setInterval(()=>{
 const now=performance.now(),delta=Math.min(now-lastStudioTick,200);lastStudioTick=now;
 if(studioState())return;studioElapsed+=delta;
 if(studioElapsed>=sceneDuration)chooseStudio(studioScene+1);
},100);
window.addEventListener('pagehide',e=>{if(!e.persisted)clearInterval(studioTimer);});
paintStudio();preloadNextStudio();

const assurance={
 evidence:{title:'每个判断，都能回到依据。',body:'保留来源、对象与分析范围。将支持、反证和待验证假设分开，而不是只交付一个答案。',left:'研究产物',rows:['消费者反馈 · 来源','多维标签 · 分析范围','支持与反证 · 判断依据'],gate:'独立复核',right:'可追溯的结论',detail:'产物版本与接受标准',state:'证据不足时，先补证',icon:'document'},
 permission:{title:'能提出建议，不等于能执行。',body:'明确组织、店铺与操作对象。权限和积分预算在模型之外校验，需要人确认的动作不会被自动略过。',left:'待执行方案',rows:['店铺与商品 · 操作对象','读取或写入 · 权限范围','预计与最高消耗 · 积分预算'],gate:'权限校验',right:'有边界的行动',detail:'按授权范围执行',state:'未获授权，不执行',icon:'lock'},
 receipt:{title:'有回执，才有完成的依据。',body:'对照实际回执判断完成、失败或未知。保留已有成果与错误位置，不把“已发起”当作“已完成”。',left:'任务与产物',rows:['已接受产物 · 版本','执行请求 · 具体对象','实际回执 · 对照核验'],gate:'回执核验',right:'可核验的结果',detail:'完成 / 失败 / 未知',state:'状态未知，先核查',icon:'receipt'}
};
function paintAssurance(key){
 const a=assurance[key];$$('[data-assurance]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.assurance===key)));
 $('#assurance-work').innerHTML='<div class="assurance-copy"><h3>'+a.title+'</h3><p>'+a.body+'</p><span class="assurance-boundary">产品机制示意</span></div><div class="assurance-diagram"><div class="evidence-sheet"><div class="sheet-head"><svg viewBox="0 0 24 28" aria-hidden="true"><path d="M4 2h11l5 5v19H4zM15 2v6h5M8 14h8M8 19h6"/></svg><strong>'+a.left+'</strong></div>'+a.rows.map((r,i)=>'<div class="evidence-row"><span class="evidence-pin"></span>'+r+'</div>').join('')+'</div><div class="assurance-gate"><span class="gate-line"></span><div class="gate-symbol"><svg viewBox="0 0 40 44" aria-hidden="true"><path d="M20 3 5 9v12c0 10 15 19 15 19s15-9 15-19V9z"/><path d="m12 20 6 6 12-13"/></svg></div><strong>'+a.gate+'</strong></div><div class="assurance-result"><strong>'+a.right+'</strong><span>'+a.detail+'</span><p>'+a.state+'</p></div></div>';
}
$$('[data-assurance]').forEach(b=>b.addEventListener('click',()=>paintAssurance(b.dataset.assurance)));paintAssurance('evidence');
$('#r-contact-form').addEventListener('submit',e=>{e.preventDefault();$('#r-form-status').textContent='咨询接收服务尚未接通。内容未发送、未保存，请勿在预览中填写敏感资料。';});
})();
