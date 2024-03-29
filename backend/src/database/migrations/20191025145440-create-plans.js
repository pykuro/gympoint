module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('plans', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      // duração em número de meses
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      // preço mensal do plano
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      // deleted_at: {
      //  type: Sequelize.DATE,
      // },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('plans');
  },
};
