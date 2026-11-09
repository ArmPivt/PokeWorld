import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {migrate} from '../dist/client/js/model.mjs';
import {setTowerDifficulty,towerFrontier,towerTrainer,towerTraining} from '../dist/client/js/tower-data.mjs';
import {awardTowerVictory} from '../dist/client/js/tower-progression.mjs';
import {filterAvatars,avatarGeneration} from '../dist/client/js/player-profile.mjs';
test('legacy progress survives switching campaigns, saving and importing',()=>{
 let s=migrate({version:9,starter:25,roster:['25'],team:['25'],floor:8,tickets:12,settings:{}});
 assert.equal(towerFrontier(s),8);assert.equal(s.tower.tracks.trainer.claimed.length,7);
 setTowerDifficulty(s,'gym');assert.equal(s.floor,1);assert.equal(awardTowerVictory(s,1).tickets,4);
 const tickets=s.tickets;assert.equal(awardTowerVictory(s,1),null);assert.equal(s.tickets,tickets);assert.equal(awardTowerVictory(s,3),null);
 assert.equal(awardTowerVictory(s,1,['25'],'master').tickets,6);assert.equal(s.floor,2);
 s=migrate(JSON.parse(JSON.stringify(s)));setTowerDifficulty(s,'trainer');assert.equal(s.floor,8);setTowerDifficulty(s,'master');assert.equal(s.floor,2);
 assert.equal(setTowerDifficulty(s,'invalid'),false);
});
test('all 150 encounters contain supported sprites and legal training',async()=>{
 const raw=JSON.parse(await readFile(new URL('../dist/client/data/dex.json',import.meta.url))),supported=JSON.parse(await readFile(new URL('../dist/client/data/supported.json',import.meta.url))),dex=Object.fromEntries(supported.map(p=>[p.id,raw[p.id]]));
 for(const difficulty of ['trainer','gym','master'])for(let floor=1;floor<=50;floor++){
  const trainer=towerTrainer(floor,dex,difficulty);assert(trainer.keys.length>0&&trainer.keys.length<=6);assert(trainer.keys.every(k=>dex[k]));
  if(difficulty==='master'){assert.equal(trainer.level,100);assert.equal(trainer.keys.length,6)}
  for(const key of trainer.keys){const p=towerTraining(trainer,key,dex);assert(p.ev.every(v=>v>=0&&v<=252));assert(p.ev.reduce((a,b)=>a+b,0)<=510);assert(p.iv.every(v=>v>=0&&v<=31));if(difficulty==='master')assert(p.iv.every(v=>v===31))}
 }
});
test('sprite generation and search filters combine',()=>{
 for(let n=1;n<=5;n++){const entries=filterAvatars('',n);assert(entries.length>0);assert(entries.every(a=>avatarGeneration(a)===n))}
 assert(filterAvatars('cynthia',4).length);assert.equal(filterAvatars('cynthia',1).length,0);
});
