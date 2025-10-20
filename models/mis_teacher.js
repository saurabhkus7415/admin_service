module.exports = (sequelize, DataTypes) => {
  const MisTeacher = sequelize.define('mis_teacher', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    teacher_id: { type: DataTypes.STRING, allowNull: false, unique: true },
    academic_year: { type: DataTypes.STRING, allowNull: false },
    school_code: { type: DataTypes.STRING, allowNull: false },
    designation: { type: DataTypes.STRING, allowNull: false }
  }, { underscored: true, timestamps: true });

  return MisTeacher;
};
