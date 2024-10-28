const { sequelize } = require('./sequelize');

async function syncSequelize() {
    try {
        await sequelize.sync({ alter: false });
        console.log('Sequelize sync completed successfully.');
    } catch (error) {
        console.error('Sequelize sync failed:', error);
    }
}

module.exports = syncSequelize;