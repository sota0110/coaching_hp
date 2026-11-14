import React, { useEffect, useRef, useState } from 'react';
import { turnstileSiteKey } from './booking-api';
let scriptReady;
function loadScript() {
  if (window.turnstile) return Promise.resolve();
  if (!scriptReady) scriptReady = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = resolve;
    script.onerror = () => { script.remove(); scriptReady = null; reject(new Error('load failed')); };
    document.head.append(script);
  });
  return scriptReady;
}
export default function Turnstile({ onToken, attempt }) {
  const container = useRef(null);
  const callback = useRef(onToken);
  callback.current = onToken;
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true, widget;
    callback.current(''); setFailed(false);
    loadScript().then(() => {
      if (!active) return;
      widget = window.turnstile.render(container.current, {
        sitekey: turnstileSiteKey, action: 'application', language: 'ja', size: 'flexible',
        callback: token => { setFailed(false); callback.current(token); },
        'expired-callback': () => callback.current(''),
        'error-callback': () => { callback.current(''); setFailed(true); },
      });
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; if (widget !== undefined) window.turnstile?.remove(widget); };
  }, [attempt]);
  return <div className="submission-check"><div ref={container}/>{failed && <p className="form-error" role="alert">送信確認を読み込めませんでした。「送信確認をやり直す」を押してください。</p>}</div>;
}
