/* ============================================================================
   rabbanim.js — Diccionario de los Sabios del Talmud Bavli
   ============================================================================
   Lista de tanaim y amoraim más frecuentes en el Bavli, con metadata:
     - generación (T1-T5 para tanaim, A1-A8 para amoraim)
     - centro (Eretz Israel / Babilonia)
     - maestro principal
     - característica halájica
   Fuente: catalogación estándar académica (Strack-Stemberger).
   ============================================================================ */

const Rabbanim = (function() {

  /* === GENERACIONES ===
     Marco cronológico estándar de Strack-Stemberger.
  */
  const GENERACIONES = {
    'Z':  { nombre: 'Zugot',           periodo: 'pre-70 EC',     color: '#8b6635' },
    'T1': { nombre: 'Tana gen. 1',     periodo: '10-80 EC',      color: '#534AB7' },
    'T2': { nombre: 'Tana gen. 2',     periodo: '80-110 EC',     color: '#4F3FA8' },
    'T3': { nombre: 'Tana gen. 3',     periodo: '110-135 EC',    color: '#4A3499' },
    'T4': { nombre: 'Tana gen. 4',     periodo: '135-170 EC',    color: '#3C3489' },
    'T5': { nombre: 'Tana gen. 5',     periodo: '170-200 EC',    color: '#3C3489' },
    'TA': { nombre: 'Tana/Amorá',      periodo: '200-220 EC',    color: '#6b4423' },
    'A1': { nombre: 'Amorá gen. 1',    periodo: '220-250 EC',    color: '#1D9E75' },
    'A2': { nombre: 'Amorá gen. 2',    periodo: '250-290 EC',    color: '#1D9E75' },
    'A3': { nombre: 'Amorá gen. 3',    periodo: '290-320 EC',    color: '#0F6E56' },
    'A4': { nombre: 'Amorá gen. 4',    periodo: '320-350 EC',    color: '#0F6E56' },
    'A5': { nombre: 'Amorá gen. 5',    periodo: '350-375 EC',    color: '#085041' },
    'A6': { nombre: 'Amorá gen. 6',    periodo: '375-425 EC',    color: '#085041' },
    'A7': { nombre: 'Amorá gen. 7',    periodo: '425-460 EC',    color: '#04342C' },
    'A8': { nombre: 'Amorá gen. 8',    periodo: '460-500 EC',    color: '#04342C' }
  };

  /* === RABBANIM ===
     ~80 figuras más mencionadas en el Bavli.
     Las regex incluyen variantes con/sin niqud.
  */
  const SABIOS = [

    // === ZUGOT (pre-70 EC) ===
    { he: 'הלל', regex: /הלל(?!ך|ים|ה|ל)/g, nombre_es: 'Hilel', gen: 'Z', centro: 'EI', tipo: 'tana',
      info: 'Líder pre-destrucción del Templo. Famoso por sus siete reglas hermenéuticas y disputas con Shamai.' },
    { he: 'שמאי', regex: /שמאי(?![א-ת])/g, nombre_es: 'Shamai', gen: 'Z', centro: 'EI', tipo: 'tana',
      info: 'Contemporáneo y opositor de Hilel. Famoso por su rigor halájico. Las casas (Beit Hilel/Beit Shamai) continuaron sus disputas.' },

    // === TANAIM GEN 1 (10-80 EC) ===
    { he: 'רבן יוחנן בן זכאי', regex: /רבן יוחנן בן זכאי|רבי יוחנן בן זכאי/g, nombre_es: 'R. Yojanán ben Zakai', gen: 'T1', centro: 'EI', tipo: 'tana',
      info: 'Salvador del judaísmo post-destrucción. Estableció Yavné como centro de aprendizaje. Maestro de la siguiente generación.' },
    { he: 'רבן גמליאל', regex: /רבן גמליאל(?!\sדיבנה)/g, nombre_es: 'Rabán Gamliel', gen: 'T1', centro: 'EI', tipo: 'tana',
      info: 'Nasí de Yavné. Su autoridad era central; mencionado en la mishná de Berajot 2a sobre el zman.' },
    { he: 'רבי אליעזר', regex: /רבי אליעזר(?!\sבן)/g, nombre_es: 'R. Eliezer', gen: 'T2', centro: 'EI', tipo: 'tana',
      info: 'R. Eliezer ben Hyrcanus. Alumno principal de R. Yojanán ben Zakai. Famosa controversia del horno de Akhnai.' },
    { he: 'רבי יהושע', regex: /רבי יהושע(?!\sבן)/g, nombre_es: 'R. Yehoshúa', gen: 'T2', centro: 'EI', tipo: 'tana',
      info: 'R. Yehoshúa ben Jananyá. Co-discípulo de R. Eliezer. Opinión central en muchas disputas tanaíticas.' },

    // === TANAIM GEN 3 (110-135 EC) ===
    { he: 'רבי עקיבא', regex: /רבי עקיבא|רבי עקיבה/g, nombre_es: 'R. Akiva', gen: 'T3', centro: 'EI', tipo: 'tana',
      info: 'Una de las figuras más grandes del Talmud. Sistematizó el corpus oral; maestro de R. Meir, R. Yehudá, R. Shimon. Mártir durante Bar Kojba.' },
    { he: 'רבי ישמעאל', regex: /רבי ישמעאל(?!\sבן)/g, nombre_es: 'R. Ishmael', gen: 'T3', centro: 'EI', tipo: 'tana',
      info: 'Contemporáneo y opositor escolar de R. Akiva. Famoso por las 13 reglas hermenéuticas (יג מידות). Frecuentemente disputa con R. Akiva sobre métodos exegéticos.' },
    { he: 'רבי טרפון', regex: /רבי טרפון/g, nombre_es: 'R. Tarfón', gen: 'T3', centro: 'EI', tipo: 'tana',
      info: 'Famoso por su riqueza y por la frase "no eres tú quien debe completar la tarea, pero tampoco eres libre de abandonarla".' },

    // === TANAIM GEN 4 (135-170 EC) — alumnos de R. Akiva ===
    { he: 'רבי מאיר', regex: /רבי מאיר/g, nombre_es: 'R. Meir', gen: 'T4', centro: 'EI', tipo: 'tana',
      info: 'Alumno principal de R. Akiva. Sus opiniones forman la base oculta de la Mishná editada por R. Yehudá HaNasí. Casado con Bruriá.' },
    { he: 'רבי יהודה', regex: /רבי יהודה(?!\sהנשיא)/g, nombre_es: 'R. Yehudá', gen: 'T4', centro: 'EI', tipo: 'tana',
      info: 'R. Yehudá bar Ilai. Alumno de R. Akiva. Frecuentemente debate con R. Meir. Famoso por su erudición y sus declaraciones halájicas precisas.' },
    { he: 'רבי שמעון', regex: /רבי שמעון(?!\sבן)/g, nombre_es: 'R. Shimon', gen: 'T4', centro: 'EI', tipo: 'tana',
      info: 'R. Shimon bar Yojai. Alumno de R. Akiva. Mártir y místico. La tradición le atribuye el Zohar. Posición frecuente en disputas talmúdicas.' },
    { he: 'רבי יוסי', regex: /רבי יוסי(?!\sבן|\sהגלילי)/g, nombre_es: 'R. Yosi', gen: 'T4', centro: 'EI', tipo: 'tana',
      info: 'R. Yosi ben Jalaftá. Conocido por su moderación y por la regla "la halajá sigue a R. Yosi cuando disputa con sus colegas".' },

    // === TANA / AMORA (200-220 EC) — Rabbi (editor de la Mishná) ===
    { he: 'רבי יהודה הנשיא', regex: /רבי יהודה הנשיא/g, nombre_es: 'R. Yehudá HaNasí', gen: 'TA', centro: 'EI', tipo: 'tana',
      info: 'Editor de la Mishná. Llamado simplemente "Rabbi" en el Talmud. Su redacción fija el corpus tanaítico que la Guemará comentará.' },
    { he: 'רבי(?!\\s)', regex: /(?<![א-ת])רבי(?!\s[א-ת])/g, nombre_es: 'Rabbi (R. Yehudá HaNasí)', gen: 'TA', centro: 'EI', tipo: 'tana',
      info: 'Cuando el Talmud dice "Rabbi" sin más, se refiere a R. Yehudá HaNasí, el editor de la Mishná.' },

    // === AMORAIM BAVEL GEN 1 (220-250 EC) ===
    { he: 'רב', regex: /(?<![א-ת])רב(?![ין|א|י|ה|ו]|\s[א-ת])/g, nombre_es: 'Rav', gen: 'A1', centro: 'BB', tipo: 'amora',
      info: 'Aba Arikha — fundador de la academia de Sura. Discípulo de Rabbi en Eretz Israel; trajo la enseñanza a Babilonia. Suele decirse "אמר רב" sin más.' },
    { he: 'שמואל', regex: /(?<![א-ת])שמואל(?![א-ת])/g, nombre_es: 'Shmuel', gen: 'A1', centro: 'BB', tipo: 'amora',
      info: 'Mar Shmuel — colega de Rav y fundador de la academia de Neharde\'a. Experto en astronomía y leyes civiles. "Halajá como Shmuel en monetarias".' },

    // === AMORAIM EI GEN 1 (220-250 EC) ===
    { he: 'רבי חנינא', regex: /רבי חנינא(?!\sבן)/g, nombre_es: 'R. Janina', gen: 'A1', centro: 'EI', tipo: 'amora',
      info: 'R. Janina bar Jama. Líder amoraítico temprano de Eretz Israel. Sus declaraciones tienen gran autoridad.' },
    { he: 'רבי ינאי', regex: /רבי ינאי/g, nombre_es: 'R. Yanai', gen: 'A1', centro: 'EI', tipo: 'amora',
      info: 'Maestro de R. Yojanán. Fundador de academia rural. Importante en transmisión de tradiciones tannaíticas.' },

    // === AMORAIM GEN 2 (250-290 EC) ===
    { he: 'רבי יוחנן', regex: /רבי יוחנן(?!\sבן\sזכאי|\sבן)/g, nombre_es: 'R. Yojanán', gen: 'A2', centro: 'EI', tipo: 'amora',
      info: 'R. Yojanán bar Napajá. Editor del Talmud Yerushalmí. Maestro central de la academia de Tiberias. Cuñado y opositor de Resh Lakish.' },
    { he: 'ריש לקיש', regex: /ריש לקיש/g, nombre_es: 'Resh Lakish', gen: 'A2', centro: 'EI', tipo: 'amora',
      info: 'R. Shimon ben Lakish. Ex-gladiador convertido en gran erudito. Famoso debate constante con R. Yojanán; su muerte causó el colapso emocional de R. Yojanán.' },
    { he: 'רב הונא', regex: /רב הונא(?!\sבר|\sבריה)/g, nombre_es: 'Rav Huna', gen: 'A2', centro: 'BB', tipo: 'amora',
      info: 'Líder de la academia de Sura tras Rav. Sus enseñanzas son centrales en el Bavli.' },
    { he: 'רב יהודה', regex: /רב יהודה(?!\sבר)/g, nombre_es: 'Rav Yehudá', gen: 'A2', centro: 'BB', tipo: 'amora',
      info: 'Rav Yehudá bar Yejezkel. Fundador de la academia de Pumbedita. Alumno de Rav y Shmuel.' },

    // === AMORAIM GEN 3 (290-320 EC) ===
    { he: 'רב חסדא', regex: /רב חסדא/g, nombre_es: 'Rav Jisda', gen: 'A3', centro: 'BB', tipo: 'amora',
      info: 'Líder de Sura tras Rav Huna. Famoso por su perspicacia analítica.' },
    { he: 'רב נחמן', regex: /רב נחמן(?!\sבר\sיצחק)/g, nombre_es: 'Rav Najmán', gen: 'A3', centro: 'BB', tipo: 'amora',
      info: 'Rav Najmán bar Yaakov. Famoso por su autoridad en leyes monetarias. "La halajá como Rav Najmán en dinari (monetarias)".' },
    { he: 'רב ששת', regex: /רב ששת/g, nombre_es: 'Rav Sheshet', gen: 'A3', centro: 'BB', tipo: 'amora',
      info: 'Ciego pero con memoria fenomenal de las tradiciones tannaíticas. Frecuentemente debate con Rav Najmán.' },
    { he: 'רבה', regex: /(?<![א-ת])רבה(?!\sבר|\sבריה|\sבן)/g, nombre_es: 'Rabá', gen: 'A3', centro: 'BB', tipo: 'amora',
      info: 'Rabá bar Najmaní. Líder de Pumbedita. "Rabá quita montañas" — famoso por su poder analítico. Compañero/rival de Rav Yosef.' },
    { he: 'רב יוסף', regex: /רב יוסף(?!\sבר)/g, nombre_es: 'Rav Yosef', gen: 'A3', centro: 'BB', tipo: 'amora',
      info: 'Sucesor de Rabá en Pumbedita. "Rav Yosef es Sinaí" — famoso por su dominio enciclopédico de tradiciones.' },

    // === AMORAIM GEN 4 (320-350 EC) — la generación de Abaye y Rava ===
    { he: 'אביי', regex: /(?<![א-ת])אביי/g, nombre_es: 'Abaye', gen: 'A4', centro: 'BB', tipo: 'amora',
      info: 'Una de las dos figuras centrales del Bavli. Compañero/oponente de Rava. Sus debates ("הויות דאביי ורבא") son tan icónicos que el Talmud usa la expresión para referirse a la dialéctica misma.' },
    { he: 'רבא', regex: /(?<![א-ת])רבא(?![ה])/g, nombre_es: 'Rava', gen: 'A4', centro: 'BB', tipo: 'amora',
      info: 'Rava bar Yosef bar Jama. La halajá sigue a Rava contra Abaye en 6 casos (יע"ל קג"ם) y a Abaye contra Rava en el resto. Líder de la academia de Majoza.' },
    { he: 'רב פפא', regex: /רב פפא/g, nombre_es: 'Rav Papa', gen: 'A5', centro: 'BB', tipo: 'amora',
      info: 'Alumno de Abaye y Rava. Fundador de la academia de Najar Papá. Sus declaraciones cierran muchas sugiot.' },

    // === AMORAIM GEN 5-7 ===
    { he: 'רב אשי', regex: /רב אשי/g, nombre_es: 'Rav Ashi', gen: 'A6', centro: 'BB', tipo: 'amora',
      info: 'Editor principal del Talmud Bavli. Líder de Sura por 60 años. Junto con Ravina I, organizó el corpus que conocemos hoy.' },
    { he: 'רבינא', regex: /רבינא(?![א-ת])/g, nombre_es: 'Ravina', gen: 'A7', centro: 'BB', tipo: 'amora',
      info: 'Hay dos Ravinas. Ravina I fue co-editor del Talmud con Rav Ashi. Ravina II cerró formalmente el período amoraítico (~500 EC).' },
    { he: 'רב הונא בריה דרב יהושע', regex: /רב הונא בריה דרב יהושע/g, nombre_es: 'Rav Huna hijo de Rav Yehoshúa', gen: 'A5', centro: 'BB', tipo: 'amora',
      info: 'Amorá babilónico de la generación de Abaye-Rava. Frecuentemente aparece junto con Rav Papa.' }
  ];

  /* ----- Funciones públicas ----- */

  function detectarEnTexto(textoHebreo) {
    if (!textoHebreo) return [];
    const detectados = {};
    SABIOS.forEach(s => {
      const matches = [...textoHebreo.matchAll(s.regex)];
      if (matches.length > 0) {
        detectados[s.nombre_es] = {
          ...s,
          count: matches.length
        };
      }
    });
    return Object.values(detectados).sort((a, b) => b.count - a.count);
  }

  function estadisticas(detectados) {
    const porGeneracion = {};
    const porCentro = { EI: 0, BB: 0 };
    let totalTanaim = 0;
    let totalAmoraim = 0;

    detectados.forEach(d => {
      porGeneracion[d.gen] = (porGeneracion[d.gen] || 0) + d.count;
      porCentro[d.centro] = (porCentro[d.centro] || 0) + d.count;
      if (d.tipo === 'tana') totalTanaim += d.count;
      else totalAmoraim += d.count;
    });

    return { porGeneracion, porCentro, totalTanaim, totalAmoraim };
  }

  return {
    GENERACIONES,
    SABIOS,
    detectarEnTexto,
    estadisticas
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Rabbanim;
}
