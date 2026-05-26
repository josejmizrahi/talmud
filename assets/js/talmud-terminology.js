/* ============================================================================
   talmud-terminology.js — Vocabulario formal del Talmud Bavli
   ============================================================================
   Catalogación sistemática de la terminología arameo-hebrea del Bavli,
   organizada por función discursiva. Estos patrones son formulaicos:
   aparecen miles de veces a lo largo del Shas con significado consistente.

   Fuentes:
     - Wikipedia: List of Talmudic principles
     - Frank, "The Practical Talmud Dictionary"
     - Steinsaltz Reference Guide
     - Halivni, "Sources and Traditions"

   Cada entrada tiene:
     - he:       el patrón hebreo/arameo
     - regex:    expresión regular para detectarlo (sin niqud)
     - tipo:     categoría discursiva (kushya, teruts, etc.)
     - nivel:    tana / amora / stam / general
     - significa: traducción/función
     - sigue:    qué tipo de movimiento típicamente le sigue
   ============================================================================ */

const TalmudTerminology = (function() {

  /* === CATEGORÍAS DISCURSIVAS ===
     Cada movimiento del talmud cae en una de estas categorías.
     Reflejan el modelo Tana → Amora → Stam de Halivni/Friedman.
  */

  const CATEGORIAS = {
    cita_mishna:   { color: '#534AB7', label: 'Cita de Mishná',       icono: 'M' },
    cita_braita:   { color: '#993C1D', label: 'Cita de Braita',       icono: 'B' },
    cita_pasuk:    { color: '#854F0B', label: 'Cita bíblica',         icono: 'פ' },
    memra_amora:   { color: '#0F6E56', label: 'Memrá amoraítica',     icono: 'A' },
    kushya:        { color: '#A32D2D', label: 'Objeción (קושיא)',     icono: '?' },
    teruts:        { color: '#1E6B5A', label: 'Respuesta (תירוץ)',    icono: '!' },
    logico:        { color: '#5A3A8A', label: 'Principio lógico',     icono: 'L' },
    halaja:        { color: '#1E3A5F', label: 'Halajá / psak',        icono: 'H' },
    transicion:    { color: '#5F5E5A', label: 'Transición (Stam)',    icono: '→' },
    conclusion:    { color: '#3B6D11', label: 'Conclusión',           icono: '✓' },
    disputa:       { color: '#993556', label: 'Disputa / מחלוקת',     icono: '⇆' }
  };

  /* === PATRONES TERMINOLÓGICOS ===
     Ordenados por categoría. Los regex usan ambas formas: con y sin niqud.
  */

  const PATRONES = [

    // ========================================================================
    // CITAS DE FUENTES TANAÍTICAS
    // ========================================================================
    {
      he: 'תַּנְיָא',
      regex: /תני[יִָ]?א\b|תַּנְיָא/g,
      tipo: 'cita_braita',
      nivel: 'stam',
      significa: 'Se enseñó (introduce braita)',
      explica: 'Marcador formal que introduce una braita — texto tanaítico fuera de la Mishná. La braita es citada con autoridad porque proviene del mismo período tanaítico.'
    },
    {
      he: 'דְּתַנְיָא',
      regex: /דתני[יִָ]?א|דְּתַנְיָא/g,
      tipo: 'cita_braita',
      nivel: 'stam',
      significa: 'Como se enseñó (cita de braita como apoyo)',
      explica: 'Variante de תניא precedida por "ד" (como), usada para introducir una braita en función de apoyo o prueba dentro de un argumento.'
    },
    {
      he: 'תָּנָא',
      regex: /(?<![א-ת])תנא(?![ת])|תָּנָא/g,
      tipo: 'cita_braita',
      nivel: 'stam',
      significa: 'El tana enseñó',
      explica: 'Introduce material tanaítico atribuido a un tana específico o genérico. Frecuentemente abre una braita.'
    },
    {
      he: 'תְּנַן',
      regex: /(?<![א-ת])תנן(?![הוֹ])|תְּנַן/g,
      tipo: 'cita_mishna',
      nivel: 'stam',
      significa: 'Enseñamos (cita de la Mishná)',
      explica: 'Marcador estándar para citar la Mishná. "Nuestra Mishná dice...". Indica autoridad mishnáica.'
    },
    {
      he: 'מַתְנִיתִין',
      regex: /מתניתין|מַתְנִיתִין/g,
      tipo: 'cita_mishna',
      nivel: 'stam',
      significa: 'Nuestra Mishná',
      explica: 'Referencia directa a la Mishná que enmarca la sugiá. Cuando el Stam discute la mishná actual, la llama así.'
    },
    {
      he: 'תוספתא',
      regex: /תוספתא|תוֹסֶפְתָּא/g,
      tipo: 'cita_braita',
      nivel: 'stam',
      significa: 'Cita de la Tosefta',
      explica: 'La Tosefta es la compilación tanaítica paralela a la Mishná. Citas explícitas son raras pero significativas.'
    },

    // ========================================================================
    // CITAS BÍBLICAS
    // ========================================================================
    {
      he: 'שֶׁנֶּאֱמַר',
      regex: /שנאמר|שֶׁנֶּאֱמַר/g,
      tipo: 'cita_pasuk',
      nivel: 'general',
      significa: 'Como está dicho (introduce verso)',
      explica: 'Marcador más común para citar la Torá como prueba. Le sigue siempre un verso textual del Tanaj.'
    },
    {
      he: 'דִּכְתִיב',
      regex: /דכתיב|דִּכְתִיב/g,
      tipo: 'cita_pasuk',
      nivel: 'general',
      significa: 'Como está escrito',
      explica: 'Variante aramea de שנאמר. Igualmente introduce un verso bíblico, frecuentemente en discusión legal.'
    },
    {
      he: 'וְאוֹמֵר',
      regex: /ואומר|וְאוֹמֵר/g,
      tipo: 'cita_pasuk',
      nivel: 'stam',
      significa: 'Y dice (cita adicional)',
      explica: 'Introduce un segundo verso de apoyo cuando el primero podría interpretarse de otra manera. Marca refuerzo argumentativo.'
    },
    {
      he: 'מַאי מַשְׁמַע',
      regex: /מאי משמע|מַאי מַשְׁמַע/g,
      tipo: 'cita_pasuk',
      nivel: 'stam',
      significa: '¿Qué se deriva del verso?',
      explica: 'Pregunta del Stam que pide la base bíblica de una halajá. Suele precederse a שנאמר o דכתיב.'
    },
    {
      he: 'מְנָא הָנֵי מִילֵּי',
      regex: /מנא הני מילי|מְנָא הָנֵי מִילֵּי/g,
      tipo: 'cita_pasuk',
      nivel: 'stam',
      significa: '¿De dónde provienen estas palabras?',
      explica: 'Pregunta formulaica del Stam pidiendo la fuente bíblica de una halajá citada. Una de las marcas más características del estilo Stam.'
    },

    // ========================================================================
    // MEMROT AMORAÍTICAS (citas de amoraim)
    // ========================================================================
    {
      he: 'אָמַר',
      regex: /(?<![א-ת])אמר(?![יו])|אָמַר/g,
      tipo: 'memra_amora',
      nivel: 'general',
      significa: 'Dijo (cita amoraítica)',
      explica: 'Marcador estándar para introducir una declaración (memrá) de un amorá. Típicamente seguido del nombre del amorá.'
    },
    {
      he: 'אִיתְּמַר',
      regex: /איתמר|אִיתְּמַר/g,
      tipo: 'memra_amora',
      nivel: 'stam',
      significa: 'Se dijo (cita anónima de memrá)',
      explica: 'Forma pasiva — introduce una memrá amoraítica sin atribución directa. Frecuentemente abre disputas entre amoraim.'
    },
    {
      he: 'אָמְרִי',
      regex: /אמרי|אָמְרִי/g,
      tipo: 'memra_amora',
      nivel: 'stam',
      significa: 'Dijeron (cita colectiva)',
      explica: 'Forma plural. Atribuye una declaración a un grupo, frecuentemente "אמרי במערבא" (dijeron en Eretz Israel).'
    },
    {
      he: 'הָא דְּאָמַר',
      regex: /הא דאמר|הָא דְּאָמַר/g,
      tipo: 'memra_amora',
      nivel: 'stam',
      significa: 'Esto que dijo (cita auto-referencial)',
      explica: 'Apunta a una memrá previamente citada. Conecta dos posiciones del mismo amorá.'
    },

    // ========================================================================
    // OBJECIONES — קושיא
    // ========================================================================
    {
      he: 'מֵתִיב',
      regex: /(?<![א-ת])מתיב(?![ה])|מֵתִיב/g,
      tipo: 'kushya',
      nivel: 'amora',
      significa: 'Objetó (un amorá objeta)',
      explica: 'Un amorá presenta una objeción formal, típicamente desde una braita o mishná, contra una posición previa. Una de las formas más fuertes de cuestionamiento.'
    },
    {
      he: 'אֵיתִיבֵיהּ',
      regex: /איתיביה|אֵיתִיבֵיהּ/g,
      tipo: 'kushya',
      nivel: 'amora',
      significa: 'Le objetó (a él)',
      explica: 'Forma reflexiva — un amorá objeta directamente a otro amorá. Marca un debate cara a cara.'
    },
    {
      he: 'וּרְמִינְהוּ',
      regex: /ורמינהו|וּרְמִינְהוּ/g,
      tipo: 'kushya',
      nivel: 'stam',
      significa: 'Y le opusieron (contradicción de fuentes)',
      explica: 'El Stam presenta una segunda fuente que aparentemente contradice la primera. Movimiento típico para forzar reconciliación.'
    },
    {
      he: 'קַשְׁיָא',
      regex: /(?<![א-ת])קשיא(?![ת])|קַשְׁיָא/g,
      tipo: 'kushya',
      nivel: 'general',
      significa: 'Es difícil / problemático',
      explica: 'Marca una dificultad sin resolver inmediata. Puede ser pregunta retórica o reconocimiento de problema irresoluble.'
    },
    {
      he: 'תְּיוּבְתָּא',
      regex: /תיובתא|תְּיוּבְתָּא/g,
      tipo: 'kushya',
      nivel: 'stam',
      significa: 'Refutación concluyente',
      explica: 'La objeción es tan fuerte que refuta definitivamente la posición. Frecuentemente se repite (תיובתא ... תיובתא) para enfatizar.'
    },
    {
      he: 'וְהָתַנְיָא',
      regex: /והתניא|וְהָתַנְיָא/g,
      tipo: 'kushya',
      nivel: 'stam',
      significa: 'Pero se enseñó (objeción desde braita)',
      explica: 'Variante de objeción: "pero esa braita dice lo contrario". El "ו" + "ה" marca contraste.'
    },
    {
      he: 'תָּא שְׁמַע',
      regex: /תא שמע|תָּא שְׁמַע/g,
      tipo: 'kushya',
      nivel: 'stam',
      significa: 'Ven y oye (prueba/desafío)',
      explica: 'Introduce una fuente que prueba o desafía un punto. Si confirma la posición, es prueba; si la contradice, es objeción.'
    },

    // ========================================================================
    // RESPUESTAS — תירוץ
    // ========================================================================
    {
      he: 'אֶלָּא',
      regex: /(?<![א-ת])אלא(?![ה])|אֶלָּא/g,
      tipo: 'teruts',
      nivel: 'general',
      significa: 'Sino (reinterpretación)',
      explica: 'Marca abandono de una interpretación previa en favor de una nueva. Movimiento dialéctico central del Bavli.'
    },
    {
      he: 'לְעוֹלָם',
      regex: /(?<![א-ת])לעולם|לְעוֹלָם/g,
      tipo: 'teruts',
      nivel: 'stam',
      significa: 'En verdad (defensa de posición)',
      explica: 'Defiende la posición original contra una objeción, reinterpretándola sin abandonarla. "En verdad la posición sigue de pie, pero..."'
    },
    {
      he: 'הָכִי קָאָמַר',
      regex: /הכי קאמר|הָכִי קָאָמַר/g,
      tipo: 'teruts',
      nivel: 'stam',
      significa: 'Esto es lo que dijo (reinterpretación)',
      explica: 'Reinterpreta el sentido literal de una declaración previa para resolver una contradicción aparente.'
    },
    {
      he: 'שָׁאנֵי',
      regex: /(?<![א-ת])שאני|שָׁאנֵי/g,
      tipo: 'teruts',
      nivel: 'general',
      significa: 'Es diferente (distinción)',
      explica: 'Distingue dos casos que parecían similares. "El caso A es diferente porque..."'
    },
    {
      he: 'דִּילְמָא',
      regex: /דילמא|דִּילְמָא/g,
      tipo: 'teruts',
      nivel: 'stam',
      significa: 'Quizás (alternativa)',
      explica: 'Sugiere una interpretación alternativa para resolver una dificultad. Marca propuesta tentativa.'
    },
    {
      he: 'לָא קַשְׁיָא',
      regex: /לא קשיא|לָא קַשְׁיָא/g,
      tipo: 'teruts',
      nivel: 'stam',
      significa: 'No es difícil (resolución)',
      explica: 'Respuesta directa a una קשיא — declara que la dificultad puede resolverse, típicamente mediante distinción.'
    },

    // ========================================================================
    // PRINCIPIOS LÓGICOS
    // ========================================================================
    {
      he: 'קַל וָחוֹמֶר',
      regex: /קל וחומר|קַל וָחוֹמֶר/g,
      tipo: 'logico',
      nivel: 'general',
      significa: 'A fortiori (de leve a grave)',
      explica: 'Una de las 13 reglas hermenéuticas de R. Ishmael. Si una ley estricta tiene una leniencia, un caso más leniente la tendrá también. Inferencia a fortiori.'
    },
    {
      he: 'גְּזֵרָה שָׁוָה',
      regex: /גזרה שוה|גְּזֵרָה שָׁוָה/g,
      tipo: 'logico',
      nivel: 'general',
      significa: 'Analogía verbal',
      explica: 'Si dos versículos comparten palabras, se asume que sus leyes son análogas. Solo válida cuando es tradición recibida.'
    },
    {
      he: 'בִּנְיַן אָב',
      regex: /בנין אב|בִּנְיַן אָב/g,
      tipo: 'logico',
      nivel: 'general',
      significa: 'Construcción paradigmática',
      explica: 'Un caso explícito en la Torá sirve como paradigma del cual se derivan principios para casos análogos.'
    },
    {
      he: 'הֶיקֵּשׁ',
      regex: /(?<![א-ת])היקש|הֶיקֵּשׁ/g,
      tipo: 'logico',
      nivel: 'general',
      significa: 'Yuxtaposición exegética',
      explica: 'Dos temas yuxtapuestos en la Torá se comparan halájicamente. Una de las trece reglas de R. Ishmael.'
    },
    {
      he: 'חֲזָקָה',
      regex: /(?<![א-ת])חזקה|חֲזָקָה/g,
      tipo: 'logico',
      nivel: 'general',
      significa: 'Presunción / status quo',
      explica: 'Presunción que mantiene su validez hasta prueba contraria. Pilar de la jurisprudencia talmúdica.'
    },
    {
      he: 'סָפֵק',
      regex: /(?<![א-ת])ספק(?![ת])|סָפֵק/g,
      tipo: 'logico',
      nivel: 'general',
      significa: 'Duda halájica',
      explica: 'Caso donde la halajá es incierta. La resolución depende de si es ספק deOraita (rigor) o ספק derabanan (leniencia).'
    },
    {
      he: 'מַחֲלוֹקֶת',
      regex: /מחלוקת|מַחֲלוֹקֶת/g,
      tipo: 'disputa',
      nivel: 'general',
      significa: 'Disputa formal',
      explica: 'Disputa estructurada entre dos o más autoridades. El Bavli registra cientos de מחלוקות con sus razones.'
    },
    {
      he: 'פְּלִיגִי',
      regex: /(?<![א-ת])פליגי|פְּלִיגִי/g,
      tipo: 'disputa',
      nivel: 'stam',
      significa: 'Discrepan',
      explica: 'Verbo que marca discrepancia entre autoridades. Típicamente seguido por una identificación de las opiniones.'
    },
    {
      he: 'בְּמַאי קָא מִיפַּלְגִי',
      regex: /במאי קא מיפלגי|בְּמַאי קָא מִיפַּלְגִי/g,
      tipo: 'disputa',
      nivel: 'stam',
      significa: '¿En qué discrepan?',
      explica: 'Pregunta clave del Stam que busca el principio subyacente a una disputa. Conduce al análisis profundo.'
    },

    // ========================================================================
    // CATEGORÍAS HALÁJICAS
    // ========================================================================
    {
      he: 'דְּאוֹרַיְיתָא',
      regex: /דאוריית[אָ]|דְּאוֹרַיְיתָא/g,
      tipo: 'halaja',
      nivel: 'general',
      significa: 'De la Torá (bíblico)',
      explica: 'Marca obligación de origen bíblico. Tiene mayor rigor que las obligaciones rabínicas (דרבנן).'
    },
    {
      he: 'דְּרַבָּנַן',
      regex: /דרבנן|דְּרַבָּנַן/g,
      tipo: 'halaja',
      nivel: 'general',
      significa: 'De los rabinos (rabínico)',
      explica: 'Obligación instituida por los sabios. En caso de duda, se aplica leniencia (ספק דרבנן לקולא).'
    },
    {
      he: 'הֲלָכָה',
      regex: /(?<![א-ת])הלכה(?![ָה])|הֲלָכָה/g,
      tipo: 'halaja',
      nivel: 'general',
      significa: 'Halajá / norma',
      explica: 'Designa una norma legal aceptada. Frecuentemente seguido por "כ..." para indicar a quién sigue la halajá final.'
    },
    {
      he: 'אֲסוּר',
      regex: /(?<![א-ת])אסור(?![ה])|אֲסוּר/g,
      tipo: 'halaja',
      nivel: 'general',
      significa: 'Prohibido',
      explica: 'Categoría de prohibición. El grado (deOraita/derabanan) y la severidad dependen del contexto.'
    },
    {
      he: 'מוּתָּר',
      regex: /(?<![א-ת])מותר(?![ה])|מוּתָּר/g,
      tipo: 'halaja',
      nivel: 'general',
      significa: 'Permitido',
      explica: 'Categoría de permiso explícito. Frecuentemente sirve como conclusión halájica.'
    },
    {
      he: 'חַיָּיב',
      regex: /(?<![א-ת])חייב(?![ה])|חַיָּיב/g,
      tipo: 'halaja',
      nivel: 'general',
      significa: 'Obligado / responsable',
      explica: 'Designa obligación o responsabilidad legal. En contexto de daños: responsable de pagar. En contexto ritual: obligado a cumplir.'
    },
    {
      he: 'פָּטוּר',
      regex: /(?<![א-ת])פטור(?![ה])|פָּטוּר/g,
      tipo: 'halaja',
      nivel: 'general',
      significa: 'Exento',
      explica: 'Categoría de exención. Opuesto técnico de חייב. Puede ser "exento pero prohibido" o "exento y permitido".'
    },

    // ========================================================================
    // TRANSICIONES Y PREGUNTAS DEL STAM
    // ========================================================================
    {
      he: 'מַאי',
      regex: /(?<![א-ת])מאי(?![ן])|מַאי/g,
      tipo: 'transicion',
      nivel: 'stam',
      significa: '¿Qué?',
      explica: 'La pregunta más básica del Stam. Pide aclaración de un término o significado. Inicia investigaciones.'
    },
    {
      he: 'קָא סָלְקָא דַּעְתָּךְ',
      regex: /קא סלקא דעתך|קָא סָלְקָא דַּעְתָּךְ|קסלקא דעתך/g,
      tipo: 'transicion',
      nivel: 'stam',
      significa: 'Surge la suposición',
      explica: 'El Stam articula una suposición que el lector podría tener, para luego refutarla o matizarla. Recurso pedagógico clásico.'
    },
    {
      he: 'גּוּפָא',
      regex: /(?<![א-ת])גופא|גּוּפָא/g,
      tipo: 'transicion',
      nivel: 'stam',
      significa: 'El cuerpo (volver al texto)',
      explica: 'Marca el regreso a una cita que fue mencionada de paso, para analizarla en detalle. "Volvamos al texto que citamos."'
    },
    {
      he: 'בִּשְׁלָמָא',
      regex: /בשלמא|בִּשְׁלָמָא/g,
      tipo: 'transicion',
      nivel: 'stam',
      significa: 'Está bien (concede para refutar)',
      explica: 'Concede provisionalmente una posición para luego mostrar su problema. "Está bien según X, pero según Y..."'
    },
    {
      he: 'אֶלָּא לְמַאן דְּאָמַר',
      regex: /אלא למאן דאמר|אֶלָּא לְמַאן דְּאָמַר/g,
      tipo: 'transicion',
      nivel: 'stam',
      significa: 'Pero según el que dice',
      explica: 'Aplica una pregunta selectivamente a una opinión específica dentro de una disputa.'
    },
    {
      he: 'מַאי טַעְמָא',
      regex: /מאי טעמא|מַאי טַעְמָא/g,
      tipo: 'transicion',
      nivel: 'stam',
      significa: '¿Cuál es la razón?',
      explica: 'Pide el razonamiento detrás de una halajá. Frecuentemente conduce a una cita bíblica o principio.'
    },

    // ========================================================================
    // CONCLUSIONES
    // ========================================================================
    {
      he: 'שְׁמַע מִינַּהּ',
      regex: /שמע מינה|שְׁמַע מִינַּהּ/g,
      tipo: 'conclusion',
      nivel: 'stam',
      significa: 'Deriva de aquí',
      explica: 'Concluye que un punto puede derivarse de una fuente analizada. Cierra una mini-investigación dentro de la sugiá.'
    },
    {
      he: 'הִלְכְתָא',
      regex: /(?<![א-ת])הלכתא|הִלְכְתָא/g,
      tipo: 'conclusion',
      nivel: 'stam',
      significa: 'La halajá (es)',
      explica: 'Declara la halajá final. Marca el psak — la decisión normativa que emerge del debate.'
    },
    {
      he: 'מַסְקָנָא',
      regex: /(?<![א-ת])מסקנא|מַסְקָנָא/g,
      tipo: 'conclusion',
      nivel: 'stam',
      significa: 'Conclusión final',
      explica: 'Marcador explícito de conclusión de la sugiá. Menos común que otros marcadores conclusivos.'
    },
    {
      he: 'אֲמַר רַב נַחְמָן',
      regex: /אמר רב נחמן|אֲמַר רַב נַחְמָן/g,
      tipo: 'conclusion',
      nivel: 'amora',
      significa: 'Dijo Rav Najmán (frecuente para psak)',
      explica: 'Rav Najmán es famoso por su autoridad en psak. Sus declaraciones frecuentemente cierran sugiot.'
    }
  ];

  /* ----- Búsquedas ----- */

  function detectarEnTexto(textoHebreo) {
    if (!textoHebreo) return [];
    const resultados = [];
    PATRONES.forEach(p => {
      const matches = [...textoHebreo.matchAll(p.regex)];
      if (matches.length > 0) {
        resultados.push({
          ...p,
          count: matches.length,
          posiciones: matches.map(m => m.index)
        });
      }
    });
    return resultados.sort((a, b) => b.count - a.count);
  }

  function agruparPorTipo(detecciones) {
    const grupos = {};
    detecciones.forEach(d => {
      if (!grupos[d.tipo]) {
        grupos[d.tipo] = {
          tipo: d.tipo,
          info: CATEGORIAS[d.tipo],
          patrones: [],
          totalCount: 0
        };
      }
      grupos[d.tipo].patrones.push(d);
      grupos[d.tipo].totalCount += d.count;
    });
    return Object.values(grupos).sort((a, b) => b.totalCount - a.totalCount);
  }

  function estadisticasGenerales(detecciones) {
    const total = detecciones.reduce((acc, d) => acc + d.count, 0);
    const porNivel = { tana: 0, amora: 0, stam: 0, general: 0 };
    detecciones.forEach(d => {
      porNivel[d.nivel] = (porNivel[d.nivel] || 0) + d.count;
    });
    return {
      totalMarcadores: total,
      patronesDistintos: detecciones.length,
      porNivel,
      tipoDominante: detecciones[0]?.tipo || null
    };
  }

  return {
    CATEGORIAS,
    PATRONES,
    detectarEnTexto,
    agruparPorTipo,
    estadisticasGenerales
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TalmudTerminology;
}
