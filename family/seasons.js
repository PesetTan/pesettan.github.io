// Meteorological seasons at home, independent of the visitor's time zone.
// Loaded before CSS so the page receives its seasonal palette before first paint.
(() => {
  const zone = 'America/Los_Angeles';
  const dateFormat = new Intl.DateTimeFormat('en-US', {timeZone:zone, month:'numeric'});
  const seasons = {
    spring: {
      icon:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-9M12 15C5 15 3 11 3 6c6 0 9 3 9 9ZM12 11c0-5 3-8 9-8 0 5-3 8-9 8Z"/></svg>',
      birds:['egret','swallows'], cloud:'cumulus.png', cloudOpacity:1,
      description:'Fresh green Coyote Hills above a blue marsh and lime grasses, beneath drifting white and cyan cumulus clouds.',
      colors:{canvas:'#103e3c',ink:'#f1f5dc',muted:'#bfcebc',sky:'#0753aa',accent:'#e1f5a5','accent-hover':'#f0ffd0',card:'#194b47','card-alt':'#204e46','card-warm':'#2a5146','card-last':'#315348','card-hover':'#245a51',detail:'#d2dfce'}
    },
    summer: {
      icon:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>',
      birds:['egret','swallows'], cloud:'cumulus.png', cloudOpacity:1,
      description:'Golden summer grasses and tawny Coyote Hills surrounding a blue marsh, beneath drifting luminous cumulus clouds.',
      colors:{canvas:'#343d2b',ink:'#fcf4dc',muted:'#d3cdb4',sky:'#0753aa',accent:'#f6d78e','accent-hover':'#ffe9b7',card:'#434d33','card-alt':'#495137','card-warm':'#50543a','card-last':'#56583c','card-hover':'#606446',detail:'#e6dfc9'}
    },
    autumn: {
      icon:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 3C10 2 3 7 4 14c.7 5 6 7 10 4 4-3 5-9 6-15ZM3 22 16 8m-8 9v-5m4 1h5"/></svg>',
      birds:['egret','pintail-flight'], cloud:'cumulus.png', cloudOpacity:.9,
      description:'Ochre Coyote Hills, olive and russet reeds, and a blue autumn marsh, beneath slowly drifting sculptural clouds.',
      colors:{canvas:'#3d392b',ink:'#fff1df',muted:'#d7c7b0',sky:'#345b7c',accent:'#efc28c','accent-hover':'#ffdbad',card:'#504633','card-alt':'#554b36','card-warm':'#5b4d38','card-last':'#61533b','card-hover':'#6c5c42',detail:'#e9dac4'}
    },
    winter: {
      icon:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M3.34 7l17.32 10M3.34 17 20.66 7M9 4l3 3 3-3M9 20l3-3 3 3M4.1 10.6l4.1-1.1-1.1-4.1m9.8 13.2-1.1-4.1 4.1-1.1M4.1 13.4l4.1 1.1-1.1 4.1m9.8-13.2-1.1 4.1 4.1 1.1"/></svg>',
      birds:['egret','pintail-water'], cloud:'winter-clouds.png', cloudOpacity:1,
      description:'Rain-green winter Coyote Hills, tan reeds, and a cool steel-blue marsh, beneath drifting blue-gray winter clouds. No snow.',
      colors:{canvas:'#233e43',ink:'#eff4f1',muted:'#c0d1d3',sky:'#436378',accent:'#c5dfe0','accent-hover':'#e3f2f0',card:'#2d4b52','card-alt':'#315057','card-warm':'#36545a','card-last':'#3b585c','card-hover':'#46656b',detail:'#d4e1df'}
    }
  };
  for (const [name, config] of Object.entries(seasons)) {
    config.image = `assets/seasons/${name}.png`;
    config.cloud = `assets/seasons/${config.cloud}`;
  }
  function seasonAt(date = new Date()) {
    const month = Number(dateFormat.format(date));
    return month >= 3 && month <= 5 ? 'spring' : month >= 6 && month <= 8 ? 'summer' : month >= 9 && month <= 11 ? 'autumn' : 'winter';
  }
  function applyTheme(name) {
    const root = document.documentElement, config = seasons[name];
    root.dataset.season = name;
    for (const [key,value] of Object.entries(config.colors)) root.style.setProperty(`--${key}`,value);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',config.colors.sky);
  }
  window.SeasonScene = {seasons, seasonAt, applyTheme, zone};
  applyTheme(seasonAt());
})();
