'use strict';
// Termos de uso. {email}, {devices} e {days} são preenchidos com a configuração do site.
// Revisar antes de publicar mudanças na política comercial.
const terms = {
  pt: {
    title: 'Termos de uso | Botânora', h1: 'Termos de uso',
    lead: 'As regras simples para usar o site e os guias da Botânora.',
    sections: [
      ['O site', 'O conteúdo da Botânora é educativo. As informações sobre chás, ervas e benefícios não substituem orientação médica ou nutricional. Gestantes, lactantes, pessoas com condições de saúde ou em uso de medicamentos devem consultar um profissional antes de mudar hábitos.'],
      ['Os guias em PDF', 'Os guias são produtos digitais no formato PDF. Ao comprar, você recebe uma licença de uso pessoal: pode ler, imprimir para uso próprio e guardar cópias nos seus aparelhos. Não é permitido revender, compartilhar publicamente, redistribuir ou publicar o conteúdo, no todo ou em parte.'],
      ['Pagamento', 'O pagamento é processado pela Cakto, no checkout dela. A Cakto cobra uma taxa de serviço de R$ 0,99 no checkout. A Botânora não recebe nem armazena os dados do seu cartão.'],
      ['Entrega e acesso', 'Depois da confirmação do pagamento, o acesso é enviado ao e-mail usado na compra. Na biblioteca da Botânora você baixa os PDFs. Para entrar em outro aparelho, peça um código de acesso com o mesmo e-mail. Cada e-mail pode ficar conectado em até {devices} aparelhos, e cada conexão dura {days} dias.'],
      ['Cancelamento e reembolso', 'Pedidos de cancelamento e reembolso seguem o Código de Defesa do Consumidor e as regras do checkout da Cakto. Para pedir, escreva para {email} informando o e-mail da compra.'],
      ['Links de afiliado', 'Algumas recomendações de utensílios levam a lojas parceiras. Se você comprar por esses links, a Botânora pode receber uma comissão, sem custo extra para você. Preço, estoque e entrega são responsabilidade da loja.'],
      ['Privacidade', 'O uso dos seus dados está descrito na política de privacidade.'],
      ['Contato', 'Dúvidas sobre estes termos ou sobre uma compra: {email}.']
    ]
  },
  en: {
    title: 'Terms of use | Botânora', h1: 'Terms of use',
    lead: 'The simple rules for using the Botânora site and guides.',
    sections: [
      ['The site', 'Botânora content is educational. Information about teas, herbs and benefits does not replace medical or nutritional advice. Anyone pregnant, breastfeeding, with a health condition or taking medication should talk to a professional before changing habits.'],
      ['The PDF guides', 'The guides are digital products in PDF format. When you buy one, you get a personal-use licence: you may read it, print it for your own use and keep copies on your devices. You may not resell, share publicly, redistribute or publish the content, in whole or in part.'],
      ['Payment', 'Payment is processed by Cakto, on its checkout. Cakto charges a R$ 0.99 service fee at checkout. Botânora never receives or stores your card details.'],
      ['Delivery and access', 'Once payment is confirmed, access is sent to the email used to buy. You download the PDFs from the Botânora library. To sign in on another device, request an access code with the same email. Each email can stay signed in on up to {devices} devices, and each sign-in lasts {days} days.'],
      ['Cancellations and refunds', 'Cancellation and refund requests follow the Brazilian Consumer Protection Code and the Cakto checkout rules. To ask for one, write to {email} with the email you used to buy.'],
      ['Affiliate links', 'Some gear recommendations lead to partner stores. If you buy through those links, Botânora may earn a commission at no extra cost to you. Price, stock and delivery are the store\'s responsibility.'],
      ['Privacy', 'How your data is used is described in the privacy policy.'],
      ['Contact', 'Questions about these terms or a purchase: {email}.']
    ]
  }
};

module.exports = { terms };
