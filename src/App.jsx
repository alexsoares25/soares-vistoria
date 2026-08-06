import React, { useState, useEffect, useCallback, useRef } from "react";

/* ============================================================
   TIPOS DE LAUDO — checklists, campos e termos de cada tipo
   ============================================================ */

const SSMA_SECOES = [
  {
    "nome": "1. Geral (Todos Veículos)",
    "escala": "conforme",
    "itens": [
      "1.01 A documentação do veículo (CRLV) na validade e disponível ?",
      "1.02 Possui sistema de monitoramento de localização e velocidade (telemetria), instalado e em funcionamento? Não aplicável para veículos de aluguel de balcão.",
      "1.03 O motor do veículo e de partida apresentam bom funcionamento?",
      "1.04 Possui assento fixado, regulável e em boas condições?",
      "1.05 Sistema de direção está em boas condições de funcionamento?",
      "1.06 Buzina, volante, embreagem, freios, acelerador e dispositivos de comando estão funcionando?",
      "1.07 Pneus em boas condições (twi - tyre work indication / sulcos > 3 mm profundidade)?",
      "1.08 O veículo possui logotipo da empresa fixado nas laterais?",
      "1.09 Freios de estacionamento em boas condições?",
      "1.10 Limpador e esguicho de água para pára-brisa estão funcionando?",
      "1.11 O estado dos vidros pára-brisas, laterais e traseiros e espelhos retrovisores (interno e externo) proporcionam condição de visibilidade e livres de danos?",
      "1.12 Possui alarme sonoro de ré? Não aplicável para veículos de aluguel de balcão.",
      "1.13 As partes rotativas estão totalmente protegidas?",
      "1.14 Possui maçaneta com trancas/pinos nas portas? Exceto para Ônibus e Microonibus.",
      "1.15 Possui placas (dianteira e traseira) fixadas e com lacre (placa traseira)?",
      "1.15 Possui dispositivos para sinalização (triângulo refletivos, cones)?",
      "1.16 Possui chave de roda, pneu estepe e macaco?",
      "1.17 Todos os sinais luminosos (setas dianteiras e traseiras, luz de freio, luz de marcha à ré, pisca alerta, lanterna traseira e faróis alto e baixo) estão funcionando?",
      "1.18 As condições da lataria são boas?",
      "1.19 Está livre de vazamento de óleo/combustível?",
      "1.20 Luzes indicadoras de painel estão funcionando?",
      "1.21 Encosto de cabeça (ou banco biposto) para todos ocupantes estão disponíveis e em bom estado de conservação?",
      "1.22 Possui iluminação interna e luz de embarque?",
      "1.23 Foi realizado avaliação de emissão de fumaça (padrão RINGELMANN Superfície e Opacímetro subsolo)? Aplicável somente para veículos movidos a diesel.",
      "1.24 O setor e barra de direção estão sem folgas?",
      "1.25 As ponteiras e coifas de proteção dos terminais estão sem avarias?",
      "1.26 A bomba de direção está sem vazamento?",
      "1.27 Os mangotes hidráulicos apresentam boas condições e estão sem oxidações nas conexões ou umidade de óleo?",
      "1.28 As mangas de eixo e os brincos de mola estão sem folga e livre de trincas?",
      "1.29 A coluna de direção está sem folga no suporte?",
      "1.30 Óleo do reservatório está no nível?",
      "1.31 As cuícas de freio estão sem folgas ou oxidação?",
      "1.32 As lonas, discos e pastilhas de freio estão sem avaria ou desgaste excessivo?",
      "1.33 As catracas de freio estão sem avaria e folga no pino?",
      "1.34 O sistema apresenta lubrificação eficaz?",
      "1.35 O veículo está sem vazamentos pneumáticos com o pedal de freio acionado?",
      "1.36 O fluido de freios está entre os níveis indicados?",
      "1.37 Os vasos de pressão estão sem avaria, oxidação ou com vazamento de ar?",
      "1.38 O revestimento da sapata do conjunto de pedais está sem desgaste excessivo?",
      "1.39 Borda de assentamento do aro na roda está livre de avaria e não apresenta afastamento do aro na roda dianteira?",
      "1.40 Fixação de rodas está sem folga e com todas as porcas? Dips de indicação de aperto.",
      "1.41 Estepe apresenta boas condições e está bem fixado no suporte?",
      "1.42 Sistema de fechamento e escoramento das portas, tampas, porta malas e capô estão em bom estado e funcionando corretamente? Nota: Possui trava de segurança de forma a evitar prensamento de membros.",
      "1.43 As partes móveis rotativas, articuladas, quentes, estão devidamente protegidas? Nota: Partes rotativas como cardan, helice, escapamentos, correias, articulações de equipamentos, patolas de equipamentos, onde ofereça o risco de contato durante operações.",
      "1.44 A fixação do conjunto de pedais está sem desgaste ou avaria?",
      "1.45 Retrovisor apresenta boas condições na fixação e sem desgaste ou quebra do cristal?",
      "1.46 Veículo está sem avaria e desgaste nas faixas refletivas laterais e traseira? Aplicável para veículos que acessam áreas internas (operacional ou administrativa) e área de lavra. Não aplicável para veículos de aluguel de balcão.",
      "1.47 Possui sistema de comunicação entre veículos e equipamentos? Aplicável para veículos que acessam áreas internas (operacional ou administrativa) e área de lavra. Não aplicável para veículos de aluguel de balcão.",
      "1.48 O rolamento central está sem folga?",
      "1.49 O flange da caixa de câmbio está em bom estado?",
      "1.50 A cruzeta está sem avaria?",
      "1.51 A embreagem está sem desgaste ou defeitos?",
      "1.52 Mancal eixo de transmissão está sem folgas ou avaria?",
      "1.53 Os parafusos dos flanges de transmissão estão sem folgas?",
      "1.54 Os grampos \"u\" dos feixes de mola estão folgas ou danificados?",
      "1.55 Os pinos estão com lubrificação eficaz?",
      "1.56 Os cubos de rodas e diferencial estão sem presença de vazamento de óleo?",
      "1.57 A caixa de marcha está sem presença de vazamento de óleo?",
      "1.58 Calço da caixa de marchas está sem avaria?",
      "1.59 A árvore de transmissão (cardan) está sem folga?",
      "1.60 O painel do veículo está livre de falhas?",
      "1.61 O acionamento dos vidros está funcionando normalmente?",
      "1.62 O funcionamento do motor está normal? (ruído, falha)",
      "1.63 O sistema de arrefecimento do motor está sem avaria? (nível de água, estado das mangueiras e suas fixações)",
      "1.64 O sistema de escapamento do motor está sem avaria? (avarias, oxidação excessiva, fixação irregular)",
      "1.65 Janelas (vidros - laterais e traseiro) estão em boas condições?",
      "1.66 O para-brisa está em boas condições (livre de trincas)?",
      "1.67 Motor do veículo, de partida e compressor de ar estão em perfeito estado de funcionamento?",
      "1.68 Freio de serviço e de estacionamento estão funcionando?",
      "1.69 Possui alerta sonoro de ré ruído branco acoplado ao sistema de acionamento de marcha-a-ré, em condição adequada de funcionamento? Não aplicável para veículos de aluguel de balcão.",
      "1.70 Possui sensor de ré ou câmera de ré? Não aplicável para veículos de aluguel de balcão.",
      "1.71 Possui sistema de detecção de sonolência do condutor? Não aplicável para veículos de aluguel de balcão.",
      "1.72 Possui dois coletes refletivos, um par de luvas?",
      "1.73 Todas as rodas estão isentas de quebras, trincas, deformações, vazamentos ou consertos, em qualquer dos eixos do veículo?",
      "1.74 Possui ar condicionado?",
      "1.75 Possui tacógrafo com certificado de aferição válido?",
      "1.76 Para-choques (dianteiros e traseiros) em bom estado? (Parachoque de impulsão aplicável para Caminhonetes que acessam a mina subterrânea )",
      "1.77 Maçaneta das portas (trincos externos e internos)?",
      "1.78 As modificações foram executadas mediante aprovação formal do fabricante?",
      "1.79 O veículo está recebendo as manutenções preventivas recomendadas pelo fabricante?",
      "1.80 Possuir 02 calços para as rodas?",
      "1.81 Possui sinalizadores de torque de parafusos das rodas?",
      "1.82 Extintor de incêndio classe \"ABC\" proporcional ao veículo, na validade e carregado?"
    ]
  },
  {
    "nome": "2. Veículos dedicados",
    "escala": "conforme",
    "itens": [
      "2.01 Possui cinto de segurança do tipo três pontos para todos os ocupantes do veículo e apresenta boas condições?",
      "2.02 Possui air bag frontal para motorista e passageiro do banco dianteiro? Aplicável somente para veículos leves, caminhonete e vans",
      "2.03 Possui sistema de freios ABS nas quatro rodas?",
      "2.04 Possui controle eletrônico de frenagem (EBD)? Aplicável para veículos que acessam área de lavra.",
      "2.05 Possui controle de estabilidade? Aplicável para veículos que acessam área de lavra.",
      "2.06 Possui Tração 4x4? Aplicável para veículos que acessam área de lavra.",
      "2.07 Possui controle de tração? Aplicável para veículos que acessam área de lavra.",
      "2.08 Possui uma bandeirola visível e refletiva, definida conforme altura do maior equipamento? Aplicável para veículos que acessam áreas operacionais (Planta metalúrgica, opem pit, PDR's e barragens).",
      "2.09 Possui luz intermitente (Giroflex/Giroled), giratória? Aplicável para veículos que acessam área operacionais (Planta metalúrgica, opem pit, PDR's, barragens e mina subterrânea)."
    ]
  },
  {
    "nome": "3. Veículos de aluguel de balcão",
    "escala": "conforme",
    "itens": [
      "3.01 Possui cinto de segurança do tipo três pontos para todos os ocupantes do veículo e apresenta boas condições?",
      "3.02 Possui air bag frontal para motorista e passageiro do banco dianteiro?",
      "3.03 Possui sistema de freios ABS nas quatro rodas?"
    ]
  },
  {
    "nome": "4. Ônibus e Micro-ônibus",
    "escala": "conforme",
    "itens": [
      "4.01 Possui sistema de saída de emergência com mecanismo de abertura de manuseio simples?",
      "4.02 Possui tacógrafo em funcionamento?",
      "4.03 Possui sistema auxiliar de freio primário retardador de velocidade (freio motor)?",
      "4.04 Possui caixa de marcha do tipo sincronizado?",
      "4.05 Possui cinto de segurança do tipo três (03) pontos para o condutor e dois (02) pontos para os demais passageiros? (micro-ônibus e ônibus)",
      "4.06 Possui sistema retardador de velocidade do tipo primário (freio motor/freio de cabeçote) para ônibus?",
      "4.07 Possui sistema auxiliar de freio secundário (retarder hidráulico ou eletromagnético)? Aplicável para ônibus que acessam áreas internas (operacional ou administrativa) e via pública.",
      "4.08 Possui sistema primário retardador de velocidade (freio motor)?",
      "4.09 Possui alvará de licença para transporte coletivo municipal?",
      "4.10 Os pneus utilizados no eixo dianteiro estão isentos de reformas, quer seja pelo processo de recapagem, recauchutagem ou remoldagem.",
      "4.11 Possui sinalizadores de torque de parafusos das rodas? (ônibus e micro-ônibus)",
      "4.12 Possui botoeira de emergência na porta de serviço conforme resolução CONTRAN (455)?",
      "4.13 Possui chave geral e cofre para bloqueio do veículo (ônibus e micro-ônibus)?",
      "4.14 Cabine conservada?",
      "4.15 Extintor de incêndio classe \"ABC\" proporcional ao veículo, na validade e carregado?",
      "4.16 Possui Tração 4x4? Aplicável para micro-ônibus que acessam área de lavra.",
      "4.17 Possui controle de tração? Aplicável para micro-ônibus que acessam área de lavra.",
      "4.18 Possui uma bandeirola visível e refletiva,, definida conforme altura do maior equipamento? Aplicável para micro-ônibus que acessam área de lavra.",
      "4.19 Possui luz intermitente, giratória ou estroboscópica? Aplicável para micro-ônibus que acessam área de lavra.",
      "4.20 Possui Sensor de alerta de proximidade com equipamentos pesados? Aplicável para micro-ônibus que acessam área de lavra.",
      "4.21 Possuir botoeira de emergência próximo ao motorista para desligamento do motor em caso de panes."
    ]
  },
  {
    "nome": "3. Caminhonete",
    "escala": "conforme",
    "itens": [
      "3.01 Possui grade de proteção do vidro traseiro (isolamento de carga para caminhonetes) com no mínimo duas hastes?"
    ]
  },
  {
    "nome": "5. Vans",
    "escala": "conforme",
    "itens": [
      "5.02 Os pneus utilizados nos eixos dianteiro e traseiro estão isentos de reformas, quer seja pelo processo de recapagem, recauchutagem ou remoldagem (vans).",
      "5.03 Possui trava nas porcas das rodas?",
      "5.04 Possui cinto de segurança do tipo três (03) pontos para primeira linha de bancos e dois (02) pontos para os demais passageiros?",
      "5.05 Possui alvará de licença para transporte coletivo municipal?",
      "5.06 Extintor de incêndio classe \"ABC\" proporcional ao veículo, na validade e carregado?",
      "5.07 Possui air bag frontal para motorista e passageiro do banco dianteiro? Aplicável somente para veículos leves, caminhonete e vans.",
      "5.08 Possui sistema de freios ABS nas quatro rodas?"
    ]
  }
];


