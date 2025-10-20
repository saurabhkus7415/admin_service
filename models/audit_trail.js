module.exports = (sequelize, DataTypes) => {
  const AuditTrail = sequelize.define(
    "audit_trail",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      action: {
        type: DataTypes.ENUM("upload", "approve", "reject", "edit"),
        allowNull: false,
      },
      entity_type: {
        type: DataTypes.ENUM("student", "teacher", "approval_request"),
        allowNull: false,
      },
      entity_id: { type: DataTypes.JSON, allowNull: true },
      user_id: { type: DataTypes.TEXT, allowNull: true },
      remarks: { type: DataTypes.TEXT, allowNull: true },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    { underscored: true, timestamps: false }
  );

  return AuditTrail;
};
