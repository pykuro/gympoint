import * as Yup from 'yup';
import { parseISO } from 'date-fns';
import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';
import Student from '../models/Student';
import EnrollmentMail from '../jobs/EnrollmentMail';
import Queue from '../../lib/Queue';

class EnrollmentController {
  async index(req, res) {
    const enrollments = await Enrollment.findAll({
      order: ['created_at'],
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
    return res.json(enrollments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .required()
        .positive()
        .integer(),
      plan_id: Yup.number()
        .required()
        .positive()
        .integer(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const plan = await Plan.findByPk(req.body.plan_id);
    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist' });
    }

    const student = await Student.findByPk(req.body.student_id);
    if (!student) {
      return res.status(400).json({ error: 'Student does not exist' });
    }

    const enrollment = await Enrollment.create({
      start_date: parseISO(req.body.start_date),
      student_id: req.body.student_id,
      plan_id: req.body.plan_id,
    });

    /* notify student */
    await Queue.add(EnrollmentMail.key, {
      enrollment,
      student,
      plan,
    });

    return res.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .required()
        .positive()
        .integer(),
      plan_id: Yup.number()
        .required()
        .positive()
        .integer(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exist' });
    }

    const { plan_id, student_id, start_date } = req.body;
    if (enrollment.plan_id !== plan_id) {
      const planExists = await Plan.findByPk(plan_id);
      if (!planExists) {
        return res.status(400).json({ error: 'Plan does not exist' });
      }
    }

    if (enrollment.student_id !== student_id) {
      const studentExists = await Student.findByPk(student_id);
      if (!studentExists) {
        return res.status(400).json({ error: 'Student does not exist' });
      }
    }
    await enrollment.update({
      student_id,
      plan_id,
      start_date: parseISO(start_date),
    });

    return res.json(enrollment);
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment not exists' });
    }

    enrollment.destroy();

    return res.json({ message: 'Enrollment deleted' });
  }
}

export default new EnrollmentController();
