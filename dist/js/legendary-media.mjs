// Only real encoded movies reviewed for the exact Pokémon variant are registered.
export const LEGENDARY_MEDIA={
  "384": {
    "src": "assets/cinematics/384-appearance-v1.mp4",
    "poster": "assets/cinematics/384-appearance-v1-poster.png",
    "duration": 5.041666666666667,
    "width": 1024,
    "height": 592,
    "provider": "PixVerse V6"
  },
  "383": {
    "src": "assets/cinematics/383-appearance-v1.mp4",
    "poster": "assets/cinematics/383-appearance-v1-poster.png",
    "duration": 5.041666666666667,
    "width": 1024,
    "height": 592,
    "provider": "PixVerse V6"
  }
};
export function legendaryMedia(key,{reducedMotion=false}={}){
 const entry=LEGENDARY_MEDIA[String(key)];if(!entry)return null;
 const src=reducedMotion&&entry.reducedSrc?entry.reducedSrc:entry.src;
 if(!/^assets\/cinematics\/[a-zA-Z0-9_./-]+\.(mp4|webm)$/.test(src)||src.includes('..'))return null;
 return {...entry,src,manualStart:reducedMotion&&!entry.reducedSrc};
}
