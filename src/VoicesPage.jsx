import React from 'react';

const voiceGroups = [
  {
    title: 'プライベートコーチング相談',
    testimonialTitles: [
      '娘に怒鳴ってばかりだった私が、穏やかに向き合えるように',
      '夫婦関係も子育ても、自分の心が整うことで変わり始めた',
      '「私も息子も大丈夫」その言葉が、心の支えになりました',
      '自分の弱さも話せた。これからは一人の人間として人生を楽しみたい',
      '自分の気持ちを吐き出すことで、イライラをため込まない私へ',
    ],
  },
  {
    title: 'コーチング＆セラピー講座・初級',
    testimonialTitles: [
      '「私は大丈夫」という安心感が、自分と人を受け入れる力に',
      '50歳を過ぎて初めて、自分の人生を生き直したいと思えました',
      '自分を優先していい。そう思えたことで、心が軽くなった',
      '自分を責める言葉が減り、ありのままの自分を受け入れられるように',
      '自分を整える方法を知ったことで、毎日が生きやすくなった',
      '自分の感情に気づき、大丈夫ゾーンに戻れるように',
      '心の仕組みを知ることで、世界の見え方が変わった',
      '「今の私で花丸！」自分を認められるようになりました',
      'ぐるぐる思考から抜け出し、自分の心の土台が育ち始めた',
      '不安があっても大丈夫。新しい一歩を踏み出せました',
      'これまでの経験が学びとつながり、自分を知る楽しさを実感',
      '心の仕組みを知ることで、同じ悩みを繰り返さなくなった',
      '自分の判断に自信が持てるようになり、人生の新しい一歩に',
      '心と身体を整えることで、毎日が幸せで楽しくなった',
      '実体験に基づく学びが、心にすっと響きました',
      '自分が変わると、夫や子どもとの関係も変わり始めた',
      'イライラする自分も、失敗する自分も、これでいい',
      '自分の心を整え、前向きに行動できるようになった',
      '「あれ、私変わった！」自信がつき、子どもを愛おしく思えるように',
      '自分を信頼し、これからの人生を思いきり楽しみたい',
      'イライラや心の爆発が減り、自分を整える力が身についた',
      '周りの評価より、自分の気持ちを大切にできるように',
      '子どもを変えようとする前に、まず自分を整えること',
    ],
  },
  {
    title: 'コーチング＆セラピー講座・中上級',
    testimonialTitles: [
      '自分の軸ができ、自分の状態に目を向けられるようになりました',
      '自分を癒し、相手を信じて、前に進めるように',
      '「今までの私で大丈夫！」自分を信じ、子どもを見守れるように',
      '自分の軸を見つけ、学び合える仲間が人生の宝物に',
    ],
  },
];

const text = node => typeof node==='string' ? node : (node.children||[]).map(text).join('');
function splitVoices(node) {
  const groups = voiceGroups.map(group => ({ ...group, items: [] }));
  const notes = [];
  let group = groups[0], buffer=[];
  const flush=()=>{if(buffer.length){group.items.push(buffer);buffer=[];}};
  const visit = item => {
    if(typeof item==='string')return;
    if(item.tag==='details'){item.children.forEach(visit);return;}
    if(item.tag==='summary')return;
    if(item.tag==='hr'){flush();return;}
    if(item.tag==='p' && /^※全てのお言葉は/.test(text(item).trim())) { flush(); notes.push(item); return; }
    if(item.tag==='p'&&text(item).startsWith('🍃')){flush();group=groups[text(item).includes('中上級')?2:text(item).includes('初級')?1:0];return;}
    if(text(item).trim())buffer.push(item);
  };
  node.children.forEach(visit);flush();return {groups,notes};
}
// Keep testimonial wording and inline emphasis. Join sentence fragments into readable paragraphs.
function readableParagraphs(nodes) {
  const output=[];let children=[], length=0;
  const flush=()=>{if(children.length){output.push({tag:'p',attrs:{},children});children=[];length=0;}};
  nodes.forEach(node=>{if(node.tag!=='p'){flush();output.push(node);return;}if(length&&length+text(node).length>180)flush();children.push(...node.children);length+=text(node).length;});flush();return output;
}
export default function VoicesPage({node, render}) {
  const {groups,notes}=splitVoices(node);
  return <div className="editorial-page voices-page">
    <p className="intro-paragraph">ご相談や講座を通じていただいたお声を、テーマ別にご紹介します。感想は原文を基本に、段落を整えて掲載しています。</p>
    <nav className="topic-links" aria-label="お客様の声のテーマ">
      {groups.map((group, index) => <a href={`#voice-group-${index}`} key={group.title}>{group.title}</a>)}
    </nav>
    {groups.map((group, groupIndex) => (
      <section key={group.title} id={`voice-group-${groupIndex}`}>
        <h2>{group.title}</h2>
        <div className="testimonial-list">
          {group.items.map((nodes, index) => (
            <details className="full-testimonial" key={index}>
              <summary>
                <span className="voice-number">{String(index + 1).padStart(2, '0')}</span>
                <span>{group.testimonialTitles[index] ?? text(nodes[0])}</span>
              </summary>
              <blockquote className="testimonial-body">
                {readableParagraphs(nodes).map((node, key) => render(node, key))}
              </blockquote>
            </details>
          ))}
        </div>
      </section>
    ))}
    {notes.map((note, index) => render({ ...note, attrs: { ...note.attrs, class: 'publication-consent' } }, `consent-${index}`))}
  </div>;
}
