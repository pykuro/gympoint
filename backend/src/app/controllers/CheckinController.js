import { Op } from 'sequelize';
import { startOfDay, subDays } from 'date-fns';

import Student from '../models/Student';
import Checkin from '../models/Checkin';
import Enrollment from '../models/Enrollment';

class CheckinController {
  async index(req, res) {
    const { id } = req.params;

    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(400).json({ error: 'Student does not exist' });
    }

    const checkins = await Checkin.findAll({
      where: {
        student_id: id,
      },
      order: [['created_at', 'ASC']],
    });
    return res.json(checkins);
  }

  async store(req, res) {
    const { id } = req.params;

    // verifica se o aluno existe
    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(400).json({ error: 'Student does not exist' });
    }

    // verifica se existe matrícula no período
    const enrollmentExists = await Enrollment.findOne({
      where: {
        student_id: id,
        start_date: { [Op.lte]: new Date() },
        end_date: { [Op.gte]: new Date() },
      },
    });
    if (!enrollmentExists) {
      return res.status(400).json({ error: 'Enrollment not found' });
    }

    // verifica se há 5 checkins no período de 7dias
    const sevenDaysBefore = subDays(new Date(), 7);
    const countCheckins = await Checkin.count({
      where: {
        student_id: id,
        created_at: {
          [Op.between]: [startOfDay(sevenDaysBefore), new Date()],
        },
      },
    });
    if (countCheckins >= 5) {
      return res
        .status(400)
        .json({ error: 'You already did 5 checkins in the last 7 days' });
    }

    const checkin = await Checkin.create({
      student_id: id,
    });

    return res.json(checkin);
  }
}
export default new CheckinController();
