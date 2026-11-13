(function () {
  'use strict';

  const C = window.CalculosPromocao;
  const $ = id => document.getElementById(id);

  const dataReferenciaEl = $('dataReferencia');
  const graduacaoEl = $('graduacao');
  const promocaoEl = $('promocaoPretendida');
  const dataInclusaoEl = $('dataInclusao');
  const tabelaBody = document.querySelector('#tabelaDeducoes tbody');
  const criteriosContainer = $('criteriosComplementares');
  const resultadoEl = $('resultado');
  const statusBadgeEl = $('statusBadge');
  const resumoResultadoEl = $('resumoResultado');
  const avisosResultadoEl = $('avisosResultado');
  const textoRelatorioEl = $('textoRelatorio');
  const mensagemErroEl = $('mensagemErro');
  const copiarStatusEl = $('copiarStatus');

  const TIPOS_DEDUCAO = [
    'Condenação transitada em julgado',
    'Exclusão',
    'Deserção',
    'Licença para tratar interesse particular',
    'Ultrapassar 1 ano de lic. para tratar pessoa da família',
    'Perda da graduação',
    'Outros'
  ];

  const CRITERIOS = [
    { id: 'inatividade', texto: 'O militar está na inatividade?', motivo: 'o militar encontra-se na inatividade' },
    { id: 'excluido', texto: 'O militar se encontra excluído da Corporação?', motivo: 'o militar encontra-se excluído da Corporação' },
    { id: 'lei4816', texto: 'O militar possui a promoção pela Lei nº 4.816/1986 válida?', motivo: 'há registro de promoção válida pela Lei nº 4.816/1986' },
    { id: 'comportamento', texto: 'O militar se encontra em um comportamento inferior ao bom?', motivo: 'o militar encontra-se em comportamento inferior ao bom' },
    { id: 'licencaSemVencimento', texto: 'O militar se encontra em gozo de licença sem vencimento?', motivo: 'o militar encontra-se em gozo de licença sem vencimento' },
    { id: 'prisao', texto: 'O militar se encontra em situação de prisão?', motivo: 'o militar encontra-se em situação de prisão' }
  ];

  function escapeHTML(valor) {
    return String(valor ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function obterReferencia(prefixo) {
    return {
      boletim: $(`${prefixo}Bol`)?.value.trim() || '',
      unidade: $(`${prefixo}Unidade`)?.value.trim() || '',
      data: $(`${prefixo}DataPub`)?.value || ''
    };
  }

  function formatarReferencia(ref) {
    const partes = [];
    if (ref.boletim) partes.push(ref.boletim);
    if (ref.unidade) partes.push(`Unidade: ${ref.unidade}`);
    if (ref.data) partes.push(`publicação em ${C.formatarDataBR(ref.data)}`);
    return partes.length ? partes.join(', ') : 'sem referência de boletim informada';
  }

  function referenciaTemBoletim(ref) {
    return Boolean(ref && ref.boletim && ref.boletim.trim());
  }

  function criarLinhaDeducao(dados = {}) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <select class="tipo-deducao" aria-label="Tipo de dedução">
          <option value="" disabled ${dados.tipo ? '' : 'selected'}>Selecione</option>
          ${TIPOS_DEDUCAO.map(tipo => `<option value="${escapeHTML(tipo)}" ${dados.tipo === tipo ? 'selected' : ''}>${escapeHTML(tipo)}</option>`).join('')}
        </select>
        <div class="outro-wrap" ${dados.tipo === 'Outros' ? '' : 'hidden'}>
          <input class="tipo-outro" type="text" placeholder="Descreva a dedução" value="${escapeHTML(dados.tipoOutro || '')}" aria-label="Descrição de outra dedução" />
        </div>
      </td>
      <td><input class="ded-inicio" type="date" max="${dataReferenciaEl.value}" value="${escapeHTML(dados.inicio || '')}" aria-label="Data inicial da dedução" /></td>
      <td><input class="ded-fim" type="date" max="${dataReferenciaEl.value}" value="${escapeHTML(dados.fim || '')}" aria-label="Data final da dedução" /></td>
      <td><span class="dias-cell">0</span></td>
      <td><input class="ded-bol-inicio" type="text" placeholder="Bol PM nº ..." value="${escapeHTML(dados.boletimInicio || '')}" aria-label="Boletim" /></td>
      <td><input class="ded-unidade-inicio" type="text" placeholder="Unidade" value="${escapeHTML(dados.unidadeInicio || '')}" aria-label="Unidade" /></td>
      <td><input class="ded-data-pub-inicio" type="date" max="${dataReferenciaEl.value}" value="${escapeHTML(dados.dataPublicacaoInicio || '')}" aria-label="Data de publicação" /></td>
      <td><input class="ded-bol-fim" type="text" placeholder="Bol PM nº ..." value="${escapeHTML(dados.boletimFim || '')}" aria-label="Boletim" /></td>
      <td><input class="ded-unidade-fim" type="text" placeholder="Unidade" value="${escapeHTML(dados.unidadeFim || '')}" aria-label="Unidade" /></td>
      <td><input class="ded-data-pub-fim" type="date" max="${dataReferenciaEl.value}" value="${escapeHTML(dados.dataPublicacaoFim || '')}" aria-label="Data de publicação" /></td>
      <td><button type="button" class="btn btn-danger-small remover-deducao">Remover</button></td>
    `;

    const tipo = tr.querySelector('.tipo-deducao');
    const outroWrap = tr.querySelector('.outro-wrap');
    tipo.addEventListener('change', () => {
      outroWrap.hidden = tipo.value !== 'Outros';
      if (tipo.value !== 'Outros') tr.querySelector('.tipo-outro').value = '';
    });

    tr.querySelector('.remover-deducao').addEventListener('click', () => {
      tr.remove();

      if (!tabelaBody.querySelector('tr')) {
        criarLinhaDeducao();
      }

      invalidarResultado();
    });

    const atualizarDiasLinha = () => {
      const inicio = tr.querySelector('.ded-inicio').value;
      const fim = tr.querySelector('.ded-fim').value;
      let dias = 0;
      if (inicio && fim && C.parseISOData(inicio) && C.parseISOData(fim)) {
        dias = C.diasEntreInclusivo(inicio, fim);
      }
      tr.querySelector('.dias-cell').textContent = dias > 0 ? String(dias) : '0';
    };

    tr.querySelector('.ded-inicio').addEventListener('change', atualizarDiasLinha);
    tr.querySelector('.ded-fim').addEventListener('change', atualizarDiasLinha);
    tabelaBody.appendChild(tr);
    atualizarDiasLinha();
  }

  function atualizarLimitesDatas() {

    const dataLimite = dataReferenciaEl.value;
    const camposLimpados = [];

    // Busca todos os campos de data do formulário
    document.querySelectorAll('main input[type="date"]')
      .forEach(campo => {

        // Atualiza a data máxima permitida
        campo.max = dataLimite;

        // Verifica se já existe data superior ao limite
        if (campo.value && campo.value > dataLimite) {

          limparDataForaLimite(campo);
          camposLimpados.push(campo);

        }
      });

    // Emite um único alerta caso existam datas inválidas
    if (camposLimpados.length > 0) {

      alert(
       `A data de referência foi alterada para ` +
       `${C.formatarDataBR(dataLimite)}.\n\n` +
        `${camposLimpados.length} campo(s) continha(m) datas ` +
        `superiores à nova referência e foram limpos.`
      );

      camposLimpados[0].focus();
    }
  }

  function renderizarCriterios() {
    criteriosContainer.innerHTML = '';
    CRITERIOS.forEach(criterio => {
      const item = document.createElement('div');
      item.className = 'criterio-item';
      item.dataset.criterioId = criterio.id;
      item.innerHTML = `
        <div class="criterio-top">
          <div class="criterio-pergunta">${escapeHTML(criterio.texto)}</div>
          <div class="radio-group" role="radiogroup" aria-label="${escapeHTML(criterio.texto)}">
            <label class="radio-option"><input type="radio" name="crit-${criterio.id}" value="nao" checked /> Não</label>
            <label class="radio-option"><input type="radio" name="crit-${criterio.id}" value="sim" /> Sim</label>
          </div>
        </div>
        <details class="reference-box criterio-reference">
          <summary>Referência de boletim (opcional)</summary>
          <div class="form-grid reference-fields">
            <div class="field">
              <label for="crit-${criterio.id}-bol">Nº/identificação do boletim</label>
              <input id="crit-${criterio.id}-bol" class="crit-bol" type="text" placeholder="Ex.: Bol PM nº 123/2026" />
            </div>
            <div class="field">
              <label for="crit-${criterio.id}-unidade">Unidade</label>
              <input id="crit-${criterio.id}-unidade" class="crit-unidade" type="text" placeholder="Unidade" />
            </div>
            <div class="field">
              <label for="crit-${criterio.id}-data">Data de publicação</label>
              <input id="crit-${criterio.id}-data" max="${dataReferenciaEl.value}" class="crit-data" type="date" />
            </div>
          </div>
        </details>
      `;

      item.querySelectorAll(`input[name="crit-${criterio.id}"]`).forEach(radio => {
        radio.addEventListener('change', () => {
          const sim = item.querySelector(`input[name="crit-${criterio.id}"]:checked`).value === 'sim';
          item.classList.toggle('is-sim', sim);
          if (sim) item.querySelector('details').open = true;
        });
      });
      criteriosContainer.appendChild(item);
    });
  }

  function lerDeducoes() {
    return Array.from(tabelaBody.querySelectorAll('tr')).map(tr => {
      const tipoBase = tr.querySelector('.tipo-deducao').value;
      const tipoOutro = tr.querySelector('.tipo-outro').value.trim();
      const tipo = tipoBase === 'Outros' && tipoOutro ? `Outros - ${tipoOutro}` : tipoBase;
      return {
        tipo,
        tipoBase,
        tipoOutro,
        inicio: tr.querySelector('.ded-inicio').value,
        fim: tr.querySelector('.ded-fim').value,
        
        boletimInicio: tr.querySelector('.ded-bol-inicio').value.trim(),
        unidadeInicio: tr.querySelector('.ded-unidade-inicio').value.trim(),
        dataPublicacaoInicio: tr.querySelector('.ded-data-pub-inicio').value,

        boletimFim: tr.querySelector('.ded-bol-fim').value.trim(),
        unidadeFim: tr.querySelector('.ded-unidade-fim').value.trim(),
        dataPublicacaoFim: tr.querySelector('.ded-data-pub-fim').value
      };
    }).filter(d => d.tipo || d.inicio || d.fim || d.boletimInicio || d.unidadeInicio || d.dataPublicacaoInicio || d.boletimFim || d.unidadeFim || d.dataPublicacaoFim);
  }

  function lerCriterios() {
    return CRITERIOS.map(criterio => {
      const item = criteriosContainer.querySelector(`[data-criterio-id="${criterio.id}"]`);
      const resposta = item.querySelector(`input[name="crit-${criterio.id}"]:checked`).value;
      return {
        ...criterio,
        resposta,
        referencia: {
          boletim: item.querySelector('.crit-bol').value.trim(),
          unidade: item.querySelector('.crit-unidade').value.trim(),
          data: item.querySelector('.crit-data').value
        }
      };
    });
  }

  function mostrarErro(mensagem) {
    mensagemErroEl.textContent = mensagem;
    mensagemErroEl.hidden = false;
    mensagemErroEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function limparErro() {
    mensagemErroEl.hidden = true;
    mensagemErroEl.textContent = '';
  }

  function limparDataForaLimite(campo) {

  // Apaga a data inválida
  campo.value = '';

  // Se for uma data de dedução, zera os dias exibidos
  if (campo.matches('.ded-inicio, .ded-fim')) {
    const linha = campo.closest('tr');
    if (linha) {
      linha.querySelector('.dias-cell').textContent = '0';
    }
  }

  // Invalida eventual avaliação anterior
  resultadoEl.hidden = true;
  textoRelatorioEl.value = '';
  copiarStatusEl.textContent = '';
  }

  function validarDados(graduacao, dataInclusao, deducoes) {
    if (!graduacao) return 'Selecione a graduação atual do militar.';
    if (!dataInclusao) return 'Informe a data de inclusão do militar.';
    const inclusao = C.parseISOData(dataInclusao);
    const referencia = C.parseISOData(dataReferenciaEl.value);
    if (!inclusao) return 'A data de inclusão informada é inválida.';
    if (inclusao.ms > referencia.ms) return `A data de inclusão não pode ser posterior a ${C.formatarDataBR(dataReferenciaEl.value)}.`;

    for (let i = 0; i < deducoes.length; i += 1) {
      const d = deducoes[i];
      if (!d.tipo) return `Selecione o tipo da dedução na linha ${i + 1}.`;
      if (d.tipoBase === 'Outros' && !d.tipoOutro) return `Descreva a dedução marcada como “Outros” na linha ${i + 1}.`;
      if (!d.inicio || !d.fim) return `Informe as datas de início e fim da dedução na linha ${i + 1}.`;
      const ini = C.parseISOData(d.inicio);
      const fim = C.parseISOData(d.fim);
      if (!ini || !fim || ini.ms > fim.ms) return `O período da dedução na linha ${i + 1} é inválido.`;
    }
    return '';
  }

  function formatarDias(total) {
    return `${total.toLocaleString('pt-BR')} ${total === 1 ? 'dia' : 'dias'} (${C.tempoExtenso(total)})`;
  }

  function montarReferenciaDeducao(d) {

    const inicio = formatarReferencia({
      boletim: d.boletimInicio,
      unidade: d.unidadeInicio,
      data: d.dataPublicacaoInicio
    });

    const fim = formatarReferencia({
      boletim: d.boletimFim,
      unidade: d.unidadeFim,
      data: d.dataPublicacaoFim
    });

    return `Início: ${inicio}; término: ${fim}`;
  }

  function construirTextoRelatorio(ctx) {
    const linhas = [];
    const { regra, tempo, avaliacaoTempo, criterios, apto, refInclusao, refGraduacao, pendenciasReferencia } = ctx;

    linhas.push('ANÁLISE DE PROMOÇÃO - LEI Nº 14.189/2025');
    linhas.push(`Data de referência da avaliação: ${C.formatarDataBR(dataReferenciaEl.value)}.`);
    linhas.push(`Graduação atual: ${regra.graduacao}. Promoção analisada: ${regra.destino}.`);
    linhas.push('');
    linhas.push(`Tempo bruto contado da inclusão (${C.formatarDataBR(dataInclusaoEl.value)}) até ${C.formatarDataBR(dataReferenciaEl.value)}: ${tempo.diasBrutos.toLocaleString('pt-BR')} dias.`);
    linhas.push(`Deduções computadas: ${tempo.deducoesDias.toLocaleString('pt-BR')} dias.`);
    linhas.push(`Tempo de efetivo serviço apurado até ${C.formatarDataBR(dataReferenciaEl.value)}: ${formatarDias(tempo.efetivoDias)}.`);
    linhas.push(`Tempo mínimo aplicado à promoção para ${regra.destino}: ${formatarDias(regra.minimoDias)} (${regra.descricao}).`);
    linhas.push(`Referência da inclusão: ${formatarReferencia(refInclusao)}.`);
    linhas.push(`Referência da graduação atual: ${formatarReferencia(refGraduacao)}.`);

    if (tempo.linhas.filter(x => x.dias > 0).length) {
      linhas.push('Deduções consideradas no cálculo:');

      tempo.linhas.filter(x => x.dias > 0).forEach((d, idx) => {

        // Datas originais informadas pelo usuário
        const inicioOriginal = d.inicio;
        const fimOriginal = d.fim;

        // Datas efetivamente consideradas no cálculo
        const inicioComputado = d.recortado.inicioISO;
        const fimComputado = d.recortado.fimISO;

        linhas.push(
          `${idx + 1}. ${d.tipo || 'Dedução'} - ` +
          `Período informado: ${C.formatarDataBR(inicioOriginal)} a ${C.formatarDataBR(fimOriginal)}. ` +
          `Período computado: ${C.formatarDataBR(inicioComputado)} a ${C.formatarDataBR(fimComputado)}. ` +
          `Total: ${d.dias} dias; referência: ${montarReferenciaDeducao(d)}.`
        );

      });
    }

    linhas.push('');
    if (apto) {
      linhas.push(`RESULTADO: APTO À PROMOÇÃO À GRADUAÇÃO DE ${regra.destino.toUpperCase()}, considerando exclusivamente os dados inseridos nesta ferramenta. O requisito temporal foi atingido e todos os critérios complementares foram informados como “Não”.`);
    } else {
      linhas.push(`RESULTADO: INAPTO À PROMOÇÃO À GRADUAÇÃO DE ${regra.destino.toUpperCase()}, considerando os dados inseridos nesta ferramenta.`);
      linhas.push('Motivos da inaptidão:');
      let numero = 1;
      if (!avaliacaoTempo.aptoTempo) {
        linhas.push(`${numero}. O militar não atingirá, até ${C.formatarDataBR(dataReferenciaEl.value)}, o tempo mínimo configurado para a promoção. Tempo apurado: ${tempo.efetivoDias.toLocaleString('pt-BR')} dias; mínimo: ${regra.minimoDias.toLocaleString('pt-BR')} dias; faltam ${avaliacaoTempo.faltamDias.toLocaleString('pt-BR')} dias.`);
        numero += 1;
      }
      criterios.filter(c => c.resposta === 'sim').forEach(c => {
        linhas.push(`${numero}. ${c.motivo.charAt(0).toUpperCase() + c.motivo.slice(1)}. Referência: ${formatarReferencia(c.referencia)}.`);
        numero += 1;
      });

      linhas.push('');
      linhas.push('Solicita-se que as informações que fundamentaram a inaptidão sejam reanalisadas pela Comissão de Promoção de Praças e pela Assessoria Jurídica Militar antes da conclusão do procedimento de promoção.');

      if (pendenciasReferencia.length) {
        linhas.push('');
        linhas.push('PENDÊNCIA DE REFERÊNCIA: há informação utilizada para fundamentar a inaptidão sem o respectivo boletim de referência. Inserir a referência de boletim para:');
        pendenciasReferencia.forEach((p, idx) => linhas.push(`${idx + 1}. ${p}.`));
      }
    }

    if (tempo.houveSobreposicao) {
      linhas.push('');
      linhas.push('Observação técnica: foram identificados períodos de dedução sobrepostos. O total de deduções foi consolidado por dias únicos, evitando dupla contagem do mesmo dia.');
    }

    linhas.push('');
    linhas.push('Observação: resultado automatizado de apoio administrativo, sujeito à conferência do histórico funcional, dos boletins e da legislação aplicável pela autoridade competente.');
    return linhas.join('\n');
  }

  function renderizarResultado(ctx) {
    const { apto, regra, tempo, avaliacaoTempo, criterios, pendenciasReferencia } = ctx;
    resultadoEl.hidden = false;
    resultadoEl.classList.toggle('status-apto', apto);
    resultadoEl.classList.toggle('status-inapto', !apto);
    statusBadgeEl.textContent = apto ? 'APTO' : 'INAPTO';
    statusBadgeEl.className = `status-badge ${apto ? 'apto' : 'inapto'}`;

    const diferencaTexto = avaliacaoTempo.aptoTempo
      ? `${avaliacaoTempo.excedeDias.toLocaleString('pt-BR')} dias acima do mínimo`
      : `faltam ${avaliacaoTempo.faltamDias.toLocaleString('pt-BR')} dias`;

    resumoResultadoEl.innerHTML = `
      <div class="resumo-item"><span>Promoção analisada</span><strong>${escapeHTML(regra.graduacao)} → ${escapeHTML(regra.destino)}</strong></div>
      <div class="resumo-item"><span>Tempo bruto</span><strong>${tempo.diasBrutos.toLocaleString('pt-BR')} dias</strong></div>
      <div class="resumo-item"><span>Total de deduções</span><strong>${tempo.deducoesDias.toLocaleString('pt-BR')} dias</strong></div>
      <div class="resumo-item"><span>Efetivo serviço em ${C.formatarDataBR(dataReferenciaEl.value)}</span><strong>${tempo.efetivoDias.toLocaleString('pt-BR')} dias</strong></div>
      <div class="resumo-item"><span>Conversão do efetivo serviço</span><strong>${escapeHTML(C.tempoExtenso(tempo.efetivoDias))}</strong></div>
      <div class="resumo-item"><span>Tempo mínimo</span><strong>${regra.minimoDias.toLocaleString('pt-BR')} dias</strong></div>
      <div class="resumo-item"><span>Comparação temporal</span><strong>${escapeHTML(diferencaTexto)}</strong></div>
      <div class="resumo-item"><span>Critérios “Sim”</span><strong>${criterios.filter(c => c.resposta === 'sim').length}</strong></div>
    `;

    avisosResultadoEl.innerHTML = '';
    if (!apto) {
      const motivos = [];
      if (!avaliacaoTempo.aptoTempo) motivos.push(`Tempo insuficiente: faltam ${avaliacaoTempo.faltamDias.toLocaleString('pt-BR')} dias para o requisito temporal.`);
      criterios.filter(c => c.resposta === 'sim').forEach(c => motivos.push(c.motivo.charAt(0).toUpperCase() + c.motivo.slice(1) + '.'));
      const div = document.createElement('div');
      div.className = 'alert alert-error';
      div.innerHTML = `<strong>Motivo(s) da inaptidão:</strong><br>${motivos.map(m => `• ${escapeHTML(m)}`).join('<br>')}`;
      avisosResultadoEl.appendChild(div);
    }

    if (pendenciasReferencia.length) {
      const div = document.createElement('div');
      div.className = 'alert alert-warning';
      div.innerHTML = `<strong>Referência de boletim pendente:</strong> insira o boletim de referência para completar o texto da inaptidão: ${pendenciasReferencia.map(escapeHTML).join('; ')}.`;
      avisosResultadoEl.appendChild(div);
    }

    if (tempo.houveSobreposicao) {
      const div = document.createElement('div');
      div.className = 'alert alert-info';
      div.textContent = 'Foram encontrados períodos de dedução sobrepostos. A ferramenta contabilizou cada dia apenas uma vez.';
      avisosResultadoEl.appendChild(div);
    }

    textoRelatorioEl.value = construirTextoRelatorio(ctx);
    copiarStatusEl.textContent = '';

    setTimeout(() => resultadoEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }

  function analisar() {
    
    resultadoEl.hidden = true;
    textoRelatorioEl.value = '';
    copiarStatusEl.textContent = '';

    limparErro();

    const campoInvalido = Array.from(
      document.querySelectorAll('main input[type="date"]')
    ).find(campo =>
        campo.value && campo.value > dataReferenciaEl.value
      );

    if (campoInvalido) {

      limparDataForaLimite(campoInvalido);

      alert(
        `Foi identificada uma data superior à referência ` +
        `${C.formatarDataBR(dataReferenciaEl.value)}. ` +
        `O campo foi limpo.`
      );

      campoInvalido.focus();
      return;
    }

    const graduacao = graduacaoEl.value;
    const dataInclusao = dataInclusaoEl.value;
    const deducoes = lerDeducoes();
    const erro = validarDados(graduacao, dataInclusao, deducoes);
    if (erro) {
      mostrarErro(erro);
      return;
    }

    let tempo;
    try {
      tempo = C.calcularTempoEfetivo(dataInclusao, deducoes, dataReferenciaEl.value);
    } catch (e) {
      mostrarErro(e.message || 'Não foi possível calcular o tempo de efetivo serviço.');
      return;
    }

    const erroLinha = tempo.linhas.find(x => x.erro);
    if (erroLinha) {
      mostrarErro(erroLinha.erro);
      return;
    }

    const avaliacaoTempo = C.avaliarTempo(graduacao, tempo.efetivoDias);
    const regra = avaliacaoTempo.regra;
    const criterios = lerCriterios();
    const impedimentos = criterios.filter(c => c.resposta === 'sim');
    const apto = avaliacaoTempo.aptoTempo && impedimentos.length === 0;
    const refInclusao = obterReferencia('inclusao');
    const refGraduacao = obterReferencia('graduacao');
    const pendenciasReferencia = [];

    if (!apto && !avaliacaoTempo.aptoTempo) {
      if (!referenciaTemBoletim(refInclusao)) pendenciasReferencia.push('data de inclusão');
      if (!referenciaTemBoletim(refGraduacao)) pendenciasReferencia.push('graduação atual');
      tempo.linhas.filter(x => x.dias > 0).forEach((d, idx) => {
        if (!d.boletimInicio) {
          pendenciasReferencia.push(
            `boletim de início da dedução ${idx + 1} (${d.tipo})`
          );
        }

        if (!d.boletimFim) {
          pendenciasReferencia.push(
            `boletim de término da dedução ${idx + 1} (${d.tipo})`
          );
        }
      });
    }

    impedimentos.forEach(c => {
      if (!referenciaTemBoletim(c.referencia)) pendenciasReferencia.push(c.texto.replace(/\?$/, ''));
    });

    renderizarResultado({
      apto,
      regra,
      tempo,
      avaliacaoTempo,
      criterios,
      refInclusao,
      refGraduacao,
      pendenciasReferencia,
      dataReferenciaISO: dataReferenciaEl.value
    });
  }

  async function copiarTexto() {
    const texto = textoRelatorioEl.value;
    if (!texto) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(texto);
      } else {
        textoRelatorioEl.focus();
        textoRelatorioEl.select();
        document.execCommand('copy');
        window.getSelection()?.removeAllRanges();
      }
      copiarStatusEl.textContent = 'Texto copiado para a área de transferência.';
    } catch (_) {
      copiarStatusEl.textContent = 'Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.';
    }
  }

  function limparTudo() {
    graduacaoEl.value = '';
    promocaoEl.value = 'Selecione a graduação atual';
    dataInclusaoEl.value = '';
    ['inclusaoBol', 'inclusaoUnidade', 'inclusaoDataPub', 'graduacaoBol', 'graduacaoUnidade', 'graduacaoDataPub'].forEach(id => { $(id).value = ''; });

    document.querySelectorAll('.reference-box').forEach(d => { d.open = false; });
    tabelaBody.innerHTML = '';
    criarLinhaDeducao();

    renderizarCriterios();
    resultadoEl.hidden = true;
    resultadoEl.classList.remove('status-apto', 'status-inapto');
    textoRelatorioEl.value = '';
    copiarStatusEl.textContent = '';
    limparErro();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function invalidarResultado() {
    resultadoEl.hidden = true;
    textoRelatorioEl.value = '';
    copiarStatusEl.textContent = '';
  }

  document.querySelector('main').addEventListener(
    'input',
    invalidarResultado
  );

  document.querySelector('main').addEventListener(
    'change',
    invalidarResultado
  );

  function atualizarReferencia() {

    atualizarLimitesDatas();

    document.body.classList.toggle(
      'referencia-dezembro',
      dataReferenciaEl.value === '2026-12-14'
    );

    resultadoEl.hidden = true;
    textoRelatorioEl.value = '';
    copiarStatusEl.textContent = '';
    limparErro();
  }

  dataReferenciaEl.addEventListener(
    'change',
    atualizarReferencia
  );

  graduacaoEl.addEventListener('change', () => {
    const regra = C.REGRAS_PROMOCAO[graduacaoEl.value];
    promocaoEl.value = regra ? regra.destino : 'Selecione a graduação atual';
  });

  $('addDeducao').addEventListener('click', () => {
    criarLinhaDeducao();
    invalidarResultado();
  });

  $('analisar').addEventListener('click', analisar);
  $('limpar').addEventListener('click', limparTudo);
  $('copiar').addEventListener('click', copiarTexto);

  renderizarCriterios();
  criarLinhaDeducao();
  atualizarReferencia();

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('load', () => window.scrollTo(0, 0)
  );

  document.querySelector('main').addEventListener('change', (event) => {

    const campo = event.target;

    // Verifica se o elemento alterado é um campo de data
    if (!campo.matches('input[type="date"]')) return;

    const dataInformada = campo.value;
    const dataLimite = dataReferenciaEl.value;

    // Se não houver data ou ela estiver dentro do limite, não faz nada
    if (!dataInformada || dataInformada <= dataLimite) return;

    // Data posterior à referência: limpa o campo
    limparDataForaLimite(campo);

    // Informa o motivo ao usuário
    alert(
      `A data informada não pode ser superior à data de referência ` +
      `(${C.formatarDataBR(dataLimite)}).\n\n` +
      `O campo foi limpo. Informe uma data válida.`
    );

    // Retorna o foco para o campo corrigido
    campo.focus();
  });

})();
