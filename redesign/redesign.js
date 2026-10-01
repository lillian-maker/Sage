(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
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