/* Escalas de resposta. `reprova` define o que derruba o parecer final. */
const ESCALAS = {
  estado: { opcoes: ["OK", "NAO APLICAVEL", "NAO CONFORME"], padrao: "OK", reprova: ["NAO CONFORME"] },
  original: { opcoes: ["ORIGINAL", "NAO APLICAVEL", "REMARCADO"], padrao: "ORIGINAL", reprova: ["REMARCADO"] },
  conforme: { opcoes: ["SIM", "N/A", "NAO"], padrao: "SIM", reprova: ["NAO"] },
};

const reprova = (resultado) =>
  Object.values(ESCALAS).some((e) => e.reprova.includes(resultado));

/* Campos com `extra: true` são gravados em vistorias.dados_extra (jsonb). */
const CAMPOS_VEICULO = [
  { k: "placa", label: "Placa" },
  { k: "fabricante", label: "Marca" },
  { k: "modelo", label: "Modelo" },
  { k: "cor", label: "Cor" },
  { k: "ano_fab", label: "Ano fab." },
  { k: "ano_mod", label: "Ano mod." },
  { k: "combustivel", label: "Combustível" },
  { k: "km", label: "KM / Hodômetro" },
  { k: "uf", label: "UF" },
  { k: "motor", label: "Motor (nº)" },
];

