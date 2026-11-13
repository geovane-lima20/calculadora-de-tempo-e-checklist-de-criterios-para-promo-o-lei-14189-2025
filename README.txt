CHECKLIST DE PROMOÇÕES DE PRAÇAS DA PMPB
Lei nº 14.189, de 18 de dezembro de 2025
VERSÃO 1.1 — TESTE 6 | DOCUMENTAÇÃO REVISADA
============================================================

1. FINALIDADE
------------
Ferramenta de apoio administrativo à pré-análise de promoções de praças,
com apuração do tempo de efetivo serviço, deduções, informações
complementares e geração de texto para o relatório do SIGPMPB.

A classificação APTO/INAPTO resulta dos dados cadastrados e dos critérios
configurados no sistema. Não substitui conferência do histórico funcional,
dos boletins ou análise pela Comissão de Promoção de Praças (CPP) e pela
Assessoria Jurídica Militar.

2. INSTALAÇÃO E EXECUÇÃO
-----------------------
A ferramenta funciona localmente no navegador, sem servidor e sem
bibliotecas externas. Mantenha a estrutura de arquivos:

V_1.1/
  index.html
  css/styles.css
  js/calculos.js
  js/app.js
  README.txt

Abra index.html em um navegador atualizado. Os dados são processados
localmente e não são enviados a servidor por esta aplicação. O sistema
não possui persistência automática dos formulários.

3. SELEÇÃO DA DATA DE REFERÊNCIA
-------------------------------
O usuário pode escolher uma destas datas de corte:
- 14/11/2026;
- 14/12/2026 (opção selecionada inicialmente).

A seleção é realizada no cabeçalho. A data escolhida é transmitida pelo
app.js às funções do calculos.js e também utilizada no resumo e no texto
do relatório. O fundo da interface muda discretamente ao selecionar
dezembro, sem alterar o significado visual de APTO/INAPTO.

A alteração da referência invalida o resultado anterior, exigindo nova
análise. O botão Limpar avaliação mantém a data de referência escolhida.

4. DADOS A PREENCHER
-------------------
- Graduação atual: Soldado, Cabo, 3º Sargento ou 2º Sargento.
- Data de inclusão na Corporação.
- Referências opcionais da inclusão e da graduação: boletim, unidade e
  data de publicação.
- Períodos de dedução, quando existentes, com tipo, início e término.
- Referências opcionais da dedução, separadas por ato de início e ato de
  término: boletim, unidade e data de publicação para cada extremidade.
- Seis critérios complementares respondidos com Sim/Não.

5. REGRAS TEMPORAIS CONFIGURADAS
--------------------------------
O sistema compara o total de dias de efetivo serviço com os limites:
- Soldado -> Cabo: mais de 7 anos = 2.556 dias.
- Cabo -> 3º Sargento: mais de 14 anos = 5.111 dias.
- 3º Sargento -> 2º Sargento: mais de 21 anos = 7.666 dias.
- 2º Sargento -> 1º Sargento: 28 anos = 10.220 dias.

Para 2º Sargento, a comparação utiliza >= 10.220 dias, pois quem
ultrapassou 28 anos não deve perder o requisito temporal por excesso de
serviço. A situação funcional e o enquadramento legal permanecem sujeitos
à conferência administrativa e jurídica.

6. CONTAGEM E CONVERSÃO DO TEMPO
--------------------------------
- Tempo bruto: dias corridos da inclusão até a referência selecionada,
  incluindo os dois dias extremos.
- Deduções: os períodos válidos também são contados inclusivamente.
- Deduções sobrepostas são consolidadas para evitar descontar o mesmo
  dia duas vezes.
- Períodos iniciados antes da inclusão são considerados apenas no trecho
  que coincide com o serviço a apurar.
- Tempo efetivo: tempo bruto menos o total consolidado de deduções.
- Conversão administrativa do total líquido:
    anos  = parte inteira de (total / 365);
    resto = total - (anos * 365);
    meses = parte inteira de (resto / 30,41);
    dias  = parte inteira de [resto - (meses * 30,41)].

A conversão usa divisores administrativos fixos, não a quantidade de
meses completos do calendário civil.

