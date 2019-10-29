import { Model, Sequelize } from 'sequelize';

class Plan extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        duration: Sequelize.INTEGER,
        price: Sequelize.DECIMAL(10, 2),
        // deleted_at: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );
    return this;
  }
}

export default Plan;