const TIPOS = {
  cautelar: {
    id: "cautelar",
    nome: "Laudo Cautelar",
    subtitulo: "Vistoria cautelar de procedência veicular",
    resumo: "Estrutura, pintura, vidros, identificação e etiquetas",
    campos: [
      ...CAMPOS_VEICULO,
      { k: "chassi", label: "Chassi", largo: true },
      { k: "renavam", label: "Renavam", largo: true },
    ],
    secoes: [
      {
        nome: "ESTRUTURA", escala: "estado",
        itens: [
          "Longarina dianteira esquerda", "Longarina dianteira direita", "Painel",
          "Painel corta fogo", "Paralama interno esquerdo", "Paralama interno direito",
          "Torre amortecedor diant. esquerdo", "Torre amortecedor diant. direito",
          "Coluna dianteira direita", "Coluna central direita", "Coluna traseira direita",
          "Caixa de ar lado direito", "Coluna dianteira esquerda", "Coluna central esquerda",
          "Coluna traseira esquerda", "Caixa de ar lado esquerdo",
          "Longarina traseira esquerda", "Longarina traseira direita",
          "Painel traseiro", "Caixa estepe",
        ],
      },
      {
        nome: "PINTURA", escala: "estado",
        itens: [
          "Capô", "Teto", "Tampa do porta-malas", "Paralama dianteiro esquerdo",
          "Porta dianteira esquerda", "Porta traseira esquerda", "Lateral traseira esquerda",
          "Lateral traseira direita", "Porta traseira direita", "Porta dianteira direita",
          "Paralama dianteiro direito", "Para-choque dianteiro", "Para-choque traseiro",
        ],
      },
      {
        nome: "VIDROS", escala: "original",
        itens: [
          "Para-brisa", "Porta dianteira esquerda", "Porta traseira esquerda",
          "Porta dianteira direita", "Porta traseira direita", "Lateral traseira direita",
          "Lateral traseira esquerda", "Vidro traseiro",
        ],
      },
      {
        nome: "IDENTIFICACAO", escala: "estado",
        itens: [
          "Número do motor", "Número do chassi", "Plaqueta chassi",
          "Plaqueta carroceria", "Plaqueta chassi traseira",
        ],
      },
      {
        nome: "ETIQUETAS", escala: "original",
        itens: ["Etiqueta compartimento do motor", "Etiqueta coluna lado direito"],
      },
    ],
    fotos: [
      "Frente 45º lado direito", "Frente 45º lado esquerdo",
      "Traseira 45º lado direito", "Traseira 45º lado esquerdo",
      "Compartimento do motor", "Painel de instrumento", "Hodômetro",
      "Chassi", "Motor (numeração)", "Placa traseira",
    ],
    termo:
      "O objetivo da presente vistoria é a verificação da procedência e da qualidade estrutural e estética do " +
      "veículo, para melhor conhecimento do bem. A vistoria limita-se a indicar, no momento de sua realização, " +
      "eventuais avarias externas e alterações estruturais visíveis, sem desmonte de peças ou manuseio mecânico. " +
      "O perfeito funcionamento de itens mecânicos, elétricos e eletrônicos, bem como a autenticidade do " +
      "hodômetro, não são atestados. As informações são válidas apenas para a data e o momento da vistoria. " +
      "Este laudo não substitui perícia oficial e não garante, por si só, a aceitação por seguradoras ou " +
      "instituições financeiras, que adotam critérios próprios.",
  },

  ssma: {
    id: "ssma",
    nome: "Checklist de Mobilização SSMA",
    subtitulo: "Checklist de Mobilização de SSMA — Veículos Automotores",
    resumo: "Conformidade de veículos para mobilização (PN 0693 / FM-0441)",
    referencia: "Documento de referência: PN 0693 · FM-0441 Rev. 03",
    campos: [
      { k: "empresa", label: "Empresa", extra: true, largo: true },
      { k: "subcontratada", label: "Subcontratada", extra: true, largo: true },
      { k: "contrato", label: "Nº contrato", extra: true },
      { k: "categoria", label: "Categoria", extra: true },
      { k: "placa", label: "Placa" },
      { k: "tag", label: "TAG", extra: true },
      { k: "fabricante", label: "Marca" },
      { k: "modelo", label: "Modelo" },
      { k: "ano_fab", label: "Ano" },
      { k: "km", label: "KM" },
      { k: "localidade", label: "Localidade", extra: true },
      { k: "local_inspecao", label: "Local da inspeção", extra: true },
      { k: "descricao_equip", label: "Descrição do equipamento/veículo/máquina", extra: true, largo: true },
    ],
    secoes: SSMA_SECOES,
    fotos: [
      "Frente do veículo", "Traseira do veículo", "Lateral direita", "Lateral esquerda",
      "Hodômetro", "Pneus", "Extintor", "Documento (CRLV)", "Compartimento do motor",
    ],
    legenda: "(SIM) Atende · (NAO) Não atende · (N/A) Não aplicável",
    termo:
      "Este checklist verifica a conformidade do veículo/equipamento frente aos requisitos de Saúde, Segurança e " +
      "Meio Ambiente exigidos para mobilização, na data e hora indicadas. A avaliação é visual e funcional, sem " +
      "desmonte de conjuntos ou ensaios laboratoriais, e reflete a condição do bem apenas no momento da inspeção. " +
      "Itens marcados como Não Aplicável referem-se a requisitos que não incidem sobre a categoria do veículo " +
      "inspecionado. A liberação para mobilização é prerrogativa do contratante, que pode adotar critérios " +
      "complementares aos aqui verificados.",
  },

  ringelmann: {
    id: "ringelmann",
    nome: "Emissão de Fumaça — Ringelmann",
    subtitulo: "Avaliação de emissão de fumaça preta pela escala de Ringelmann",
    resumo: "Medição de densidade colorimétrica em veículos a diesel",
    porFoto: true, // as fotos carregam o nível 1-5, não há checklist
    campos: [
      { k: "empresa", label: "Empresa / proprietário", extra: true, largo: true },
      { k: "placa", label: "Placa" },
      { k: "tag", label: "TAG", extra: true },
      { k: "fabricante", label: "Marca" },
      { k: "modelo", label: "Modelo" },
      { k: "ano_fab", label: "Ano de fabricação" },
      { k: "km", label: "Hodômetro" },
      { k: "combustivel", label: "Combustível" },
      { k: "condutor", label: "Condutor", extra: true },
      { k: "local_inspecao", label: "Local da medição", extra: true, largo: true },
      { k: "limite", label: "Limite aceito (nível Ringelmann)", extra: true },
    ],
    secoes: [],
    fotos: ["Frente do veículo", "Hodômetro", "Traseira do veículo", "Escapamento"],
    termo:
      "A presente avaliação mede a densidade colorimétrica da fumaça emitida pelo escapamento do veículo por " +
      "comparação visual com a escala de Ringelmann, cujos níveis de 1 a 5 correspondem a 20%, 40%, 60%, 80% e " +
      "100% de densidade. O método é comparativo e visual, realizado em campo, e não substitui a medição por " +
      "opacímetro nem ensaio laboratorial. O resultado reflete a condição do veículo apenas no momento e nas " +
      "condições ambientais da medição. O limite de aceitação registrado neste laudo é o parâmetro informado " +
      "pelo contratante para esta operação; a verificação do limite legal aplicável ao caso é de responsabilidade " +
      "do contratante.",
  },
};

/* Escala de Ringelmann: nível -> densidade colorimétrica de referência */
const NIVEIS_RINGELMANN = [
  { n: 1, pct: 20, cor: "#d9dee5" },
  { n: 2, pct: 40, cor: "#9aa5b1" },
  { n: 3, pct: 60, cor: "#5c6773" },
  { n: 4, pct: 80, cor: "#2f3740" },
  { n: 5, pct: 100, cor: "#11151a" },
];

const LIMITE_RINGELMANN_PADRAO = 2;

const tipoDe = (v) => TIPOS[v?.tipo] || TIPOS.cautelar;


/* ============================================================
   SISTEMA DE VISTORIA VEICULAR — LAUDO CAUTELAR
   Backend: Supabase (projeto VISTORIA)
   Modos (por hash na URL):
     #/            -> Painel (voce): lista + criar + gerar link
     #/v/<token>   -> Formulario do vistoriador (mobile)
     #/laudo/<id>  -> Laudo pronto (visualizar / imprimir PDF)
   ============================================================ */

const SUPABASE_URL = "https://oiwcnyolidryuixuabzs.supabase.co";
const SUPABASE_KEY = "sb_publishable_mDhb1o9lTurpOSAto2Jv-g_tmbbFWwz";
const BUCKET = "vistoria-fotos";

/* logo oficial (vive em /public, entao vai junto no build).
   o ?v serve para o cache do navegador nao entregar uma versao antiga
   depois de trocar o arquivo; incrementar ao substituir a imagem */
const LOGO = "/logo-soares.png?v=2";

/* ---------- dados oficiais da empresa (do CNPJ) ---------- */
const EMPRESA = {
  razao: "SOARES SERVIÇOS CONSULTORIA E LOCAÇÃO LTDA",
  fantasia: "Soares Serviços",
  cnpj: "38.570.390/0001-08",
  porte: "EPP",
  endereco: "R. Bonfim, SN, Quadra 06 Lote 01, Bouganville — Barro Alto/GO, CEP 76.390-000",
  telefone: "(62) 8273-6369",
  email: "soaresservicoselocacao@gmail.com",
  responsavel: "Alex Vieira Soares",
  respFuncao: "Responsável Técnico / Engenheiro",
};

