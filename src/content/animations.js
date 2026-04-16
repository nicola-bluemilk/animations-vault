export const animations = [
  {
    id: 'anim1',
    number: '01',
    title: 'Textured Cube',
    description: 'Cubo con texture hardwood, luce direzionale e interazione diretta sul mesh.',
    accentClass: 'accent-amber',
    stageClass: 'animation-stage'
  },
  {
    id: 'anim2',
    number: '02',
    title: 'Rolex Viewer',
    description: 'Viewer 3D del modello GLB con Draco, illuminazione morbida e interazione sul modello.',
    accentClass: 'accent-sky',
    stageClass: 'animation-stage light-stage'
  },
  {
    id: 'anim3',
    number: '03',
    title: 'Shader Cube',
    description: 'Versione shader con onda animata e variazione cromatica nel fragment shader.',
    accentClass: 'accent-coral',
    stageClass: 'animation-stage'
  },
  {
    id: 'anim4',
    number: '04',
    title: 'Part Selector',
    description: 'Viewer con raycast su mesh singole, per selezionare una parte alla volta del modello.',
    accentClass: 'accent-mint',
    stageClass: 'animation-stage light-stage'
  },
  {
    id: 'anim5',
    number: '05',
    title: 'Hotspot Notes',
    description: 'Viewer con punti cliccabili, focus sul dettaglio scelto e scheda informativa collegata.',
    accentClass: 'accent-gold',
    stageClass: 'animation-stage light-stage'
  },
  {
    id: 'anim6',
    number: '06',
    title: 'Water Shader',
    description: 'Superficie d’acqua shader con modalita visive selezionabili e resa piu cinematica.',
    accentClass: 'accent-sky',
    stageClass: 'animation-stage'
  },
  {
    id: 'anim7',
    number: '07',
    title: 'Neon Torus',
    description: 'Toro animato con materiale emissive, doppia luce colorata e navigazione orbitale.',
    accentClass: 'accent-coral',
    stageClass: 'animation-stage'
  },
  {
    id: 'anim8',
    number: '08',
    title: 'Scena Cinematografica',
    description: 'Scena cinematografica con fog, luci e bloom per una resa piu atmosferica e profonda.',
    accentClass: 'accent-mint',
    stageClass: 'animation-stage'
  },
  {
    id: 'anim9',
    number: '09',
    title: 'Particle Flow',
    description: 'Campo particellare interattivo con istanze flottanti e deviazione morbida guidata dal mouse.',
    accentClass: 'accent-gold',
    stageClass: 'animation-stage'
  },
  {
    id: 'anim10',
    number: '10',
    title: 'Coffee Beans River',
    description: 'Flusso continuo di chicchi di caffe in banda orizzontale, con moto organico e lettura visiva da river system.',
    accentClass: 'accent-amber',
    stageClass: 'animation-stage'
  },
  {
    id: 'anim11',
    number: '11',
    title: 'Coffee Steam Ribbons',
    description: 'Nastri di vapore caldi e morbidi che salgono e si intrecciano sopra una base luminosa, con moto lento e atmosferico.',
    accentClass: 'accent-coral',
    stageClass: 'animation-stage'
  },
  {
    id: 'anim12',
    number: '12',
    title: 'Liquid Metal Orb',
    description: 'Sfera metallica fluida con micro-deformazioni, riflessi freddi e luce da studio per un look piu premium.',
    accentClass: 'accent-sky',
    stageClass: 'animation-stage'
  },
  {
    id: 'anim13',
    number: '13',
    title: 'Ribbon Tunnel',
    description: 'Tunnel astratto di nastri luminosi che scorrono in profondita, con torsioni morbide e palette neon piu sintetica.',
    accentClass: 'accent-mint',
    stageClass: 'animation-stage'
  },
  {
    id: 'anim14',
    number: '14',
    title: 'Shattered Halo',
    description: 'Frammenti sospesi disposti in corona che si aprono e si ricompongono con energia luminosa sul bordo.',
    accentClass: 'accent-gold',
    stageClass: 'animation-stage'
  },
  {
    id: 'anim15',
    number: '15',
    title: 'Magnetic Filaments',
    description: 'Filamenti tesi tra poli luminosi che si piegano e vibrano come linee di campo magnetico.',
    accentClass: 'accent-sky',
    stageClass: 'animation-stage'
  },
  {
    id: 'anim16',
    number: '16',
    title: 'Prism Caustics',
    description: 'Prisma sospeso in una camera scura con caustiche cromatiche proiettate su piano e fondale.',
    accentClass: 'accent-coral',
    stageClass: 'animation-stage'
  }
];

export const animationMap = new Map(animations.map((animation) => [animation.id, animation]));

export function getAnimationById(id) {
  return animationMap.get(id) ?? null;
}

export function getAnimationHref(basePath, id) {
  return `${basePath}animazioni/view.html?scene=${id}`;
}