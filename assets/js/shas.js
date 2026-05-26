/* ============================================================================
   shas.js — Estructura completa del Talmud Bavli
   Fuente: Sefaria Text Map (todos los nombres son refs válidos de Sefaria)
   Cantidad de dapim por tractate confirmada desde Sefaria.
   ============================================================================ */

const SHAS = {
  'Zeraim': {
    nombre_he: 'סדר זרעים',
    nombre_es: 'Semillas',
    masejtot: [
      { ref: 'Berakhot',     he: 'ברכות',    es: 'Bendiciones', dapim: 64, ultimo: '64b' }
    ]
  },
  'Moed': {
    nombre_he: 'סדר מועד',
    nombre_es: 'Festividades',
    masejtot: [
      { ref: 'Shabbat',      he: 'שבת',      es: 'Shabat',         dapim: 157, ultimo: '157b' },
      { ref: 'Eruvin',       he: 'עירובין',  es: 'Eruvin',         dapim: 105, ultimo: '105a' },
      { ref: 'Pesachim',     he: 'פסחים',    es: 'Pesajim',        dapim: 121, ultimo: '121b' },
      { ref: 'Shekalim',     he: 'שקלים',    es: 'Shekalim',       dapim: 22,  ultimo: '22a'  },
      { ref: 'Yoma',         he: 'יומא',     es: 'Yom Kipur',      dapim: 88,  ultimo: '88a'  },
      { ref: 'Sukkah',       he: 'סוכה',     es: 'Sucá',           dapim: 56,  ultimo: '56b'  },
      { ref: 'Beitzah',      he: 'ביצה',     es: 'Beitzá',         dapim: 40,  ultimo: '40b'  },
      { ref: 'Rosh Hashanah',he: 'ראש השנה', es: 'Rosh Hashaná',   dapim: 35,  ultimo: '35a'  },
      { ref: 'Taanit',       he: 'תענית',    es: 'Taanit',         dapim: 31,  ultimo: '31a'  },
      { ref: 'Megillah',     he: 'מגילה',    es: 'Meguilá',        dapim: 32,  ultimo: '32a'  },
      { ref: 'Moed Katan',   he: 'מועד קטן', es: 'Moed Katán',     dapim: 29,  ultimo: '29a'  },
      { ref: 'Chagigah',     he: 'חגיגה',    es: 'Jaguigá',        dapim: 27,  ultimo: '27a'  }
    ]
  },
  'Nashim': {
    nombre_he: 'סדר נשים',
    nombre_es: 'Mujeres',
    masejtot: [
      { ref: 'Yevamot',      he: 'יבמות',    es: 'Yevamot',        dapim: 122, ultimo: '122b' },
      { ref: 'Ketubot',      he: 'כתובות',   es: 'Ketubot',        dapim: 112, ultimo: '112b' },
      { ref: 'Nedarim',      he: 'נדרים',    es: 'Nedarim',        dapim: 91,  ultimo: '91b'  },
      { ref: 'Nazir',        he: 'נזיר',     es: 'Nazir',          dapim: 66,  ultimo: '66b'  },
      { ref: 'Sotah',        he: 'סוטה',     es: 'Sotá',           dapim: 49,  ultimo: '49b'  },
      { ref: 'Gittin',       he: 'גיטין',    es: 'Guitin',         dapim: 90,  ultimo: '90b'  },
      { ref: 'Kiddushin',    he: 'קידושין',  es: 'Kidushín',       dapim: 82,  ultimo: '82b'  }
    ]
  },
  'Nezikin': {
    nombre_he: 'סדר נזיקין',
    nombre_es: 'Daños',
    masejtot: [
      { ref: 'Bava Kamma',   he: 'בבא קמא',  es: 'Bavá Kamá',      dapim: 119, ultimo: '119b' },
      { ref: 'Bava Metzia',  he: 'בבא מציעא',es: 'Bavá Metziá',    dapim: 119, ultimo: '119a' },
      { ref: 'Bava Batra',   he: 'בבא בתרא', es: 'Bavá Batrá',     dapim: 176, ultimo: '176b' },
      { ref: 'Sanhedrin',    he: 'סנהדרין',  es: 'Sanhedrín',      dapim: 113, ultimo: '113b' },
      { ref: 'Makkot',       he: 'מכות',     es: 'Makot',          dapim: 24,  ultimo: '24b'  },
      { ref: 'Shevuot',      he: 'שבועות',   es: 'Shevuot',        dapim: 49,  ultimo: '49b'  },
      { ref: 'Avodah Zarah', he: 'עבודה זרה',es: 'Avodá Zará',     dapim: 76,  ultimo: '76b'  },
      { ref: 'Horayot',      he: 'הוריות',   es: 'Horayot',        dapim: 14,  ultimo: '14a'  }
    ]
  },
  'Kodashim': {
    nombre_he: 'סדר קדשים',
    nombre_es: 'Cosas Sagradas',
    masejtot: [
      { ref: 'Zevachim',     he: 'זבחים',    es: 'Zevajim',        dapim: 120, ultimo: '120b' },
      { ref: 'Menachot',     he: 'מנחות',    es: 'Menajot',        dapim: 110, ultimo: '110a' },
      { ref: 'Chullin',      he: 'חולין',    es: 'Julín',          dapim: 142, ultimo: '142a' },
      { ref: 'Bekhorot',     he: 'בכורות',   es: 'Bejorot',        dapim: 61,  ultimo: '61a'  },
      { ref: 'Arakhin',      he: 'ערכין',    es: 'Arajín',         dapim: 34,  ultimo: '34a'  },
      { ref: 'Temurah',      he: 'תמורה',    es: 'Temurá',         dapim: 34,  ultimo: '34a'  },
      { ref: 'Keritot',      he: 'כריתות',   es: 'Keritot',        dapim: 28,  ultimo: '28b'  },
      { ref: 'Meilah',       he: 'מעילה',    es: 'Meilá',          dapim: 22,  ultimo: '22a'  },
      { ref: 'Tamid',        he: 'תמיד',     es: 'Tamid',          dapim: 9,   ultimo: '9a'   },
      // Niddah pertenece a Tahorot pero por convención del daf yomí se incluye aquí
    ]
  },
  'Tahorot': {
    nombre_he: 'סדר טהרות',
    nombre_es: 'Purezas',
    masejtot: [
      { ref: 'Niddah',       he: 'נדה',      es: 'Nidá',           dapim: 73,  ultimo: '73a'  }
    ]
  }
};

