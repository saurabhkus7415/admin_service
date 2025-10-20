module.exports = (sequelize, DataTypes) => {
  const MisStudent = sequelize.define('mis_student', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    class: { type: DataTypes.STRING, allowNull: false },
    academic_year: { type: DataTypes.STRING, allowNull: false },
    student_id: { type: DataTypes.STRING, allowNull: false, unique: true },
    school_code: { type: DataTypes.STRING, allowNull: false }
  }, { underscored: true, timestamps: true });

  return MisStudent;
};
