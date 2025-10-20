module.exports = function makeAudit({ AuditTrail }) {
  return async function logAudit({ action, entity_type, entity_id=null, user_id=null, remarks=null, transaction=null }) {
    const payload = { action, entity_type, entity_id, user_id, remarks };
    if (transaction) return AuditTrail.create(payload, { transaction });
    return AuditTrail.create(payload);
  };
};
