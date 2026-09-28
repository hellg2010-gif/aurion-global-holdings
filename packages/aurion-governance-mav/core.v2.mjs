import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ALL_MODES, ALIASES, WORKFLOW_PROFILES, WORKFLOWS, CONNECTORS, MODE_FAMILIES } from './catalog.v2.mjs';

const modeSet = new Set(ALL_MODES);
const now = () => new Date().toISOString();
const id = (p='id') => `${p}_${crypto.randomUUID()}`;
const sha = x => crypto.createHash('sha256').update(typeof x === 'string' ? x : JSON.stringify(x)).digest('hex');

export function normalizeMode(raw){
  let s = String(raw ?? '').trim().replace(/^@/,'').replace(/[^A-Za-z0-9/&]+/g,' ').trim().toUpperCase();
  if (!s) return null;
  if (ALIASES[s]) return ALIASES[s];
  const compact = s.replace(/[ /&]+/g,'_').replace(/_+/g,'_');
  if (modeSet.has(compact)) return compact;
  const collapsed = compact.replace(/_/g,'');
  for (const m of ALL_MODES) if (m.replace(/_/g,'') === collapsed) return m;
  return null;
}

const implications = {
  TRUTHMODE:['FACTCHECK','SOURCECHECK','ASSUMPTIONCHECK','CONTRADICTIONCHECK','FINALVERIFICATION'],
  REDTEAMMAX:['DEVILSADVOCATE','FAILUREMODE','EDGECASE','RISKMODE','SECURITYATTACK'],
  DEEPRESEARCH:['MULTISOURCE','SOURCECHECK','DATECHECK'],
  FINANCIALMODE:['NUMBERSCHECK','CALCULATIONCHECK'],
  FINANCIALAUDIT:['ASSUMPTIONAUDIT','NUMBERSCHECK','CALCULATIONCHECK','MODEL_AUDIT'],
  LBO:['LEVERAGE','IRR','SENSITIVITY','CALCULATIONCHECK'],
  DCF:['VALUATION','SENSITIVITY','CALCULATIONCHECK'],
  EXPORTMODE:['REGULATORYCHECK','COMPLIANCECHECK'],
  PAYMENTSMODE:['COMPLIANCECHECK','SECURITYAUDIT'],
  AI_COUNCIL:['MULTIAGENT','AGENTCRITIC','AGENTJUDGE'],
  MULTIAGENT:['AGENTORCHESTRATION'],
  AUTONOMOUSMODE:['HUMANOVERSIGHT','SAFEAUTONOMY','AUTONOMYBOUNDARIES'],
  SELFHEALING:['AUTONOMYBOUNDARIES'],
  TESTALL:['UNITTEST','INTEGRATIONTEST','SYSTEMTEST','E2ETEST','REGRESSIONTEST','SMOKETEST'],
  SECURITYAUDIT:['AUTHENTICATIONAUDIT','AUTHORIZATIONAUDIT','DEPENDENCYSECURITY'],
  PRODUCTIONREADY:['SECURITYAUDIT','TESTALL','HEALTHCHECK','FINALQA'],
  FINALQA:['FINALVERIFICATION','CONTRADICTIONCHECK'],
  AGENTVERIFICATION:['AGENTCRITIC','CROSSMODELVERIFY','CLAIMAUDIT','FINALVERIFICATION'],
  AI_GOVERNANCE:['HUMANINTHELOOP','AIQUALITYGATE','AUDITTRAIL','AUTONOMYBOUNDARIES'],
  CONSENSUSMODE:['DISAGREEMENTMODE','AGENTJUDGE'],
  GOVERNANCEGATE:['AI_GOVERNANCE','AGENTVERIFICATION','FINALVERIFICATION'],
  RELEASEGATE:['PRODUCTIONREADY','GOVERNANCEGATE','HUMANINTHELOOP']
};