7. LIMITAÇÃO DAS DATAS INFORMADAS
---------------------------------
Todos os campos de data do formulário recebem como limite máximo a data
de referência selecionada. Se o usuário informar data posterior a esse
limite, o campo é limpo e um alerta explica a inconsistência.

Ao mudar de dezembro para novembro, os campos que contenham datas além
do novo limite são limpos e um alerta indica quantos foram afetados.
Se uma data inválida pertencer a uma dedução, sua indicação individual de
dias é zerada. Os demais dados cadastrados são preservados.

Nota técnica: as verificações de datas futuras estão implementadas na
interface app.js. O núcleo calculos.js ainda contém a função de recorte
normalizarIntervalo(); chamadas diretas a calcularTempoEfetivo() exigem
validação própria para rejeitar datas futuras, se essa for a política
definitiva de reutilização do núcleo.

8. CRITÉRIOS COMPLEMENTARES
---------------------------
Todos os critérios começam marcados como "Não". Uma resposta "Sim" gera
impedimento operacional no checklist:
- Militar na inatividade.
- Militar excluído da Corporação.
- Promoção válida pela Lei nº 4.816/1986.
- Comportamento inferior ao bom.
- Gozo de licença sem vencimento.
- Situação de prisão.

O item referente à irregularidade da documentação obrigatória foi
retirado na versão 1.1. Esses seis critérios são parâmetros operacionais
do checklist e não constituem, isoladamente, transcrição de uma lista de
impedimentos da Lei nº 14.189/2025.

9. RESULTADO E RELATÓRIO PARA O SIGPMPB
---------------------------------------
O botão "Analisar promoção" confere os dados informados, calcula o tempo
de serviço até a data selecionada e exibe APTO ou INAPTO.

O resumo informa tempo bruto, dias deduzidos, tempo efetivo, conversão
em anos/meses/dias, graduação de destino, mínimo exigido e comparação
com o limite. O relatório reproduz a fundamentação da análise e pode ser
copiado para uso no SIGPMPB.

O relatório discrimina cada dedução considerada, indicando:
- período originalmente informado;
- período efetivamente computado;
- dias individuais do período computado;
- boletins, unidades e publicações do início e do término.

O total líquido consolidado de deduções pode ser menor que a soma dos
dias individuais exibidos, caso existam períodos sobrepostos.

Quando houver inaptidão, o relatório apresenta os motivos, solicita
reanálise pela CPP e pela Assessoria Jurídica Militar e identifica
referências documentais pendentes. Boletins são opcionais para digitação,
mas a ausência de referência usada para fundamentar inaptidão deverá ser
indicada para complementação.

Alterar campos, adicionar ou remover uma dedução ou trocar a data de
referência invalida o relatório anterior; é preciso analisar novamente.
O botão "Limpar avaliação" reinicia os dados do militar e as respostas
complementares para "Não", preservando a referência selecionada.

10. PENDÊNCIAS IDENTIFICADAS NO TESTE 6
---------------------------------------
As validações de datas posteriores à referência estão implementadas tanto na interface (app.js) quanto no núcleo de cálculos (calculos.js). O sistema rejeita períodos de dedução posteriores à data selecionada, impedindo sua utilização no resultado.

11. FONTES E REFERÊNCIAS
------------------------
- Lei nº 14.189, de 18 de dezembro de 2025, que acrescenta parágrafos
  ao art. 1º da Lei nº 12.227/2022.
- Assembleia Legislativa da Paraíba, Diário do Poder Legislativo:
  https://www.al.pb.leg.br/wp-content/uploads/2025/12/DPL-18.12.2025.pdf
- Calculadora/planilha de tempo de serviço fornecida como referência
  para a metodologia de contagem e conversão administrativa.

12. ARQUIVOS DO SISTEMA
-----------------------
- index.html: formulário, seleção da referência e estrutura da página.
- css/styles.css: layout, responsividade e variação discreta de cores.
- js/calculos.js: datas UTC, intervalos, deduções e requisitos temporais.
- js/app.js: interação, validação, critérios, análise e relatório.
- README.txt: instruções e limitações da versão.
