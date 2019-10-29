import * as Yup from 'yup';
import Student from '../models/Student';
import HelpOrder from '../models/HelpOrder';

class HelpOrderController {
  async index(req, res) {
    const help_orders = await HelpOrder.findAll({
      where: {
        student_id: req.params.id,
      },
      order: ['created_at'],
    });
    return res.json(help_orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const studentExists = await Student.findByPk(req.params.id);
    if (!studentExists) {
      return res.status(400).json({ error: 'Student does not exist' });
    }

    const help_order = await HelpOrder.create({
      student_id: req.params.id,
      question: req.body.question,
    });
    return res.json(help_order);
  }
}
export default new HelpOrderController();
