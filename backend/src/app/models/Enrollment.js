import { Model, Sequelize } from 'sequelize';
import { addMonths } from 'date-fns';

import Plan from './Plan';

class Enrollment extends Model {
  static init(sequelize) {
    super.init(
      {
        student_id: Sequelize.INTEGER,
        plan_id: Sequelize.INTEGER,
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
        price: Sequelize.DECIMAL(10, 2),
      },
      {
        sequelize,
      }
    );
    this.addHook('beforeSave', async enrollment => {
      const plan = await Plan.findByPk(enrollment.plan_id);
      enrollment.end_date = addMonths(enrollment.start_date, plan.duration);
      enrollment.price = plan.duration * plan.price;
    });
    return this;
  }

  static associate(models) {
    this.Student = this.belongsTo(models.Student, {
      foreignKey: 'student_id',
      as: 'student',
    });
    this.Plan = this.belongsTo(models.Plan, {
      foreignKey: 'plan_id',
      as: 'plan',
    });
  }
}

export default Enrollment;