/* Termo técnico padrão do laudo */
const TERMO = `O objetivo da presente vistoria é a verificação da procedência e da qualidade estrutural e estética do veículo, para melhor conhecimento do bem. A ${EMPRESA.fantasia} limita-se a indicar, no momento da vistoria, eventuais avarias externas e alterações estruturais visíveis, sem desmonte de peças ou manuseio mecânico do veículo. O perfeito funcionamento de itens mecânicos, elétricos e eletrônicos, bem como a autenticidade do hodômetro, não são atestados nesta vistoria. As informações são válidas apenas para a data e o momento de sua realização. Este laudo não substitui perícia oficial e não garante, por si só, a aceitação por seguradoras ou instituições financeiras, que adotam critérios próprios.`;

/* ---------- sessao do painel (Supabase Auth) ---------- */
const CHAVE_SESSAO = "soares_vistoria_sessao";
let SESSAO = null;
try { SESSAO = JSON.parse(localStorage.getItem(CHAVE_SESSAO) || "null"); } catch { SESSAO = null; }

const auth = {
  get atual() { return SESSAO; },
  guardar(s) { SESSAO = s; localStorage.setItem(CHAVE_SESSAO, JSON.stringify(s)); },
  sair() { SESSAO = null; localStorage.removeItem(CHAVE_SESSAO); },

  async chamar(rota, corpo) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/${rota}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error_description || d.msg || d.message || "Falha na autenticação.");
    return d;
  },

  async entrar(email, senha) {
    const d = await this.chamar("token?grant_type=password", { email, password: senha });
    if (!d.access_token) throw new Error("Login sem token de acesso.");
    this.guardar({ access_token: d.access_token, email: d.user?.email || email });
    return d;
  },

  async criarConta(email, senha) {
    const d = await this.chamar("signup", { email, password: senha });
    // com confirmacao de e-mail ligada, o Supabase nao devolve token aqui
    if (d.access_token) this.guardar({ access_token: d.access_token, email: d.user?.email || email });
    return d;
  },
};

/* ---------- cliente REST minimalista do Supabase ---------- */
const api = {
  headers(extra = {}) {
    return {
      apikey: SUPABASE_KEY,
      // logado -> token do usuario (passa pelas policies de admin)
      // anonimo -> chave publicavel, que so alcanca as funcoes RPC
      Authorization: `Bearer ${SESSAO?.access_token || SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...extra,
    };
  },

  async rpc(funcao, args) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${funcao}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(args),
    });
    const txt = await r.text();
    if (!r.ok) {
      let msg = txt;
      try { msg = JSON.parse(txt).message || txt; } catch {}
      throw new Error(msg);
    }
    return txt ? JSON.parse(txt) : null;
  },
  async select(table, query = "") {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: this.headers(),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async insert(table, rows) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: this.headers({ Prefer: "return=representation" }),
      body: JSON.stringify(rows),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async update(table, query, patch) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      method: "PATCH",
      headers: this.headers({ Prefer: "return=representation" }),
      body: JSON.stringify(patch),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async uploadFoto(file, path) {
    const r = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,
      {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        body: file,
      }
    );
    if (!r.ok) throw new Error(await r.text());
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  },
};

/* checklists e campos de cada tipo de laudo vivem em ./tipos.js */

/* densidade media e nivel maximo de um conjunto de fotos Ringelmann */
function resumoRingelmann(fotos) {
  const comNivel = fotos.filter((f) => f.nivel);
  if (!comNivel.length) return { media: 0, maior: 0, porNivel: {}, n: 0 };
  const porNivel = {};
  let soma = 0;
  comNivel.forEach((f) => {
    porNivel[f.nivel] = (porNivel[f.nivel] || 0) + 1;
    soma += f.densidade != null ? Number(f.densidade) : f.nivel * 20;
  });
  return {
    media: Math.round(soma / comNivel.length),
    maior: Math.max(...comNivel.map((f) => f.nivel)),
    porNivel,
    n: comNivel.length,
  };
}

/* =====================  UI base  ===================== */
const C = {
  bg: "#0f1720", panel: "#161f2b", line: "#26313f", ink: "#e8edf3",
  sub: "#8ea0b5", brand: "#2dd4bf", ok: "#22c55e", warn: "#f59e0b",
  bad: "#ef4444", chip: "#1e2836",
};

function Badge({ result }) {
  const map = {
    OK: C.ok, ORIGINAL: C.ok, "NAO APLICAVEL": C.sub,
    "NAO CONFORME": C.bad, REMARCADO: C.bad,
  };
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: .3, padding: "3px 8px",
      borderRadius: 6, color: "#04110c",
      background: map[result] || C.sub, whiteSpace: "nowrap",
    }}>{result}</span>
  );
}

function Field({ label, ...p }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span style={{ display: "block", fontSize: 12, color: C.sub, marginBottom: 5, letterSpacing: .3 }}>{label}</span>
      <input {...p} style={{
        width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${C.line}`,
        background: C.bg, color: C.ink, fontSize: 15, outline: "none", boxSizing: "border-box",
      }} />
    </label>
  );
}

