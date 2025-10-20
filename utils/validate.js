function validateStudent(r) {
  const errors = [];
  if (!r.name || !String(r.name).trim()) errors.push('name is required');
  if (!r.class || !String(r.class).trim()) errors.push('class is required');
  if (!r.academic_year || !String(r.academic_year).trim()) errors.push('academic_year is required');
  if (!r.student_id || !String(r.student_id).trim()) errors.push('student_id is required');
  if (!r.school_code || !String(r.school_code).trim()) errors.push('school_code is required');
  return { ok: errors.length === 0, errors };
}

function validateTeacher(r) {
  const errors = [];
  if (!r.name || !String(r.name).trim()) errors.push('name is required');
  if (!r.teacher_id || !String(r.teacher_id).trim()) errors.push('teacher_id is required');
  if (!r.academic_year || !String(r.academic_year).trim()) errors.push('academic_year is required');
  if (!r.school_code || !String(r.school_code).trim()) errors.push('school_code is required');
  if (!r.designation || !String(r.designation).trim()) errors.push('designation is required');
  return { ok: errors.length === 0, errors };
}

module.exports = { validateStudent, validateTeacher };
