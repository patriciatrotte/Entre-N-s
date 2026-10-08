import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handleClientMessage, restore, snapshot, type GameConnection} from '../src/game/engine';
import {MISSIONS} from '../src/data/missions';
import {PRE_TEST_QUESTIONS,POST_TEST_QUESTIONS} from '../src/data/evaluations';
import type {ClientMessage} from '../src/types/game';
function fresh() {restore({rooms:[],tokens:[],evaluations:[],feedback:[]});}
function client() {const frames:any[]=[];const ws:GameConnection={readyState:1,send:data=>frames.push(JSON.parse(data))}; return {frames,ws,send:(msg:ClientMessage)=>handleClientMessage(ws,msg)};}
const answers = (questions:typeof PRE_TEST_QUESTIONS) => Object.fromEntries(questions.map(q=>[q.id,q.options[0].id]));
test('solo completes four missions, tests and feedback, without bot analytics',()=>{
 fresh(); const c=client();c.send({type:'CREATE_ROOM',nickname:'Teste',characterId:'alex',variantIndex:0});
 const joined=c.frames[0]; const room=()=>snapshot().rooms[0][1];
 c.send({type:'START_GAME'});assert.equal(Object.values(room().players).filter(p=>p.isBot).length,3);
 c.send({type:'SUBMIT_PRE_TEST',answers:{}});assert.equal(room().phase,'PRE_TEST');
 c.send({type:'SUBMIT_PRE_TEST',answers:answers(PRE_TEST_QUESTIONS)});assert.equal(room().phase,'BOARD_SELECT');
 for (const mission of MISSIONS.slice(0,4)) {
  c.send({type:'START_MISSION',missionId:mission.id});assert.equal(room().phase,'MISSION_SITUATION');
  c.send({type:'SUBMIT_INDIVIDUAL_CHOICE',actionId:mission.actions[0].id});assert.equal(room().phase,'MISSION_SITUATION');
  c.send({type:'EXPLORE_MISSION'});assert.equal(room().phase,'MISSION_EXPLORE');
  c.send({type:'SUBMIT_INDIVIDUAL_CHOICE',actionId:'invalid'});assert.equal(room().phase,'MISSION_EXPLORE');
  c.send({type:'SUBMIT_INDIVIDUAL_CHOICE',actionId:mission.actions[0].id});assert.equal(room().phase,'MISSION_REVEAL');
  c.send({type:'OPEN_COLLECTIVE_VOTE'});assert.equal(room().collectiveVotes[joined.playerId],undefined);
  c.send({type:'SUBMIT_COLLECTIVE_VOTE',actionId:mission.actions[0].id});
  if (room().phase==='MISSION_COLLECTIVE_VOTE') c.send({type:'SUBMIT_COLLECTIVE_VOTE',actionId:mission.actions[0].id});
  if (room().phase==='MISSION_TF_CHALLENGE') {c.send({type:'PROCEED_AFTER_CONSEQUENCE'});assert.equal(room().phase,'MISSION_TF_CHALLENGE');c.send({type:'SUBMIT_TF_ANSWER',answer:true});c.send({type:'PROCEED_AFTER_CONSEQUENCE'});}
  assert.equal(room().phase,'MISSION_CONSEQUENCE');c.send({type:'PROCEED_AFTER_CONSEQUENCE'});
 }
 assert.equal(room().phase,'POST_TEST');c.send({type:'SUBMIT_POST_TEST',answers:answers(POST_TEST_QUESTIONS)});assert.equal(room().phase,'GAME_SUMMARY');
 c.send({type:'SUBMIT_FEEDBACK',usability:5,clarity:4,interest:5});c.send({type:'SUBMIT_FEEDBACK',usability:5,clarity:4,interest:5});
 assert.equal(snapshot().evaluations.length,1);assert.equal(snapshot().feedback.length,1);
 c.send({type:'START_GAME'});assert.equal(room().completedMissionIds.length,0);assert.equal(room().players[joined.playerId].preTestCompleted,false);
});
test('multiplayer keeps choices secret and checks host and readiness',()=>{
 fresh(); const a=client(),b=client();a.send({type:'CREATE_ROOM',nickname:'A',characterId:'alex',variantIndex:0});const code=a.frames[0].roomCode;
 b.send({type:'JOIN_ROOM',roomCode:code,nickname:'B',characterId:'bia',variantIndex:0});a.send({type:'START_GAME'});assert.equal(snapshot().rooms[0][1].phase,'LOBBY');
 b.send({type:'TOGGLE_READY'});a.send({type:'START_GAME'});
 a.send({type:'SUBMIT_PRE_TEST',answers:answers(PRE_TEST_QUESTIONS)});b.send({type:'SUBMIT_PRE_TEST',answers:answers(PRE_TEST_QUESTIONS)});
 const mission=MISSIONS[0];b.send({type:'START_MISSION',missionId:mission.id});assert.equal(snapshot().rooms[0][1].phase,'BOARD_SELECT');
 a.send({type:'START_MISSION',missionId:mission.id});a.send({type:'EXPLORE_MISSION'});a.send({type:'SUBMIT_INDIVIDUAL_CHOICE',actionId:mission.actions[0].id});
 const state=b.frames.filter(f=>f.type==='STATE_UPDATE').at(-1).state;assert.equal(state.revealedIndividualChoices,undefined);assert.equal(state.myChoice,undefined);
 assert.equal((Object.values(state.players) as any[]).find(p=>p.nickname==='A')?.preTestScore,undefined);
 b.send({type:'SUBMIT_INDIVIDUAL_CHOICE',actionId:mission.actions[1].id});assert.equal(snapshot().rooms[0][1].phase,'MISSION_REVEAL');
});