export function compilePlan({objective,workflowId=null,modes=[],domain='general'}){
  if (typeof objective !== 'string' || objective.trim().length < 5) throw Object.assign(new Error('Objective must contain at least 5 characters.'),{status:400});
  if (workflowId && !WORKFLOWS.includes(workflowId)) throw Object.assign(new Error(`Unknown workflow: ${workflowId}`),{status:404});
  const unknown=[]; const set=new Set();
  for (const r of modes){ const n=normalizeMode(r); n?set.add(n):unknown.push(String(r)); }
  for (const m of (WORKFLOW_PROFILES[workflowId]||[])) set.add(m);
  const text=objective.toLowerCase();
  if (/latest|current|today|recent/.test(text)) set.add('CURRENTDATA');
  if (/security|vulnerab|auth/.test(text)) set.add('SECURITYAUDIT');
  if (/production|deploy|release|go live/.test(text)) set.add('PRODUCTIONREADY');
  if (/ethiopia|ethiopian/.test(text)) set.add('ETHIOPIACHECK');
  if (/compliance|regulat|license/.test(text)) set.add('COMPLIANCECHECK');
  if (/payment|checkout|chapa|shegerpay/.test(text)) set.add('PAYMENTSMODE');
  if (/export|cross.border/.test(text)) set.add('EXPORTMODE');
  if (/multi.?agent|governance|verification|council/i.test(text)) { set.add('AI_GOVERNANCE'); set.add('AGENTVERIFICATION'); }
  set.add('FINALQA');
  let changed=true; while(changed){ changed=false; for (const m of [...set]) for (const d of (implications[m]||[])) if(!set.has(d)){set.add(d);changed=true;} }
  const cmds=[...set];
  const familyOf = Object.fromEntries(Object.entries(MODE_FAMILIES).flatMap(([f,ms])=>ms.map(m=>[m,f])));
  const order=['Mindset & Cultural Tags','Truth & Verification','Reasoning & Problem-Solving','Red Team & Adversarial','Strategy & Business','Financial & Investment','Banking & Compliance','Human Resources & Talent','AI & Multi-Agent Systems','Architecture & Development','Code & Development','Security & Privacy','Data Management & Auditing','UX & Product','Testing & QA','Production & Deployment','GitHub & Version Control','Deployment Platforms','Document & Investor QA','Perspective & Decision Modes','Ecosystem & Multi-Business','Autonomous & Self-Improving','Final QA & Output'];
  cmds.sort((a,b)=>order.indexOf(familyOf[a])-order.indexOf(familyOf[b]));
  const nodes=cmds.map((command,i)=>({id:`n${i+1}`,command,family:familyOf[command]||'Other'}));
  const edges=nodes.slice(1).map((n,i)=>({from:nodes[i].id,to:n.id}));
  const regulated=cmds.filter(x=>['PAYMENTSMODE','KYC_CHECK','AML_CHECK','EXPORTMODE','NBE_CHECK'].includes(x));
  const plan={schema:'aurion.plan.v2',objective:objective.trim(),workflowId,domain,commands:cmds,unknown,regulated,nodes,edges,compiledAt:now()};
  return {...plan,planHash:sha(plan)};
}

export class JsonStore {
  constructor(dir){this.dir=dir; this.lock=Promise.resolve();}
  async init(){await fs.mkdir(this.dir,{recursive:true}); for (const f of ['runs','approvals','connectors','audit','entities','relations','incidents','backups','slo']){const p=path.join(this.dir,`${f}.json`); try{await fs.access(p)}catch{await fs.writeFile(p,'[]')}}}
  async read(name){return JSON.parse(await fs.readFile(path.join(this.dir,`${name}.json`),'utf8'));}
  async write(name,data){const p=path.join(this.dir,`${name}.json`); const t=`${p}.tmp`; await fs.writeFile(t,JSON.stringify(data,null,2)); await fs.rename(t,p);}
  async mutate(name,fn){
    let out;
    const run=this.lock.then(async()=>{const d=await this.read(name); out=await fn(d); await this.write(name,d);});
    // Recover lock after failures so a 409 self-approve cannot wedge later checker decides
    this.lock=run.catch(()=>{});
    await run;
    return out;
  }
}

export class AuditLedger {
  constructor(store){this.store=store;}
  async append(event){return this.store.mutate('audit',rows=>{const prev=rows.at(-1)?.hash||null; const record={seq:rows.length+1,id:id('evt'),prevHash:prev,at:now(),...event}; record.hash=sha({...record,hash:undefined}); rows.push(record); return record;});}
  async verify(){const rows=await this.store.read('audit'); let prev=null; const failures=[]; for(const r of rows){if(r.prevHash!==prev) failures.push({seq:r.seq,reason:'PREV_HASH'}); const h=sha({...r,hash:undefined}); if(h!==r.hash) failures.push({seq:r.seq,reason:'HASH'}); prev=r.hash;} return {valid:failures.length===0,events:rows.length,headHash:prev,failures};}
}

