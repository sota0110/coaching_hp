import React from 'react';
const text = node => typeof node==='string' ? node : (node.children||[]).map(text).join('');
function splitVoices(node) {
  const groups = [{title:'プライベートコーチング相談',items:[]},{title:'コーチング＆セラピー講座・初級',items:[]},{title:'コーチング＆セラピー講座・中上級',items:[]}];
  let group = groups[0], buffer=[];
  const flush=()=>{if(buffer.length){group.items.push(buffer);buffer=[];}};
  const visit = item => {
    if(typeof item==='string')return;
    if(item.tag==='details'){item.children.forEach(visit);return;}
    if(item.tag==='summary')return;
    if(item.tag==='hr'){flush();return;}
    if(item.tag==='p'&&text(item).startsWith('🍃')){flush();group=groups[text(item).includes('中上級')?2:text(item).includes('初級')?1:0];return;}
    if(text(item).trim())buffer.push(item);
  };
  node.children.forEach(visit);flush();return groups;
}
// Keep testimonial wording and inline emphasis. Join sentence fragments into readable paragraphs.
function readableParagraphs(nodes) {
  const output=[];let children=[], length=0;
  const flush=()=>{if(children.length){output.push({tag:'p',attrs:{},children});children=[];length=0;}};
  nodes.forEach(node=>{if(node.tag!=='p'){flush();output.push(node);return;}if(length&&length+text(node).length>180)flush();children.push(...node.children);length+=text(node).length;});flush();return output;
}
export default function VoicesPage({node, render}) {
  const groups=splitVoices(node);
  return <div className="editorial-page voices-page"><p className="intro-paragraph">ご相談や講座を通じていただいたお声を、テーマ別にご紹介します。感想は原文を基本に、段落を整えて掲載しています。</p><nav className="topic-links" aria-label="お客様の声のテーマ">{groups.map((g,i)=><a href={`#voice-group-${i}`} key={g.title}>{g.title}</a>)}</nav>{groups.map((g,i)=><section key={g.title} id={`voice-group-${i}`}><h2>{g.title}</h2><div className="testimonial-list">{g.items.map((nodes,index)=>{const excerpt=text(nodes[0]);return <details className="full-testimonial" key={index}><summary><span className="voice-number">{String(index+1).padStart(2,'0')}</span><span>{excerpt.slice(0,48)}{excerpt.length>48?'…':''}</span></summary><blockquote className="testimonial-body">{readableParagraphs(nodes).map((n,key)=>render(n,key))}</blockquote></details>;})}</div></section>)}</div>;
}
