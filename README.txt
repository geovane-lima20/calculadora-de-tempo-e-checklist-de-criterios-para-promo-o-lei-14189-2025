CHECKLIST DE PROMOÇÕES - LEI Nº 14.189/2025 - PMPB
==================================================

1. COMO USAR
------------
Abra o arquivo index.html em um navegador moderno. A ferramenta funciona localmente, sem servidor e sem dependências externas.

Preencha:
- graduação atual;
- data de inclusão;
- referências opcionais da inclusão e da graduação;
- períodos de dedução, se houver;
- critérios complementares (todos começam marcados como “Não”).

Clique em “Analisar promoção”. O resultado informa APTO ou INAPTO e gera texto copiável para o relatório do SIGPMPB.

2. DATA DE REFERÊNCIA
---------------------
A análise é fixa em 14/11/2026, conforme a especificação recebida.

3. REGRAS TEMPORAIS IMPLEMENTADAS
---------------------------------
- Soldado -> Cabo: mais de 7 anos = 7 x 365 + 1 = 2.556 dias.
- Cabo -> 3º Sargento: mais de 14 anos = 14 x 365 + 1 = 5.111 dias.
- 3º Sargento -> 2º Sargento: mais de 21 anos = 21 x 365 + 1 = 7.666 dias.
- 2º Sargento -> 1º Sargento: 28 anos = 28 x 365 = 10.220 dias.

Observação jurídica/técnica: para o 2º Sargento, o código usa “>= 28 anos”, e não igualdade absoluta. Isso evita que um militar com 28 anos e 1 dia seja indevidamente considerado sem requisito temporal, pois o inciso V da Lei nº 14.189/2025 também alcança quem possui tempo superior a 28 anos.

4. MÉTODO DE CONTAGEM
---------------------
- A data de inclusão e a data-limite são contadas de forma inclusiva.
- Exemplo de validação: inclusão em 01/01/2025 -> 31/12/2025 = 365 dias; em 01/01/2026 = 366 dias.
- As deduções também contam início e fim do período.
- Dedução que ultrapasse a janela inclusão -> 14/11/2026 é recortada para essa janela.
- Períodos de dedução sobrepostos são consolidados para não descontar o mesmo dia duas vezes.
- Conversão exibida: 1 ano = 365 dias; 1 mês = 30,41 dias, mantendo o padrão da calculadora de tempo de serviço fornecida.

5. CRITÉRIOS COMPLEMENTARES
---------------------------
A ferramenta considera INAPTO quando qualquer um destes campos estiver marcado como “Sim”:
- militar na inatividade;
- militar excluído da Corporação;
- promoção pela Lei nº 4.816/1986 válida;
- comportamento inferior ao bom;
- licença sem vencimento;
- situação de prisão;
- documentação obrigatória irregular.

Esses critérios foram implementados conforme os parâmetros operacionais fornecidos para a construção do checklist. Eles não aparecem, no texto da Lei nº 14.189/2025, como uma lista autônoma de impedimentos.

6. REFERÊNCIAS DE BOLETIM
-------------------------
Os campos de boletim/unidade/data são opcionais para preenchimento. Porém, se a avaliação resultar INAPTA e um motivo de inaptidão estiver sem nº/identificação de boletim, o resultado exibirá uma pendência pedindo a inserção dessa referência antes do fechamento do texto.

No caso de inaptidão por tempo insuficiente, a ferramenta verifica a existência de boletim para:
- inclusão;
- graduação atual;
- cada dedução efetivamente considerada no cálculo.

7. FONTES
---------
Lei nº 14.189, de 18 de dezembro de 2025 - Assembleia Legislativa do Estado da Paraíba.
Diário do Poder Legislativo, 18/12/2025:
https://www.al.pb.leg.br/wp-content/uploads/2025/12/DPL-18.12.2025.pdf

A calculadora fornecida pelo usuário foi utilizada como referência para:
- contagem inclusiva dos dias;
- dedução inclusiva dos períodos;
- divisor de 365 dias para ano;
- conversão aproximada de mês por 30,41 dias;
- linguagem visual institucional.

8. ARQUIVOS
-----------
index.html
css/styles.css
js/calculos.js
js/app.js
README.txt
