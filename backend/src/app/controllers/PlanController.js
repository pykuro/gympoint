import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const plans = await Plan.findAll({
      // where: { deleted_at: null },
      order: ['duration'],
      attributes: ['id', 'title', 'duration', 'price'],
    });
    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .required()
        .positive()
        .integer(),
      price: Yup.number()
        .required()
        .positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const planExists = await Plan.findOne({
      where: {
        duration: req.body.duration,
        // deleted_at: null
      },
    });

    if (planExists) {
      return res.status(400).json({ error: 'Plan already exists' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .required()
        .positive()
        .integer(),
      price: Yup.number()
        .required()
        .positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not exists' });
    }

    // if (plan.deleted_at) {
    //  return res.status(400).json({ error: 'Plan not exists' });
    // }

    const { duration } = req.body;
    if (duration !== plan.duration) {
      const planExists = await Plan.findOne({ where: { duration } });

      if (planExists) {
        return res
          .status(400)
          .json({ error: 'Plan with informed duration already exists' });
      }
    }

    const { id, title, price } = await plan.update(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not exists' });
    }

    // if (plan.deleted_at) {
    //  return res.status(400).json({ error: 'Plan not exists' });
    // }

    // plan.deleted_at = new Date();
    // plan.save();
    // return res.json(plan);
    await plan.destroy();

    return res.json({ message: 'Plan deleted' });
  }
}

export default new PlanController();
