(function (global) {
  'use strict';

  const MS_DIA = 24 * 60 * 60 * 1000;
  const DIAS_ANO = 365;
  const DIAS_MES = 30.41;
  const DATA_REFERENCIA_ISO = '2026-11-14';

  const REGRAS_PROMOCAO = Object.freeze({
    soldado: Object.freeze({
      graduacao: 'Soldado',
      destino: 'Cabo',
      minimoDias: (7 * DIAS_ANO) + 1,
      descricao: 'tempo superior a 7 anos de efetivo serviço'
    }),
    cabo: Object.freeze({
      graduacao: 'Cabo',
      destino: '3º Sargento',
      minimoDias: (14 * DIAS_ANO) + 1,
      descricao: 'tempo superior a 14 anos de efetivo serviço'
    }),
    '3sgt': Object.freeze({
      graduacao: '3º Sargento',
      destino: '2º Sargento',
      minimoDias: (21 * DIAS_ANO) + 1,
      descricao: 'tempo superior a 21 anos de efetivo serviço'
    }),
    '2sgt': Object.freeze({
      graduacao: '2º Sargento',
      destino: '1º Sargento',
      minimoDias: 28 * DIAS_ANO,
      descricao: '28 anos de efetivo serviço'
    })
  });

  function parseISOData(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return null;
    const [ano, mes, dia] = iso.split('-').map(Number);
    const ms = Date.UTC(ano, mes - 1, dia);
    const d = new Date(ms);
    if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return null;
    return { ano, mes, dia, ms, iso };
  }

  function isoDeMs(ms) {
    const d = new Date(ms);
    const ano = d.getUTCFullYear();
    const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dia = String(d.getUTCDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  function formatarDataBR(iso) {
    const d = parseISOData(iso);
    if (!d) return '-';
    return `${String(d.dia).padStart(2, '0')}/${String(d.mes).padStart(2, '0')}/${d.ano}`;
  }

  function diasEntreInclusivo(inicioISO, fimISO) {
    const inicio = parseISOData(inicioISO);
    const fim = parseISOData(fimISO);
    if (!inicio || !fim || fim.ms < inicio.ms) return 0;
    return Math.floor((fim.ms - inicio.ms) / MS_DIA) + 1;
  }

  function converterDias(totalDias) {
    const total = Math.max(0, Math.floor(Number(totalDias) || 0));
    const anos = Math.floor(total / DIAS_ANO);
    const rem = total - (anos * DIAS_ANO);
    const meses = Math.floor(rem / DIAS_MES);
    const dias = Math.floor(rem - (meses * DIAS_MES));
    return { anos, meses, dias };
  }

  function plural(valor, singular, pluralForm) {
    return `${valor} ${valor === 1 ? singular : pluralForm}`;
  }

  function tempoExtenso(totalDias) {
    const c = converterDias(totalDias);
    return `${plural(c.anos, 'ano', 'anos')}, ${plural(c.meses, 'mês', 'meses')} e ${plural(c.dias, 'dia', 'dias')}`;
  }

  function normalizarIntervalo(inicioISO, fimISO, limiteInicialISO, limiteFinalISO) {
    const inicio = parseISOData(inicioISO);
    const fim = parseISOData(fimISO);
    const limiteInicial = parseISOData(limiteInicialISO);
    const limiteFinal = parseISOData(limiteFinalISO);
    if (!inicio || !fim || !limiteInicial || !limiteFinal || inicio.ms > fim.ms) return null;

    const a = Math.max(inicio.ms, limiteInicial.ms);
    const b = Math.min(fim.ms, limiteFinal.ms);
    if (a > b) return null;
    return { inicioMs: a, fimMs: b, inicioISO: isoDeMs(a), fimISO: isoDeMs(b) };
  }

  function consolidarIntervalos(intervalos) {
    const validos = intervalos
      .filter(Boolean)
      .map(x => ({ inicioMs: x.inicioMs, fimMs: x.fimMs }))
      .sort((a, b) => a.inicioMs - b.inicioMs || a.fimMs - b.fimMs);

    if (!validos.length) return { intervalos: [], totalDias: 0, houveSobreposicao: false };

    const consolidados = [];
    let houveSobreposicao = false;
    let atual = { ...validos[0] };

    for (let i = 1; i < validos.length; i += 1) {
      const prox = validos[i];
      if (prox.inicioMs <= atual.fimMs) {
        houveSobreposicao = true;
        atual.fimMs = Math.max(atual.fimMs, prox.fimMs);
      } else if (prox.inicioMs === atual.fimMs + MS_DIA) {
        atual.fimMs = prox.fimMs;
      } else {
        consolidados.push(atual);
        atual = { ...prox };
      }
    }
    consolidados.push(atual);

    const totalDias = consolidados.reduce((soma, x) => soma + Math.floor((x.fimMs - x.inicioMs) / MS_DIA) + 1, 0);
    return { intervalos: consolidados, totalDias, houveSobreposicao };
  }

  function calcularTempoEfetivo(dataInclusaoISO, deducoes, dataReferenciaISO = DATA_REFERENCIA_ISO) {
    const inclusao = parseISOData(dataInclusaoISO);
    const referencia = parseISOData(dataReferenciaISO);
    if (!inclusao || !referencia) throw new Error('Data de inclusão ou de referência inválida.');
    if (inclusao.ms > referencia.ms) throw new Error('A data de inclusão não pode ser posterior à data de referência.');

    const diasBrutos = diasEntreInclusivo(dataInclusaoISO, dataReferenciaISO);
    const intervalos = [];
    const linhas = [];

    (deducoes || []).forEach((deducao, idx) => {
      if (!deducao.inicio && !deducao.fim && !deducao.tipo) return;
      if (!deducao.inicio || !deducao.fim) {
        linhas.push({ ...deducao, indice: idx, dias: 0, erro: 'Informe início e fim do período de dedução.' });
        return;
      }
      const ini = parseISOData(deducao.inicio);
      const fim = parseISOData(deducao.fim);
      if (!ini || !fim || ini.ms > fim.ms) {
        linhas.push({ ...deducao, indice: idx, dias: 0, erro: 'Período de dedução inválido.' });
        return;
      }

      const recortado = normalizarIntervalo(deducao.inicio, deducao.fim, dataInclusaoISO, dataReferenciaISO);
      const dias = recortado ? diasEntreInclusivo(recortado.inicioISO, recortado.fimISO) : 0;
      linhas.push({ ...deducao, indice: idx, dias, recortado, erro: null });
      if (recortado) intervalos.push(recortado);
    });

    const consolidados = consolidarIntervalos(intervalos);
    const deducoesDias = consolidados.totalDias;
    const efetivoDias = Math.max(0, diasBrutos - deducoesDias);

    return {
      diasBrutos,
      deducoesDias,
      efetivoDias,
      linhas,
      houveSobreposicao: consolidados.houveSobreposicao
    };
  }

  function avaliarTempo(graduacaoKey, efetivoDias) {
    const regra = REGRAS_PROMOCAO[graduacaoKey];
    if (!regra) throw new Error('Graduação não suportada.');
    const aptoTempo = efetivoDias >= regra.minimoDias;
    return {
      regra,
      aptoTempo,
      faltamDias: aptoTempo ? 0 : regra.minimoDias - efetivoDias,
      excedeDias: aptoTempo ? efetivoDias - regra.minimoDias : 0
    };
  }

  global.CalculosPromocao = Object.freeze({
    MS_DIA,
    DIAS_ANO,
    DIAS_MES,
    DATA_REFERENCIA_ISO,
    REGRAS_PROMOCAO,
    parseISOData,
    formatarDataBR,
    diasEntreInclusivo,
    converterDias,
    tempoExtenso,
    normalizarIntervalo,
    consolidarIntervalos,
    calcularTempoEfetivo,
    avaliarTempo
  });
})(window);
