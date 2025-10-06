import React from 'react';
import { imageUrl } from '../api';

export default function PreviewWall({ previews=[], annotated=[] }){
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, 160px)', gap:8}}>
      {previews.map((p,i)=> <img key={'p'+i} src={p} style={{width:160,height:120,objectFit:'cover'}} />)}
      {annotated.map((n,i)=> <img key={'a'+i} src={imageUrl(n)} style={{width:160,height:120,objectFit:'cover'}} />)}
    </div>
  );
}
