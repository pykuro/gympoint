import Mail from '../../lib/Mail';

class HelpOrderAnswerMail {
  get key() {
    return 'HelpOrderAnswerMail';
  }

  async handle({ data }) {
    const { help_order } = data;

    await Mail.sendMail({
      to: `${help_order.student.name} <${help_order.student.email}>`,
      subject: 'Resposta de Pedido de Auxílio',
      template: 'helporderanswer',
      context: {
        student: help_order.student.name,
        question: help_order.question,
        answer: help_order.answer,
      },
    });
  }
}
export default new HelpOrderAnswerMail();
