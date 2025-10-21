module.exports = (sequelize, DataTypes) => {
  const ApprovalRequest = sequelize.define('approval_request', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    entity_type: { type: DataTypes.ENUM('student', 'teacher'), allowNull: false },
    data_fields: { type: DataTypes.JSON, allowNull: false },
    status: { type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'), defaultValue: 'Pending' },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    requested_by: { type: DataTypes.STRING, allowNull: true }
  }, { underscored: true, timestamps: true });

  return ApprovalRequest;
};
