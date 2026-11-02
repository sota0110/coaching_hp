import React, { useRef, useState } from 'react';

function fieldLabels(node) {
  const labels = {};
  const fields = [];
  const labelNodes = [];
  const walk = item => {
    if (typeof item === 'string') return;
    if (item.tag === 'label') labelNodes.push(item);
    if (['input','textarea','select'].includes(item.tag)) fields.push(item);
    item.children?.forEach(walk);
  };
  walk(node);
  const findName = item => {
    if (typeof item === 'string') return null;
    return item.attrs?.name || item.children?.map(findName).find(Boolean);
  };
  for (const label of labelNodes) {
    const name = label.attrs.for ? fields.find(field => field.attrs.id === label.attrs.for)?.attrs.name : findName(label);
    if (name) labels[name] = label.children.filter(child => typeof child === 'string').join('').trim();
  }
  return labels;
}

export function LocalForm({ node, render }) {
  const [review, setReview] = useState(null);
  const heading = useRef(null);
  const labels = fieldLabels(node);
  const handleSubmit = event => {
    event.preventDefault();
    const values = [...new FormData(event.currentTarget)].filter(([name]) => labels[name]);
    setReview(values);
    requestAnimationFrame(() => heading.current?.focus());
  };
  return <div className="local-form-panel">
    <p className="preview-form-note">確認用フォームです。入力した内容は送信されません。</p>
    <form className="local-contact-form" aria-label={node.attrs['aria-label'] || 'お問い合わせフォーム'} onSubmit={handleSubmit} hidden={review !== null}>
      {node.children.map((child, i) => render(child, i))}
    </form>
    {review && <section className="form-review" aria-label="入力内容の確認">
      <h3 ref={heading} tabIndex={-1}>入力内容の確認</h3>
      <dl>{review.map(([name, value]) => <React.Fragment key={name}><dt>{labels[name]}</dt><dd>{value || '未入力'}</dd></React.Fragment>)}</dl>
      <p role="status">入力内容を確認しました。送信は行っていません。</p>
      <button className="local-action" type="button" onClick={() => setReview(null)}>入力内容を修正する</button>
    </section>}
  </div>;
}

export function BookingCalendar() {
  const [month, setMonth] = useState(() => {
    const date = new Date(new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date()));
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const changeMonth = offset => setMonth(current => new Date(current.getFullYear(),current.getMonth() + offset,1));
  const year = month.getFullYear();
  const index = month.getMonth();
  const days = new Date(year,index+1,0).getDate();
  const cells = Array.from({length:Math.ceil((month.getDay()+days)/7)*7},(_,i)=> {
    const day = i-month.getDay()+1;
    return day > 0 && day <= days ? day : null;
  });
  return <section className="booking-calendar" aria-label="ご予約カレンダー">
    <div className="calendar-toolbar"><button type="button" onClick={() => changeMonth(-1)} aria-label="前の月">‹ <span>{(index+11)%12+1}月</span></button><h2 aria-live="polite">{year}年{index+1}月</h2><button type="button" onClick={() => changeMonth(1)} aria-label="次の月"><span>{(index+1)%12+1}月</span> ›</button></div>
    <table><caption className="screen-reader-text">{year}年{index+1}月のカレンダー</caption><thead><tr>{['日','月','火','水','木','金','土'].map(day=><th key={day} scope="col">{day}</th>)}</tr></thead><tbody>{Array.from({length:cells.length/7},(_,week)=><tr key={week}>{cells.slice(week*7,week*7+7).map((day,i)=><td key={i}>{day && <span>{day}</span>}</td>)}</tr>)}</tbody></table>
    <p className="preview-form-note">確認用カレンダーです。最新の空き状況の取得・予約送信は行いません。</p>
  </section>;
}
