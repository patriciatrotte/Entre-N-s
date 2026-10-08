import { PrePostQuestion } from '../types/game';

// 3 questions in Pre-Test, matched with 3 equivalent situations in Post-Test
export const PRE_TEST_QUESTIONS: PrePostQuestion[] = [
  {
    id: 'pre-1',
    situation: 'Durante a elaboração de uma nota técnica conjunta, você descobre que um colega omitiu deliberadamente um parecer desfavorável para acelerar a aprovação da verba para o setor.',
    type: 'fundamentada',
    options: [
      {
        id: 'opt-pre-1-a',
        text: 'Não intervir, pois a responsabilidade é de quem assina como autor principal e a verba beneficiará a unidade.',
        feedback: 'Inadequado. Ocultar parecer técnico desfavorável fere o princípio da moralidade e transparência da administração pública.'
      },
      {
        id: 'opt-pre-1-b',
        text: 'Conversar com o colega e com a chefia imediata para reincluir o parecer técnico fundamentado antes do envio.',
        isOptimal: true,
        feedback: 'Correto. A lealdade institucional exige a verdade técnica nos autos públicos, preservando a higidez do processo.'
      },
      {
        id: 'opt-pre-1-c',
        text: 'Publicar o parecer em grupos de mensagens externas para forçar o cancelamento do projeto.',
        feedback: 'Inadequado. O vazamento externo indevido de autos quebra o sigilo funcional e compromete o devido processo.'
      }
    ],
    pedagogicalReflection: 'No serviço público, a integridade da informação precede qualquer conveniência departamental de captação de recursos.'
  },
  {
    id: 'pre-2',
    situation: 'Um servidor experiente frequentemente interrompe com deboches sutis colegas novatos quando estes sugerem ideias inovadoras na plenária da equipe.',
    type: 'fundamentada',
    options: [
      {
        id: 'opt-pre-2-a',
        text: 'Interromper a conduta desrespeitosa e posicionar que todas as manifestações devem ser tratadas com urbanidade e escuta.',
        isOptimal: true,
        feedback: 'Correto. A urbanidade e o respeito à dignidade de todos os servidores são obrigações de convivência inegociáveis.'
      },
      {
        id: 'opt-pre-2-b',
        text: 'Relevar e dizer aos novatos que "no começo é assim mesmo e faz parte da casca do serviço público".',
        feedback: 'Inadequado. Naturalizar microagressões e constrangimentos afasta novos talentos e adoece as relações institucionais.'
      },
      {
        id: 'opt-pre-2-c',
        text: 'Instigar outros colegas a fazerem o mesmo com o veterano quando ele falar.',
        feedback: 'Inadequado. Responder à falta de respeito com retaliação coletiva gera uma espiral destrutiva na equipe.'
      }
    ],
    pedagogicalReflection: 'A cultura de respeito é cultivada pelo repúdio inequívoco e sereno a desqualificações no instante em que ocorrem.'
  },
  {
    id: 'pre-3',
    situation: 'Faltando 10 minutos para o fim do expediente, um cidadão em situação de vulnerabilidade chega sem os documentos exigidos, mas precisando de orientação emergencial.',
    type: 'reflexiva',
    options: [
      {
        id: 'opt-pre-3-a',
        text: 'Realizar uma triagem preliminar de orientação, entregar a lista clara de exigências e agendar um horário preferencial para o retorno.',
        isOptimal: true,
        feedback: 'Excelente equilíbrio entre humanização do acolhimento e limites sustentáveis de atendimento da unidade.'
      },
      {
        id: 'opt-pre-3-b',
        text: 'Recusar o atendimento imediato indicando a porta sem prestar nenhuma explicação prévia.',
        feedback: 'Legalismo árido que gera desamparo e enfraquece a confiança da sociedade no serviço público.'
      },
      {
        id: 'opt-pre-3-c',
        text: 'Dar andamento irregular ao processo mesmo sem documentos para resolver a angústia do cidadão.',
        feedback: 'Embora movido por compaixão, abrir mão de requisitos legais essenciais invalida o ato administrativo e cria insegurança jurídica.'
      }
    ],
    pedagogicalReflection: 'A equidade no atendimento público articula empatia, clareza didática e respeito aos limites da lei.'
  }
];