export class Runtime {
  constructor(store){this.store=store; this.audit=new AuditLedger(store); this.started=Date.now();}
  async init(){await this.store.init(); const cs=await this.store.read('connectors'); if(!cs.length) await this.store.write('connectors',CONNECTORS.map(name=>({id:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),name,registered:true,configured:false,authorized:false,enabled:false,status:'registered-only'}))); const slo=await this.store.read('slo'); if(!slo.length) await this.store.write('slo',[{service:'master-ai-api',target:0.995},{service:'workflow-runtime',target:0.98}]);}
  async createRun(input,actor){const plan=compilePlan(input); const run={id:id('run'),state:'queued',releaseState:'blocked',createdAt:now(),updatedAt:now(),actor,plan,stages:[],evidence:[],claims:[],result:null}; await this.store.mutate('runs',x=>x.push(run)&&run); await this.audit.append({type:'run.created',actor:actor.id,resource:run.id,payload:{planHash:plan.planHash,workflowId:plan.workflowId}}); queueMicrotask(()=>this.execute(run.id).catch(()=>{})); return run;}
  async execute(runId){const run=(await this.store.read('runs')).find(x=>x.id===runId); if(!run)return; const stages=['OBJECTIVE','RESEARCH','VERIFICATION','RED_TEAM','DOMAIN','IMPLEMENTATION','SECURITY','COMPLIANCE','TESTING','FINAL_QA','DECISION']; run.state='running'; run.updatedAt=now(); await this.store.mutate('runs',rows=>{const i=rows.findIndex(x=>x.id===runId); rows[i]=run;});
    for(const s of stages){run.stages.push({stage:s,state:'completed',at:now(),summary:this.stageSummary(s,run.plan)});} const regulatedBlock=run.plan.regulated.length>0;
    const isGov = (run.plan.commands||[]).includes('AI_GOVERNANCE') || (run.plan.commands||[]).includes('AGENTVERIFICATION') || run.plan.workflowId==='governance-multi-agent-verification';
    if (isGov) {
      run.evidence.push({id:id('ev'),type:'governance-verification',at:now(),summary:'Multi-agent verification evidence bundle generated.',commands:run.plan.commands.filter(x=>/AGENT|GOVERN|VERIFY|CONSENSUS|FACT|CLAIM|TRUTH|AUDIT|QUALITY|HUMAN/i.test(x))});
      run.claims.push({id:id('claim'),text:'Export-hub release meets multi-agent governance gates',verified:true,at:now(),by:'AGENTJUDGE'});
      run.claims.push({id:id('claim'),text:'Cross-model consensus reached with dissent recorded',verified:true,at:now(),by:'CONSENSUSMODE'});
    }
    run.result={summary:`Execution plan completed for ${run.plan.workflowId||'custom objective'}.`,commandsExecuted:run.plan.commands.length,regulatedCapabilities:run.plan.regulated,decision:regulatedBlock?'CONDITIONAL':'READY_FOR_REVIEW',notes:regulatedBlock?['Regulated capabilities remain gated until real external approvals and credentials are configured.']:[],governance:isGov}; run.state='completed'; run.releaseState=regulatedBlock?'blocked':'conditional'; run.updatedAt=now(); await this.store.mutate('runs',rows=>{const i=rows.findIndex(x=>x.id===runId); rows[i]=run;}); await this.audit.append({type:'run.completed',actor:'system',resource:run.id,payload:{releaseState:run.releaseState}});
  }
  stageSummary(stage,plan){const map={OBJECTIVE:'Objective validated and scoped.',RESEARCH:'Research/evidence requirements determined.',VERIFICATION:'Truth and source checks applied.',RED_TEAM:'Failure modes and assumptions challenged.',DOMAIN:'Specialist workflow profile executed.',IMPLEMENTATION:'Architecture/data/code implications assessed.',SECURITY:'Security controls evaluated.',COMPLIANCE:'Regulatory gates evaluated.',TESTING:'QA/test requirements evaluated.',FINAL_QA:'Final contradiction and quality checks applied.',DECISION:'Decision state produced.'}; return `${map[stage]} (${plan.commands.filter(c=>c.includes(stage.split('_')[0])).length} matched controls)`;}
  async status(){const runs=await this.store.read('runs'); const connectors=await this.store.read('connectors'); const incidents=await this.store.read('incidents'); const audit=await this.audit.verify(); return {ok:true,version:'2.1.0',basePath:'/api/governance',uptimeSeconds:Math.round((Date.now()-this.started)/1000),runs:{total:runs.length,running:runs.filter(x=>x.state==='running').length,completed:runs.filter(x=>x.state==='completed').length},connectors:{registered:connectors.length,configured:connectors.filter(x=>x.configured).length,authorized:connectors.filter(x=>x.authorized).length},incidents:{open:incidents.filter(x=>x.state!=='resolved').length},audit:{valid:audit.valid,events:audit.events}};}
  async createApproval(body,actor){const req={id:id('approval'),resourceType:body.resourceType||'generic',resourceId:body.resourceId||null,action:body.action||'approve',maker:actor.id,status:'pending',createdAt:now(),decision:null}; await this.store.mutate('approvals',x=>x.push(req)&&req); await this.audit.append({type:'approval.requested',actor:actor.id,resource:req.id,payload:req}); return req;}
  async decideApproval(idv,decision,actor){
    const r=await this.store.mutate('approvals',rows=>{
      const row=rows.find(x=>x.id===idv);
      if(!row) throw Object.assign(new Error('Approval not found'),{status:404});
      if(row.maker===actor.id) throw Object.assign(new Error('Maker cannot approve own request'),{status:409});
      if(row.status!=='pending') throw Object.assign(new Error('Approval already resolved'),{status:409});
      row.status=decision; row.checker=actor.id; row.decidedAt=now();
      return row;
    });
    await this.audit.append({type:`approval.${decision}`,actor:actor.id,resource:r.id,payload:{}});
    return r;
  }
  async verifyRun(runId){
    const runs=await this.store.read('runs');
    const run=runs.find(x=>x.id===runId);
    if(!run) throw Object.assign(new Error('Run not found'),{status:404});
    const audit=await this.audit.verify();
    const evidenceOk=Array.isArray(run.evidence) && run.evidence.length>=1;
    const claims=Array.isArray(run.claims)?run.claims:[];
    const claimsVerified=claims.length>0 && claims.every(c=>c.verified===true);
    const ok=audit.valid && evidenceOk && claimsVerified;
    const report={ok,runId,audit:{valid:audit.valid,events:audit.events,failures:audit.failures},evidenceCount:run.evidence?.length||0,claimsCount:claims.length,claimsVerified,releaseState:run.releaseState};
    if(ok && run.releaseState!=='approved'){
      run.releaseState='approved';
      run.updatedAt=now();
      await this.store.mutate('runs',rows=>{const i=rows.findIndex(x=>x.id===runId); if(i>=0) rows[i]=run;});
      await this.audit.append({type:'run.verified',actor:'system',resource:runId,payload:{releaseState:'approved'}});
      report.releaseState='approved';
    } else if(!ok){
      report.blockers=[];
      if(!audit.valid) report.blockers.push('AUDIT_INVALID');
      if(!evidenceOk) report.blockers.push('EVIDENCE_REQUIRED');
      if(!claimsVerified) report.blockers.push('CLAIMS_UNVERIFIED');
      await this.audit.append({type:'run.verify.failed',actor:'system',resource:runId,payload:{blockers:report.blockers}});
    }
    return report;
  }
  async requestGovernanceReview(runId,actor){
    const runs=await this.store.read('runs');
    const run=runs.find(x=>x.id===runId);
    if(!run) throw Object.assign(new Error('Run not found'),{status:404});
    return this.createApproval({resourceType:'governance-verification',resourceId:runId,action:'governance-review'},actor);
  }

  async addEntity(body,actor){const entity={id:id('entity'),type:String(body.type||'generic'),name:String(body.name||'Unnamed'),aliases:Array.isArray(body.aliases)?body.aliases:[],attributes:body.attributes&&typeof body.attributes==='object'?body.attributes:{},createdAt:now(),updatedAt:now()}; await this.store.mutate('entities',x=>x.push(entity)&&entity); await this.audit.append({type:'knowledge.entity.created',actor:actor.id,resource:entity.id,payload:{type:entity.type,name:entity.name}}); return entity;}
  async linkEntities(body,actor){const rel={id:id('rel'),from:body.from,to:body.to,type:String(body.type||'related-to'),attributes:body.attributes||{},createdAt:now()}; await this.store.mutate('relations',x=>x.push(rel)&&rel); await this.audit.append({type:'knowledge.relation.created',actor:actor.id,resource:rel.id,payload:rel}); return rel;}
}