/**
 * Genera la lista completa de dapim para una masejet dada.
 * Cada daf tiene amud a y b excepto el último que típicamente tiene solo un amud.
 */
function generarDapim(masejet) {
  const dapim = [];
  for (let n = 2; n <= masejet.dapim; n++) {
    // Verificar si este es el último daf y solo tiene un amud
    const esUltimo = (n === masejet.dapim);
    const soloA = esUltimo && masejet.ultimo === `${n}a`;
    const soloB = esUltimo && masejet.ultimo === `${n}b`;

    if (soloA) {
      dapim.push({ amud: `${n}a`, ref: `${masejet.ref}.${n}a` });
    } else if (soloB) {
      dapim.push({ amud: `${n}a`, ref: `${masejet.ref}.${n}a` });
      dapim.push({ amud: `${n}b`, ref: `${masejet.ref}.${n}b` });
    } else {
      dapim.push({ amud: `${n}a`, ref: `${masejet.ref}.${n}a` });
      dapim.push({ amud: `${n}b`, ref: `${masejet.ref}.${n}b` });
    }
  }
  return dapim;
}

/**
 * Cuenta total de dapim del Shas (amudim).
 */
function totalAmudimShas() {
  let total = 0;
  Object.values(SHAS).forEach(seder => {
    seder.masejtot.forEach(m => {
      total += generarDapim(m).length;
    });
  });
  return total;
}

/**
 * Busca una masejet por su ref.
 */
function buscarMasejet(ref) {
  for (const seder of Object.values(SHAS)) {
    const m = seder.masejtot.find(m => m.ref === ref);
    if (m) return { ...m, seder: seder.nombre_es };
  }
  return null;
}

/**
 * Lista plana de todas las masejtot.
 */
function todasLasMasejtot() {
  const lista = [];
  Object.entries(SHAS).forEach(([sederKey, seder]) => {
    seder.masejtot.forEach(m => {
      lista.push({ ...m, seder: sederKey, seder_he: seder.nombre_he, seder_es: seder.nombre_es });
    });
  });
  return lista;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SHAS, generarDapim, totalAmudimShas, buscarMasejet, todasLasMasejtot };
}