export const POST_TEST_QUESTIONS: PrePostQuestion[] = [
  {
    id: 'post-1',
    situation: 'Ao revisar uma prestação de contas de evento da instituição, você nota que comprovantes fiscais com valores rasurados foram anexados por um colega para cobrir o teto orçamentário.',
    type: 'fundamentada',
    options: [
      {
        id: 'opt-post-1-a',
        text: 'Deixar passar para não expor o colega, já que o dinheiro foi de fato usado no evento.',
        feedback: 'Inadequado. Comprovantes com rasuras ou inconsistências violam o rigor da contabilidade pública e podem configurar irregularidade gravíssima.'
      },
      {
        id: 'opt-post-1-b',
        text: 'Apontar formalmente a inconformidade ao fiscal responsável para saneamento tempestivo e obtenção das notas originais.',
        isOptimal: true,
        feedback: 'Correto. A probidade exige que despesas públicas sejam comprovadas com lisura e autenticidade inquestionáveis.'
      },
      {
        id: 'opt-post-1-c',
        text: 'Confrontar o colega no refeitório chamando-o de corrupto perante os demais.',
        feedback: 'Inadequado. O dever funcional exige canais formais e respeito aos ritos administrativos, sem justiçamento pessoal.'
      }
    ],
    pedagogicalReflection: 'A prestação de contas pública não admite informalidades; sua higidez protege todos os envolvidos e a sociedade.'
  },
  {
    id: 'post-2',
    situation: 'Em um grupo oficial de trabalho, um colaborador publica comentários depreciativos ironizando a idade de uma servidora que teve dúvidas sobre um novo sistema digital.',
    type: 'fundamentada',
    options: [
      {
        id: 'opt-post-2-a',
        text: 'Marcar com firmeza no próprio canal que etarismo e desrespeito são inaceitáveis e oferecer apoio técnico à colega.',
        isOptimal: true,
        feedback: 'Correto. A demarcação de limites de convivência deve ser pública para proteger a colega e estabelecer a regra de civilidade da equipe.'
      },
      {
        id: 'opt-post-2-b',
        text: 'Não comentar nada para evitar "gerar climão" e esperar que a chefia leia a mensagem quando puder.',
        feedback: 'Inadequado. A omissão das testemunhas valida e normaliza o preconceito no ambiente coletivo.'
      },
      {
        id: 'opt-post-2-c',
        text: 'Fazer piada semelhante com quem escreveu para que ele "sinta na pele".',
        feedback: 'Inadequado. Práticas retaliatórias apenas multiplicam o desrespeito institucional.'
      }
    ],
    pedagogicalReflection: 'A maturidade de uma equipe pública é medida pelo cuidado mútuo na inclusão de todas as gerações de trabalhadores.'
  },
  {
    id: 'post-3',
    situation: 'No encerramento das atividades do balcão, um cidadão com deficiência auditiva procura esclarecimento sobre um recurso administrativo prestes a expirar.',
    type: 'reflexiva',
    options: [
      {
        id: 'opt-post-3-a',
        text: 'Utilizar recursos de comunicação escrita acessível, conferir o prazo fatal e garantir o protocolo de tempestividade antes de liberar o cidadão.',
        isOptimal: true,
        feedback: 'Excelente. O acesso à justiça e a direitos fundamentais exige adaptações razoáveis e sensibilidade com prazos decadenciais.'
      },
      {
        id: 'opt-post-3-b',
        text: 'Encaminhar o cidadão para o dia seguinte sem registrar a data de comparecimento tempestivo.',
        feedback: 'Inadequado. Fazer o cidadão perder um prazo administrativo por barreira de acessibilidade viola a legislação de inclusão.'
      },
      {
        id: 'opt-post-3-c',
        text: 'Prometer julgar o recurso a favor do cidadão no dia seguinte sem conferir os autos.',
        feedback: 'Inadequado. Acolhimento e acessibilidade não devem ser confundidos com promessas indevidas de mérito decisório.'
      }
    ],
    pedagogicalReflection: 'Garantir acessibilidade comunicacional é parte do dever de equidade do serviço público com a sociedade.'
  }
];
