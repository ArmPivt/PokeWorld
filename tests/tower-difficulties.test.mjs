import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {migrate} from '../dist/client/js/model.mjs';
import {setTowerDifficulty,towerFrontier,towerTrainer,towerTraining,isTowerDifficultyUnlocked,canEnterTower} from '../dist/client/js/tower-data.mjs';
import {awardTowerVictory} from '../dist/client/js/tower-progression.mjs';
import {filterAvatars,avatarGeneration} from '../dist/client/js/player-profile.mjs';
test('campaigns unlock sequentially, preserve progress and only reward once',()=>{
 let s=migrate({version:9,starter:25,roster:['25'],team:['25'],floor:8,tickets:12,settings:{}});
 assert.equal(towerFrontier(s),8);assert.equal(s.tower.tracks.trainer.claimed.length,7);
 assert.equal(setTowerDifficulty(s,'gym'),false);assert.equal(setTowerDifficulty(s,'master'),false);
 assert.equal(canEnterTower(s,1,'gym'),false);assert.equal(awardTowerVictory(s,1,['25'],'master'),null);
 for(let floor=8;floor<=50;floor++)assert(awardTowerVictory(s,floor));
 assert.equal(isTowerDifficultyUnlocked(s,'gym'),true);assert.equal(isTowerDifficultyUnlocked(s,'master'),false);
 assert.equal(setTowerDifficulty(s,'gym'),true);assert.equal(s.floor,1);
 assert.equal(awardTowerVictory(s,1).tickets,4);const tickets=s.tickets;assert.equal(awardTowerVictory(s,1),null);assert.equal(s.tickets,tickets);
 for(let floor=2;floor<=50;floor++)assert(awardTowerVictory(s,floor));
 assert.equal(isTowerDifficultyUnlocked(s,'master'),true);assert.equal(awardTowerVictory(s,1,['25'],'master').tickets,6);assert.equal(s.floor,51);
 s=migrate(JSON.parse(JSON.stringify(s)));setTowerDifficulty(s,'trainer');assert.equal(s.floor,51);setTowerDifficulty(s,'master');assert.equal(s.floor,2);
 assert.equal(setTowerDifficulty(s,'invalid'),false);
});
test('a save selected on a locked mode keeps its data but returns to an unlocked mode',()=>{
 const s=migrate({floor:1,tower:{difficulty:'master',tracks:{trainer:{floor:1},gym:{floor:5},master:{floor:9}}}});
 assert.equal(s.tower.difficulty,'trainer');assert.equal(s.floor,1);assert.equal(s.tower.tracks.master.floor,9);assert.equal(s.tower.tracks.gym.floor,5);
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
 const all=filterAvatars();assert(all.every((a,i)=>!i||avatarGeneration(all[i-1])<=avatarGeneration(a)));assert(filterAvatars('cynthia',4).length);assert.equal(filterAvatars('cynthia',1).length,0);
});
