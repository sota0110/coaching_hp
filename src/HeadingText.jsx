import React from 'react';
/** Keep service names readable at narrow widths without splitting the words. */
export default function HeadingText({children}) {
  return String(children).split(/(プライベート|コーチング|セラピー|相談|申し込む|お申し込み|お問い合わせ|すみいみゆき|伴走コース|サロン)/g).map((part,index)=>index%2?<span className="heading-phrase" key={index}>{part}</span>:part);
}
