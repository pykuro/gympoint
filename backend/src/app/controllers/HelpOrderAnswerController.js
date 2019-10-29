import * as Yup from 'yup';

import Student from '../models/Student';
import HelpOrder from '../models/HelpOrder';
import HelpOrderAnswerMail from '../jobs/HelpOrderAnswerMail';
import Queue from '../../lib/Queue';

class HelpOrderAnswerController {
  async index(req, res) {
    const help_orders = await HelpOrder.findAll({
      where: {
        answer_at: null,
      },
      order: ['created_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
    return res.json(help_orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const help_order = await HelpOrder.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
    if (!help_order) {
      return res.status(400).json({ error: 'Question does not exist' });
    }

    await help_order.update({
      answer: req.body.answer,
      answer_at: new Date(),
    });

    /* notify student */
    await Queue.add(HelpOrderAnswerMail.key, {
      help_order,
    });

    return res.json(help_order);
  }
}
export default new HelpOrderAnswerController();