/* =====================  LOGIN DO PAINEL  ===================== */
function Login({ aoEntrar }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  async function enviar(e) {
    e?.preventDefault();
    setErro(null); setAviso(null); setOcupado(true);
    try {
      if (criando) {
        const d = await auth.criarConta(email.trim(), senha);
        if (d.access_token) aoEntrar();
        else setAviso("Conta criada. Confirme o e-mail que o Supabase enviou e depois entre.");
      } else {
        await auth.entrar(email.trim(), senha);
        aoEntrar();
      }
    } catch (ex) {
      setErro(ex.message || "Não consegui entrar.");
    }
    setOcupado(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <form onSubmit={enviar} style={{ ...card, width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 12, letterSpacing: 2, color: C.brand, fontWeight: 700 }}>SOARES · VISTORIAS</div>
        <h1 style={{ margin: "6px 0 4px", fontSize: 22, letterSpacing: -.3 }}>
          {criando ? "Criar acesso" : "Entrar no painel"}
        </h1>
        <div style={{ fontSize: 12.5, color: C.sub, marginBottom: 18 }}>
          O painel é restrito. O link que você envia ao vistoriador continua funcionando sem login.
        </div>

        <Field label="E-mail" type="email" autoComplete="username" value={email}
          onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
        <Field label="Senha" type="password" value={senha}
          autoComplete={criando ? "new-password" : "current-password"}
          onChange={e => setSenha(e.target.value)} placeholder="••••••••" />

        {erro && (
          <div style={{ background: "#3a1d24", color: "#ffb4b4", fontSize: 12.5, padding: "9px 11px", borderRadius: 8, marginBottom: 12 }}>{erro}</div>
        )}
        {aviso && (
          <div style={{ background: "#12312b", color: "#8ef0d0", fontSize: 12.5, padding: "9px 11px", borderRadius: 8, marginBottom: 12 }}>{aviso}</div>
        )}

        <button type="submit" disabled={ocupado || !email || !senha}
          style={{ ...btnPrimary, width: "100%", opacity: ocupado || !email || !senha ? .6 : 1 }}>
          {ocupado ? "Aguarde…" : criando ? "Criar acesso" : "Entrar"}
        </button>

        <button type="button" onClick={() => { setCriando(!criando); setErro(null); setAviso(null); }}
          style={{ ...btnGhost, width: "100%", marginTop: 8, border: "none", color: C.sub, fontSize: 12.5 }}>
          {criando ? "Já tenho acesso — entrar" : "Primeiro acesso — criar conta"}
        </button>
      </form>
    </div>
  );
}

/* =====================  PAINEL  ===================== */
function Painel({ aoSair }) {
  const [vistorias, setVistorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novo, setNovo] = useState(false);
  const [form, setForm] = useState({ tipo: "cautelar", placa: "", modelo: "", cliente: "", vistoriador: "" });
  const [criando, setCriando] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);

  const [erroLista, setErroLista] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErroLista(null);
    try {
      const d = await api.select("vistorias", "select=*&order=criado_em.desc");
      setVistorias(d);
    } catch (e) {
      // token vencido ou e-mail fora da lista de admins
      if (/JWT|expired|401|not authorized/i.test(e.message || "")) { auth.sair(); aoSair?.(); return; }
      console.error(e);
      setErroLista(e.message || "Não consegui carregar as vistorias.");
    }
    setLoading(false);
  }, [aoSair]);
  useEffect(() => { load(); }, [load]);

  async function criar() {
    setCriando(true);
    try {
      const resp = await api.insert("vistorias", [{
        tipo: form.tipo,
        placa: (form.placa || "").toUpperCase(), modelo: form.modelo,
        cliente: form.cliente, vistoriador: form.vistoriador,
        solicitante: "Alex Soares", status: "pendente",
      }]);
      const v = Array.isArray(resp) ? resp[0] : resp;
      if (!v || !v.token) throw new Error("Resposta sem token do servidor.");
      const link = `${location.origin}${location.pathname}#/v/${encodeURIComponent(v.token)}`;
      setLinkGerado({ link, placa: v.placa });
      setForm({ tipo: form.tipo, placa: "", modelo: "", cliente: "", vistoriador: "" });
      setNovo(false);
      window.scrollTo(0, 0);
      load();
    } catch (e) {
      console.error(e);
      alert("Não consegui criar a vistoria.\n\nDetalhe: " + (e.message || e));
    }
    setCriando(false);
  }

  const statusColor = { pendente: C.warn, em_andamento: C.brand, concluida: C.ok };

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 16px 80px" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 13, letterSpacing: 2, color: C.brand, fontWeight: 700 }}>SOARES · VISTORIAS</div>
          <h1 style={{ margin: "4px 0 0", fontSize: 26, letterSpacing: -.5 }}>Laudo Cautelar</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setNovo(true)} style={btnPrimary}>+ Nova vistoria</button>
          <button onClick={() => { auth.sair(); aoSair?.(); }} style={{ ...btnGhost, padding: "10px 12px" }}
            title={auth.atual?.email || ""}>Sair</button>
        </div>
      </header>

      {linkGerado && (
        <div style={{ ...card, borderColor: C.brand, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: C.brand, fontWeight: 700, marginBottom: 8 }}>
            Link gerado — placa {linkGerado.placa || "—"}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input readOnly value={linkGerado.link} style={{
              flex: 1, minWidth: 200, padding: "10px 12px", borderRadius: 9,
              border: `1px solid ${C.line}`, background: C.bg, color: C.ink, fontSize: 13,
            }} />
            <button style={btnGhost} onClick={() => { navigator.clipboard?.writeText(linkGerado.link); }}>Copiar</button>
            <a style={{ ...btnGhost, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
               href={`https://wa.me/?text=${encodeURIComponent("Vistoria do veículo: " + linkGerado.link)}`}
               target="_blank" rel="noreferrer">WhatsApp</a>
            <button style={btnGhost} onClick={() => setLinkGerado(null)}>Fechar</button>
          </div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 8 }}>
            Envie este link ao vistoriador. Ele preenche pelo celular e o laudo aparece aqui.
          </div>
        </div>
      )}

      {novo && (
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>Nova vistoria</div>

          <div style={{ fontSize: 12, color: C.sub, marginBottom: 7, letterSpacing: .3 }}>Tipo de laudo</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {Object.values(TIPOS).map(t => {
              const ativo = form.tipo === t.id;
              return (
                <button key={t.id} onClick={() => setForm({ ...form, tipo: t.id })}
                  style={{
                    textAlign: "left", padding: "11px 13px", borderRadius: 10, cursor: "pointer",
                    border: `1.5px solid ${ativo ? C.brand : C.line}`,
                    background: ativo ? "rgba(45,212,191,.09)" : "transparent",
                  }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: ativo ? C.brand : C.ink }}>{t.nome}</div>
                  <div style={{ fontSize: 11.5, color: C.sub, marginTop: 2 }}>{t.resumo}</div>
                </button>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Placa" value={form.placa} onChange={e => setForm({ ...form, placa: e.target.value })} placeholder="ABC1D23" />
            <Field label="Modelo" value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} placeholder="Citroën C4 Cactus" />
            <Field label="Cliente" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} placeholder="Nome do cliente" />
            <Field label="Vistoriador" value={form.vistoriador} onChange={e => setForm({ ...form, vistoriador: e.target.value })} placeholder="Quem vai vistoriar" />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button style={btnPrimary} disabled={criando} onClick={criar}>{criando ? "Criando…" : "Criar e gerar link"}</button>
            <button style={btnGhost} onClick={() => setNovo(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {erroLista && (
        <div style={{ ...card, borderColor: C.bad, marginBottom: 16, color: "#ffb4b4", fontSize: 13 }}>
          {erroLista}
        </div>
      )}

      {loading ? (
        <div style={{ color: C.sub, textAlign: "center", padding: 40 }}>Carregando…</div>
      ) : vistorias.length === 0 ? (
        <div style={{ ...card, textAlign: "center", color: C.sub, padding: 40 }}>
          Nenhuma vistoria ainda. Crie a primeira e gere um link.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {vistorias.map(v => (
            <div key={v.id} style={{ ...card, display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{v.placa || "sem placa"} <span style={{ color: C.sub, fontWeight: 400, fontSize: 14 }}>· {v.modelo || "—"}</span></div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>
                  {v.cliente || "—"} · {new Date(v.criado_em).toLocaleDateString("pt-BR")}
                </div>
                <div style={{ fontSize: 11, color: C.brand, marginTop: 4, fontWeight: 600 }}>{tipoDe(v).nome}</div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 20,
                color: "#04110c", background: statusColor[v.status] || C.sub,
              }}>{v.status.replace("_", " ")}</span>
              {v.status === "concluida" ? (
                <a href={`#/laudo/${v.id}`} style={{ ...btnGhost, textDecoration: "none" }}>Ver laudo</a>
              ) : (
                <button style={btnGhost} onClick={() => {
                  const link = `${location.origin}${location.pathname}#/v/${encodeURIComponent(v.token)}`;
                  setLinkGerado({ link, placa: v.placa });
                  window.scrollTo(0, 0);
                }}>Link</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =====================  FORMULARIO VISTORIADOR  ===================== */
function Formulario({ token }) {
  const [vist, setVist] = useState(null);
  const [erro, setErro] = useState(null);
  const [passo, setPasso] = useState(0); // 0 dados, 1..N secoes, N+1 fotos, N+2 enviar
  const [dados, setDados] = useState({});
  const [itens, setItens] = useState({});
  const [fotos, setFotos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    (async () => {
      try {
        // o token do link e a credencial: o anonimo nao acessa as tabelas
        const d = await api.rpc("vistoria_por_token", { p_token: token });
        if (!d) { setErro("Vistoria não encontrada. Verifique o link."); return; }
        if (d.status === "concluida") { setErro("Esta vistoria já foi concluída."); return; }
        setVist(d);
        const t = tipoDe(d);
        const extra = d.dados_extra || {};
        const init0 = { vistoriador: d.vistoriador || "", observacoes: "" };
        t.campos.forEach(c => {
          init0[c.k] = (c.extra ? extra[c.k] : d[c.k]) || "";
        });
        if (t.porFoto && !init0.limite) init0.limite = String(LIMITE_RINGELMANN_PADRAO);
        setDados(init0);

        const init = {};
        t.secoes.forEach(sec => {
          sec.itens.forEach(it => { init[`${sec.nome}||${it}`] = ESCALAS[sec.escala].padrao; });
        });
        setItens(init);
      } catch (e) { setErro("Erro ao carregar: " + e.message); }
    })();
  }, [token]);

  const tipo = tipoDe(vist);
  const secoes = tipo.secoes;
  const totalPassos = 1 + secoes.length + 1; // dados + secoes + fotos

  async function addFotos(files) {
    for (const f of files) {
      const id = Math.random().toString(36).slice(2);
      setFotos(prev => [...prev, {
        id, file: f, legenda: "", preview: URL.createObjectURL(f),
        nivel: tipo.porFoto ? 1 : null,
      }]);
    }
  }

  async function enviar() {
    // laudo de medicao sem medicao nao pode gerar parecer
    if (tipo.porFoto && !fotos.some(f => f.nivel)) {
      alert("Este laudo é uma medição: anexe ao menos uma foto da fumaça e marque o nível da escala Ringelmann antes de finalizar.");
      return;
    }
    // envio e irreversivel: a vistoria vira "concluida" e o link para de aceitar edicao
    const faltamFotos = fotos.length === 0 ? "\n\nAtenção: nenhuma foto foi anexada." : "";
    if (!window.confirm(`Finalizar e enviar o laudo? Depois de enviado ele não pode mais ser editado.${faltamFotos}`)) return;
    setEnviando(true);
    try {
      // 1. upload das fotos
      const fotoRows = [];
      let i = 0;
      for (const f of fotos) {
        const ext = (f.file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${vist.id}/${Date.now()}_${i}.${ext}`;
        const url = await api.uploadFoto(f.file, path);
        fotoRows.push({
          legenda: f.legenda || `Foto ${i + 1}`, url, ordem: i,
          nivel: tipo.porFoto ? f.nivel : null,
          densidade: tipo.porFoto ? f.nivel * 20 : null,
        });
        i++;
      }

      // 2. itens do checklist
      const itemRows = [];
      let ord = 0;
      Object.entries(itens).forEach(([k, v]) => {
        const [secao, item] = k.split("||");
        itemRows.push({ secao, item, resultado: v, ordem: ord++ });
      });

      // 3. separa colunas proprias dos campos que vao em dados_extra
      const colunas = {}, extra = {};
      tipo.campos.forEach(c => {
        const val = dados[c.k] ?? "";
        if (c.extra) extra[c.k] = val; else colunas[c.k] = val;
      });
      colunas.vistoriador = dados.vistoriador || vist.vistoriador || "";
      colunas.observacoes = dados.observacoes || "";

      if (tipo.porFoto) {
        const r = resumoRingelmann(fotoRows);
        extra.densidade_media = r.media;
        extra.nivel_maximo = r.maior;
        if (!extra.limite) extra.limite = String(LIMITE_RINGELMANN_PADRAO);
      }

      // 4. grava tudo numa chamada; o parecer e recalculado no servidor
      await api.rpc("enviar_vistoria", {
        p_token: token,
        p_dados: colunas,
        p_extra: extra,
        p_itens: itemRows,
        p_fotos: fotoRows,
      });
      setEnviado(true);
    } catch (e) { alert("Erro ao enviar: " + e.message); }
    setEnviando(false);
  }

  if (erro) return <TelaMsg titulo="Ops" texto={erro} />;
  if (!vist) return <TelaMsg titulo="Carregando…" texto="Buscando dados da vistoria." />;
  if (enviado) return <TelaMsg titulo="Vistoria enviada ✓" texto="Laudo gerado com sucesso. Pode fechar esta página." cor={C.ok} />;

  const pct = Math.round((passo / totalPassos) * 100);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "16px 14px 100px" }}>
      <div style={{ fontSize: 12, letterSpacing: 2, color: C.brand, fontWeight: 700 }}>{tipo.nome.toUpperCase()}</div>
      <div style={{ height: 6, background: C.chip, borderRadius: 20, margin: "10px 0 18px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: C.brand, transition: "width .3s" }} />
      </div>

      {passo === 0 && (
        <div style={card}>
          <h2 style={h2}>{tipo.porFoto ? "Dados da medição" : "Dados do veículo"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {tipo.campos.map(c => (
              <div key={c.k} style={c.largo ? { gridColumn: "1 / -1" } : undefined}>
                <Field label={c.label} value={dados[c.k] || ""}
                  onChange={e => setDados({ ...dados, [c.k]: e.target.value })} />
              </div>
            ))}
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Vistoriador" value={dados.vistoriador || ""}
                onChange={e => setDados({ ...dados, vistoriador: e.target.value })} />
            </div>
          </div>
          {tipo.referencia && (
            <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{tipo.referencia}</div>
          )}
        </div>
      )}

      {passo >= 1 && passo <= secoes.length && (() => {
        const sec = secoes[passo - 1];
        const esc = ESCALAS[sec.escala];
        const marcarTodos = (op) => {
          const novo = { ...itens };
          sec.itens.forEach(it => { novo[`${sec.nome}||${it}`] = op; });
          setItens(novo);
        };
        return (
          <div style={card}>
            <h2 style={{ ...h2, fontSize: 17, lineHeight: 1.3 }}>{sec.nome}</h2>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 10 }}>
              {tipo.legenda || "Toque para marcar cada item."}
            </div>
            {sec.itens.length > 8 && (
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                <span style={{ fontSize: 11, color: C.sub, alignSelf: "center" }}>Marcar todos:</span>
                {esc.opcoes.map(op => (
                  <button key={op} onClick={() => marcarTodos(op)}
                    style={{
                      padding: "4px 9px", borderRadius: 6, fontSize: 10.5, fontWeight: 700, cursor: "pointer",
                      border: `1px solid ${C.line}`, background: "transparent", color: C.sub,
                    }}>{op}</button>
                ))}
              </div>
            )}
            {sec.itens.map(it => {
              const k = `${sec.nome}||${it}`;
              return (
                <div key={k} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ fontSize: 13.5, marginBottom: 7, lineHeight: 1.4 }}>{it}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {esc.opcoes.map(op => {
                      const active = itens[k] === op;
                      const col = esc.reprova.includes(op) ? C.bad
                        : (op === "NAO APLICAVEL" || op === "N/A") ? C.sub : C.ok;
                      return (
                        <button key={op} onClick={() => setItens({ ...itens, [k]: op })}
                          style={{
                            flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 11.5, fontWeight: 700,
                            cursor: "pointer", border: `1.5px solid ${active ? col : C.line}`,
                            background: active ? col : "transparent",
                            color: active ? "#04110c" : C.sub,
                          }}>{op}</button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {passo === secoes.length + 1 && (
        <div style={card}>
          <h2 style={h2}>Fotos</h2>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 12 }}>
            {tipo.porFoto
              ? "Fotografe a fumaça do escapamento e marque o nível da escala Ringelmann em cada foto."
              : `Tire ou selecione as fotos. Sugestões: ${tipo.fotos.slice(0, 5).join(", ")}…`}
          </div>

          {tipo.porFoto && (
            <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
              {NIVEIS_RINGELMANN.map(n => (
                <div key={n.n} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ height: 26, background: n.cor, borderRadius: 5, border: `1px solid ${C.line}` }} />
                  <div style={{ fontSize: 9.5, color: C.sub, marginTop: 3 }}>{n.n} · {n.pct}%</div>
                </div>
              ))}
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple
            style={{ display: "none" }} onChange={e => { addFotos([...e.target.files]); e.target.value = ""; }} />
          <button style={{ ...btnPrimary, width: "100%", marginBottom: 14 }} onClick={() => fileRef.current?.click()}>
            📷 Adicionar fotos
          </button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {fotos.map(f => (
              <div key={f.id} style={{ background: C.bg, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.line}` }}>
                <img src={f.preview} alt="" style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
                <div style={{ padding: 7 }}>
                  <input list="fotolist" placeholder="Legenda" value={f.legenda}
                    onChange={e => setFotos(fotos.map(x => x.id === f.id ? { ...x, legenda: e.target.value } : x))}
                    style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: `1px solid ${C.line}`, background: C.panel, color: C.ink, fontSize: 12, boxSizing: "border-box" }} />
                  {tipo.porFoto && (
                    <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
                      {NIVEIS_RINGELMANN.map(n => (
                        <button key={n.n} title={`Nível ${n.n} — ${n.pct}%`}
                          onClick={() => setFotos(fotos.map(x => x.id === f.id ? { ...x, nivel: n.n } : x))}
                          style={{
                            flex: 1, padding: "6px 0", borderRadius: 5, fontSize: 10.5, fontWeight: 800,
                            cursor: "pointer", background: n.cor, color: n.n >= 3 ? "#fff" : "#11151a",
                            border: `2px solid ${f.nivel === n.n ? C.brand : "transparent"}`,
                          }}>{n.n}</button>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setFotos(fotos.filter(x => x.id !== f.id))}
                    style={{ marginTop: 6, width: "100%", padding: "5px", borderRadius: 6, border: "none", background: "#3a1d24", color: C.bad, fontSize: 11, cursor: "pointer" }}>Remover</button>
                </div>
              </div>
            ))}
          </div>
          <datalist id="fotolist">{tipo.fotos.map(f => <option key={f} value={f} />)}</datalist>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: C.sub, marginBottom: 5 }}>Observações</label>
            <textarea value={dados.observacoes} onChange={e => setDados({ ...dados, observacoes: e.target.value })}
              rows={4} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${C.line}`, background: C.bg, color: C.ink, fontSize: 14, boxSizing: "border-box", resize: "vertical" }} />
          </div>
        </div>
      )}

      {/* navegacao */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 14px",
        background: C.panel, borderTop: `1px solid ${C.line}`, display: "flex", gap: 8,
        maxWidth: 560, margin: "0 auto",
      }}>
        {passo > 0 && <button style={btnGhost} onClick={() => setPasso(passo - 1)}>Voltar</button>}
        {passo < totalPassos - 1 ? (
          <button style={{ ...btnPrimary, flex: 1 }} onClick={() => setPasso(passo + 1)}>Continuar</button>
        ) : (
          <button style={{ ...btnPrimary, flex: 1, background: C.ok }} disabled={enviando} onClick={enviar}>
            {enviando ? "Enviando…" : "Finalizar e enviar laudo"}
          </button>
        )}
      </div>
    </div>
  );
}

/* =====================  LAUDO  ===================== */
function Laudo({ id }) {
  const [v, setV] = useState(null);
  const [itens, setItens] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // leitura publica por id: o QR de validacao precisa abrir sem login
        const d = await api.rpc("laudo_por_id", { p_id: id });
        if (!d || !d.vistoria) { setErro("Laudo não encontrado ou ainda não concluído."); return; }
        setV(d.vistoria);
        setItens(d.itens || []);
        setFotos(d.fotos || []);
      } catch (e) { setErro("Erro: " + e.message); }
    })();
  }, [id]);

  if (erro) return <TelaMsg titulo="Ops" texto={erro} />;
  if (!v) return <TelaMsg titulo="Carregando laudo…" texto="" />;

  const tipo = tipoDe(v);
  const extra = v.dados_extra || {};
  const bySecao = {};
  itens.forEach(it => { (bySecao[it.secao] ||= []).push(it); });
  const conforme = v.parecer === "CONFORME" || v.parecer === "APROVADO";
  const ring = tipo.porFoto ? resumoRingelmann(fotos) : null;
  const limiteRing = Number(extra.limite) || LIMITE_RINGELMANN_PADRAO;

  // numero do laudo: ano + 6 primeiros do id
  const numeroLaudo = `${new Date(v.concluido_em || v.criado_em).getFullYear()}-${(v.id || "").replace(/-/g, "").slice(0, 6).toUpperCase()}`;
  const dataConc = new Date(v.concluido_em || v.criado_em);
  // URL de validacao (o proprio laudo)
  const urlValidacao = `${location.origin}${location.pathname}#/laudo/${v.id}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(urlValidacao)}`;

  // status por secao para os selos
  const secaoStatus = {};
  Object.entries(bySecao).forEach(([sec, list]) => {
    secaoStatus[sec] = list.some(it => reprova(it.resultado)) ? "reprovado" : "aprovado";
  });

  const dado = (label, val) => (
    <div><div style={{ fontSize: 9.5, color: "#8a94a3", letterSpacing: .5, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1a2230" }}>{val || "—"}</div></div>
  );

  const resultColor = (r) =>
    (r === "OK" || r === "ORIGINAL" || r === "SIM") ? "#16a34a"
      : (r === "NAO APLICAVEL" || r === "N/A") ? "#94a3b8"
        : "#dc2626";

  return (
    <div style={{ background: "#e9edf2", minHeight: "100vh", padding: "20px 0" }}>
      <div style={{ maxWidth: 840, margin: "0 auto", padding: "0 14px" }}>
        <div className="noprint" style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <a href="#/" style={{ ...btnGhost, textDecoration: "none", color: "#333", borderColor: "#ccc" }}>← Painel</a>
          <button style={{ ...btnPrimary, background: "#0f2942" }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>

        <div id="laudo" style={{ background: "#fff", color: "#1a2230", borderRadius: 4, overflow: "hidden", boxShadow: "0 2px 24px rgba(0,0,0,.1)" }}>

          {/* ===== CABEÇALHO EMPRESA ===== */}
          <div style={{ padding: "20px 28px 16px", borderBottom: `4px solid #0f2942` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <img src={LOGO} alt={EMPRESA.razao}
                  style={{ height: 44, width: "auto", display: "block", marginBottom: 11 }} />
                <div style={{ fontSize: 11, color: "#5b6472", marginTop: 3, lineHeight: 1.5 }}>
                  {/* razao social por extenso: o laudo e documento tecnico */}
                  {EMPRESA.razao}<br />
                  CNPJ {EMPRESA.cnpj} · {EMPRESA.porte}<br />
                  {EMPRESA.endereco}<br />
                  {EMPRESA.telefone} · {EMPRESA.email}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 10, letterSpacing: 1.6, color: "#14b8a6", fontWeight: 800, maxWidth: 210 }}>{tipo.nome.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: "#5b6472", marginTop: 2 }}>Nº {numeroLaudo}</div>
                <div style={{
                  marginTop: 8, padding: "6px 16px", borderRadius: 6, fontWeight: 800, fontSize: 14, color: "#fff",
                  background: conforme ? "#16a34a" : "#dc2626", display: "inline-block",
                }}>{v.parecer}</div>
              </div>
            </div>
          </div>

          {/* ===== DADOS DA VISTORIA ===== */}
          <div style={{ padding: "14px 28px", background: "#f6f8fa", borderBottom: "1px solid #e4e9ef" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px 18px" }}>
              {dado("Data", dataConc.toLocaleDateString("pt-BR"))}
              {dado("Hora", dataConc.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }))}
              {dado("Cliente", v.cliente)}
              {dado("Vistoriador", v.vistoriador)}
            </div>
          </div>

          {/* ===== RESUMO: selos por seção, ou medição Ringelmann ===== */}
          <div style={{ padding: "18px 28px", borderBottom: "1px solid #e4e9ef" }}>
            <SectionTitle>Resumo do laudo</SectionTitle>

            {ring ? (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px 18px", marginBottom: 14 }}>
                  {dado("Densidade média", `${ring.media}%`)}
                  {dado("Nível máximo aferido", ring.maior ? `Ringelmann ${ring.maior}` : "—")}
                  {dado("Limite adotado", `Ringelmann ${limiteRing}`)}
                  {dado("Fotos avaliadas", ring.n)}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {NIVEIS_RINGELMANN.map(n => {
                    const qtd = ring.porNivel[n.n] || 0;
                    const acima = n.n > limiteRing;
                    return (
                      <div key={n.n} style={{ flex: 1, textAlign: "center", border: `1px solid ${qtd && acima ? "#fecaca" : "#e4e9ef"}`, borderRadius: 8, overflow: "hidden", background: qtd && acima ? "#fef2f2" : "#fff" }}>
                        <div style={{ height: 22, background: n.cor }} />
                        <div style={{ padding: "5px 2px" }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: qtd ? "#1a2230" : "#c2c9d2" }}>{qtd}</div>
                          <div style={{ fontSize: 9, color: "#8a94a3" }}>Nível {n.n} · {n.pct}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                {Object.keys(bySecao).map(sec => {
                  const ok = secaoStatus[sec] === "aprovado";
                  return (
                    <div key={sec} style={{ flex: "1 1 120px", textAlign: "center", padding: "12px 8px", borderRadius: 10, background: ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${ok ? "#bbf7d0" : "#fecaca"}` }}>
                      <div style={{ width: 34, height: 34, margin: "0 auto 6px", borderRadius: "50%", background: ok ? "#16a34a" : "#dc2626", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18 }}>{ok ? "✓" : "!"}</div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: "#374151", lineHeight: 1.25 }}>{sec}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ===== DADOS DO VEÍCULO / DA MEDIÇÃO ===== */}
          <div style={{ padding: "18px 28px", borderBottom: "1px solid #e4e9ef" }}>
            <SectionTitle>{tipo.porFoto ? "Dados da medição" : "Dados do veículo"}</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px 18px", marginTop: 12 }}>
              {tipo.campos
                .filter(c => c.k !== "limite")
                .map(c => (
                  <div key={c.k} style={c.largo ? { gridColumn: "span 2" } : undefined}>
                    {dado(c.label, c.extra ? extra[c.k] : v[c.k])}
                  </div>
                ))}
            </div>
            {tipo.referencia && (
              <div style={{ fontSize: 10, color: "#8a94a3", marginTop: 12 }}>{tipo.referencia}</div>
            )}
          </div>

          {/* ===== SEÇÕES DE ITENS ===== */}
          {Object.entries(bySecao).map(([sec, list]) => {
            // itens longos (checklist SSMA) ficam ilegíveis em duas colunas
            const longos = list.some(it => (it.item || "").length > 60);
            return (
              <div key={sec} style={{ padding: "16px 28px", borderBottom: "1px solid #e4e9ef" }}>
                <SectionTitle>{sec}</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: longos ? "1fr" : "1fr 1fr", gap: "6px 24px", marginTop: 10 }}>
                  {list.map(it => (
                    <div key={it.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, fontSize: 12.5, borderBottom: "1px solid #f1f4f7", paddingBottom: 4, breakInside: "avoid" }}>
                      <span style={{ color: "#4b5563", lineHeight: 1.4 }}>{it.item}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 4, color: "#fff", background: resultColor(it.resultado), whiteSpace: "nowrap", marginTop: 1 }}>{it.resultado}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {tipo.legenda && Object.keys(bySecao).length > 0 && (
            <div style={{ padding: "10px 28px", borderBottom: "1px solid #e4e9ef", fontSize: 10, color: "#8a94a3" }}>
              Legenda: {tipo.legenda}
            </div>
          )}

          {/* ===== OBSERVAÇÕES ===== */}
          {v.observacoes && (
            <div style={{ padding: "16px 28px", borderBottom: "1px solid #e4e9ef" }}>
              <SectionTitle>Observações do vistoriador</SectionTitle>
              <div style={{ fontSize: 12.5, color: "#4b5563", whiteSpace: "pre-wrap", marginTop: 8 }}>{v.observacoes}</div>
            </div>
          )}

          {/* ===== REGISTRO FOTOGRÁFICO ===== */}
          {fotos.length > 0 && (
            <div style={{ padding: "16px 28px", borderBottom: "1px solid #e4e9ef" }}>
              <SectionTitle>Registro fotográfico</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 12 }}>
                {fotos.map(f => (
                  <div key={f.id} style={{ breakInside: "avoid" }}>
                    <div style={{ position: "relative" }}>
                      <img src={f.url} alt={f.legenda} style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 6, border: "1px solid #e4e9ef", display: "block" }} />
                      {f.nivel && (
                        <div style={{
                          position: "absolute", top: 6, right: 6, padding: "2px 7px", borderRadius: 4,
                          fontSize: 9.5, fontWeight: 800, color: "#fff",
                          background: f.nivel > limiteRing ? "#dc2626" : "#16a34a",
                        }}>NÍVEL {f.nivel} · {f.densidade ?? f.nivel * 20}%</div>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: "#5b6472", textAlign: "center", marginTop: 4, textTransform: "uppercase", letterSpacing: .3 }}>{f.legenda}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== TERMO TÉCNICO ===== */}
          <div style={{ padding: "16px 28px", borderBottom: "1px solid #e4e9ef" }}>
            <SectionTitle>Termo técnico</SectionTitle>
            <div style={{ fontSize: 10.5, color: "#6b7280", lineHeight: 1.6, marginTop: 8, textAlign: "justify" }}>{tipo.termo || TERMO}</div>
          </div>

          {/* ===== ASSINATURA + QR ===== */}
          <div className="bloco-fecho">
          <div style={{ padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ borderTop: "1px solid #1a2230", width: 260, paddingTop: 6, marginTop: 30 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{EMPRESA.responsavel}</div>
                <div style={{ fontSize: 11, color: "#5b6472" }}>{EMPRESA.respFuncao}</div>
                <div style={{ fontSize: 11, color: "#5b6472" }}>{EMPRESA.fantasia}</div>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <img src={qrSrc} alt="QR de validação" style={{ width: 96, height: 96, border: "1px solid #e4e9ef", borderRadius: 6 }} />
              <div style={{ fontSize: 9, color: "#8a94a3", marginTop: 4, maxWidth: 110 }}>Valide este laudo online</div>
            </div>
          </div>

          {/* ===== RODAPÉ ===== */}
          <div style={{ padding: "12px 28px", background: "#0f2942", color: "#9fb3c8", fontSize: 10, lineHeight: 1.5, display: "flex", justifyContent: "space-between" }}>
            <span>{EMPRESA.fantasia} · {EMPRESA.cnpj}</span>
            <span>Laudo Nº {numeroLaudo} · {dataConc.toLocaleDateString("pt-BR")}</span>
          </div>
          </div>
        </div>
      </div>
      <style>{`
        @media print {
          .noprint { display: none !important }
          body { background: #fff }
          #laudo { box-shadow: none; border-radius: 0 }
          @page { margin: 8mm }
          /* sem isto o navegador descarta os fundos dos selos e badges */
          #laudo, #laudo * { -webkit-print-color-adjust: exact; print-color-adjust: exact }
          /* assinatura e rodape nao se separam, e o rodape nao fica orfao */
          .bloco-fecho { break-inside: avoid; page-break-inside: avoid }
          #laudo img { break-inside: avoid }
        }
      `}</style>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 3, height: 15, background: "#14b8a6", borderRadius: 2 }} />
      <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: .8, color: "#0f2942", textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}

/* =====================  helpers  ===================== */
function TelaMsg({ titulo, texto, cor }) {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: cor || C.ink }}>{titulo}</div>
        <div style={{ color: C.sub, marginTop: 8, maxWidth: 340 }}>{texto}</div>
      </div>
    </div>
  );
}

const card = { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 };
const h2 = { margin: "0 0 14px", fontSize: 19 };
const btnPrimary = { padding: "10px 16px", borderRadius: 10, border: "none", background: C.brand, color: "#04110c", fontWeight: 700, fontSize: 14, cursor: "pointer" };
const btnGhost = { padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.line}`, background: "transparent", color: C.ink, fontWeight: 600, fontSize: 14, cursor: "pointer" };

/* =====================  ROTEADOR  ===================== */
export default function App() {
  const [hash, setHash] = useState(window.location.hash || "#/");
  const [logado, setLogado] = useState(!!auth.atual);
  useEffect(() => {
    const on = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  let view;
  const mV = hash.match(/^#\/v\/(.+)$/);
  const mL = hash.match(/^#\/laudo\/(.+)$/);
  // a key força remontagem ao trocar de link: sem ela o formulario reaproveita
  // o estado da vistoria anterior (respostas, passo e a tela de "ja enviada")
  if (mV) view = <Formulario key={mV[1]} token={decodeURIComponent(mV[1])} />;
  else if (mL) view = <Laudo key={mL[1]} id={mL[1]} />;
  else if (logado) view = <Painel aoSair={() => setLogado(false)} />;
  else view = <Login aoEntrar={() => setLogado(true)} />;

  const isLaudo = !!mL;
  return (
    <div style={{
      minHeight: "100vh",
      background: isLaudo ? "#f3f5f8" : C.bg,
      color: C.ink,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      {view}
    </div>
  );
}
