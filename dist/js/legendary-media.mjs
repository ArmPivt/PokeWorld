// Only real encoded movies reviewed for the exact Pokémon variant are registered.
export const LEGENDARY_MEDIA={
  "384": {
    "src": "assets/cinematics/384-appearance-v2.mp4",
    "poster": "assets/cinematics/384-appearance-v2-poster.png",
    "duration": 21.625,
    "width": 960,
    "height": 540,
    "provider": "PokéWorld — montage pixel art local",
    "audio": true,
    "music": "Le Sillage Émeraude"
  },
  "383": {
    "src": "assets/cinematics/383-appearance-v3.mp4",
    "poster": "assets/cinematics/383-appearance-v3-poster.png",
    "duration": 26,
    "width": 960,
    "height": 540,
    "provider": "PokéWorld — montage pixel art local",
    "audio": true,
    "music": "Le Cœur du Continent"
  },
  "382": {
    "src": "assets/cinematics/382-appearance-v3.mp4",
    "poster": "assets/cinematics/382-appearance-v3-poster.png",
    "duration": 26,
    "width": 960,
    "height": 540,
    "provider": "PokéWorld — montage pixel art local",
    "audio": true,
    "music": "Le Serment des Abysses"
  },
  "386": {
    "src": "assets/cinematics/386-appearance-v2.mp4",
    "poster": "assets/cinematics/386-appearance-v2-poster.png",
    "duration": 36,
    "width": 960,
    "height": 540,
    "provider": "PokéWorld — montage pixel art local",
    "audio": true,
    "music": "Le Code Delta"
  }
};
export function legendaryMedia(key,{reducedMotion=false}={}){
 const entry=LEGENDARY_MEDIA[String(key)];if(!entry)return null;
 const src=reducedMotion&&entry.reducedSrc?entry.reducedSrc:entry.src;
 if(!/^assets\/cinematics\/[a-zA-Z0-9_./-]+\.(mp4|webm)$/.test(src)||src.includes('..'))return null;
 return {...entry,src,manualStart:reducedMotion&&!entry.reducedSrc};
}
