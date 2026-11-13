import React from 'react';
import { localUrl } from './paths';

const photos = {
  'private-dialogue': { width: 560, height: 524, alt: '明るい部屋で、一人ひとりのお話に耳を傾ける様子' },
  'coaching-lesson': { width: 440, height: 524, alt: '緑に囲まれた空間で、こころについて学ぶ講座の様子' },
  'shared-dialogue': { width: 508, height: 504, alt: 'テーブルを囲み、笑顔でゆっくり対話する様子' },
  'small-group-workshop': { width: 496, height: 480, alt: 'ホワイトボードを使い、少人数で学ぶワークショップの様子' },
  'hand-massage': { width: 502, height: 484, alt: '手をやさしく包み込みながら行うハンドマッサージの様子' },
  'warm-gathering': { width: 508, height: 506, alt: '花のある明るい空間で、笑顔で集う女性たち' },
};

export default function SalonPhoto({ scene, className = '' }) {
  const photo = photos[scene];
  return <figure className={`salon-scene ${className}`}>
    <img src={localUrl(`/assets/salon/${scene}.jpg`)} width={photo.width} height={photo.height} alt={photo.alt} loading="lazy" decoding="async"/>
  </figure>;
}
