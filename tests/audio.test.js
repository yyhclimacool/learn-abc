import test from 'node:test';
import assert from 'node:assert/strict';
import {selectVoice} from '../src/voices.js';
import {configureAudio,speak,stopSpeaking} from '../src/audio.js';
const voice=(name,lang='en-US',extra={})=>({name,lang,localService:true,...extra});
test('Samantha wins over Albert and character voices regardless of order',()=>{
 const voices=[voice('Albert'),voice('Bad News'),voice('Grandpa'),voice('Eddy'),voice('Samantha')];
 assert.equal(selectVoice(voices,'en-US').name,'Samantha');
 assert.equal(selectVoice([...voices].reverse(),'en-US').name,'Samantha');
});
test('prefer natural variant, support other Macs and normalize locale',()=>{
 assert.equal(selectVoice([voice('Samantha'),voice('Samantha (Enhanced)')],'en-US').name,'Samantha (Enhanced)');
 assert.equal(selectVoice([voice('Albert'),voice('Daniel','en_GB')],'en-US').name,'Daniel');
 assert.equal(selectVoice([voice('Google US English','en-US',{localService:false}),voice('Fred')],'en-US').name,'Google US English');
 assert.equal(selectVoice([voice('Eddy','zh-CN'),voice('Tingting','zh_CN')],'zh-CN').name,'Tingting');
 assert.equal(selectVoice([voice('Zarvox'),voice('Whisper')],'en-US'),null);
});
test('delayed voice loading, natural speed, cancellation, volume and mute',async()=>{
 const synth=new EventTarget();let voices=[];const spoken=[];
 synth.getVoices=()=>voices;synth.cancel=()=>{};synth.speak=u=>{spoken.push(u);queueMicrotask(()=>u.onend?.());};
 globalThis.window={speechSynthesis:synth};
 globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 const config={sound:true,volume:.6};configureAudio(()=>config);
 const obsolete=speak([['apple','en-US']]);
 const latest=speak([['banana','en-US']]);
 voices=[voice('Albert'),voice('Samantha')];synth.dispatchEvent(new Event('voiceschanged'));
 await Promise.all([obsolete,latest]);
 assert.equal(spoken.length,1);assert.equal(spoken[0].text,'banana');
 assert.equal(spoken[0].voice.name,'Samantha');assert.equal(spoken[0].rate,.95);assert.equal(spoken[0].pitch,1);assert.equal(spoken[0].volume,.6);
 voices=[];const pending=speak([['cat','en-US']]);stopSpeaking();
 voices=[voice('Samantha')];synth.dispatchEvent(new Event('voiceschanged'));await pending;
 assert.equal(spoken.length,1);
 config.sound=false;await speak([['dog','en-US']]);assert.equal(spoken.length,1);
 delete globalThis.window;delete globalThis.SpeechSynthesisUtterance;
});


test('all 26 letter names are case-independent and do not affect words or Chinese', async()=>{
 const {speechText}=await import('../src/letter-names.js');
 for(const c of 'abcdefghijklmnopqrstuvwxyz') {
  assert.equal(speechText(c,'en-US'),speechText(c.toUpperCase(),'en-US'));
  assert(!/capital|uppercase|lowercase/i.test(speechText(c,'en-US')));
  assert.notEqual(speechText(c,'en-US'),c.toUpperCase());
 }
 assert.equal(speechText('J','en-US'),'jay');
 assert.equal(speechText('j','en-US'),'jay');
 assert.equal(speechText('W','en-US'),'double you');
 assert.equal(speechText('apple','en-US'),'apple');
 assert.equal(speechText('找一找字母','zh-CN'),'找一找字母');
});


test('letter recordings use distinct b/p files, preserve case and stop on cancellation',async()=>{
 const clips=[];
 globalThis.window={};
 globalThis.Audio=class extends EventTarget {
  constructor(src){super();this.src=src;clips.push(this);}
  play(){queueMicrotask(()=>this.dispatchEvent(new Event('ended')));return Promise.resolve();}
  pause(){this.paused=true;}
 };
 configureAudio(()=>({sound:true,volume:.7}));
 await speak([['B','en-US'],['p','en-US']]);
 assert.deepEqual(clips.map(c=>c.src),['/audio/letters/b.wav','/audio/letters/p.wav']);
 assert(clips.every(c=>c.volume===.7&&c.paused));
 Audio.prototype.play=function(){return Promise.resolve();};
 const pending=speak([['J','en-US'],['K','en-US']]);
 stopSpeaking();await pending;
 assert.equal(clips.length,3);assert(clips[2].paused);
 delete globalThis.Audio;delete globalThis.window;
});

test('letter recordings finish before following TTS; missing clips fall back',async()=>{
 const order=[];
 const synth=new EventTarget();synth.getVoices=()=>[voice('Samantha')];synth.cancel=()=>{};
 synth.speak=u=>{order.push(u.text);queueMicrotask(()=>u.onend?.());};
 globalThis.window={speechSynthesis:synth};
 globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 globalThis.Audio=class extends EventTarget{
  constructor(src){super();this.src=src;}
  play(){order.push(this.src);queueMicrotask(()=>this.dispatchEvent(new Event('ended')));return Promise.resolve();}
  pause(){}
 };
 configureAudio(()=>({sound:true,volume:1}));
 await speak([['p','en-US'],['pig','en-US']]);
 assert.deepEqual(order,['/audio/letters/p.wav','pig']);
 Audio.prototype.play=()=>Promise.reject(new Error('unavailable'));
 await speak([['B','en-US']]);assert.equal(order.at(-1),'bee');
 delete globalThis.Audio;delete globalThis.window;delete globalThis.SpeechSynthesisUtterance;
});
