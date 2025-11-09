const { promisePool } = require('../config/database');

exports.addUserRole = async ({
  regId,
  isPresent = null,
  passEntry = null,
  isDeleted = null,
  isAdmin = null,
  remark = null,
  sewaLocationId = null,
  samagamHeldIn = null
}) => {
  let connection;
  try {
    connection = await promisePool.getConnection();

    const boolToTinyInt = (val) => (val === null ? null : val ? 1 : 0);

    const [resultSets] = await connection.query(
      `CALL sp_update_master_user_role(?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        regId.toString(), // supports "1" or "1,2,3"
        boolToTinyInt(isPresent),
        boolToTinyInt(passEntry),
        boolToTinyInt(isDeleted),
        boolToTinyInt(isAdmin),
        remark,
        sewaLocationId,
        samagamHeldIn
      ]
    );

    const affected = resultSets[0]?.[0]?.affected_rows || 0;

    return {
      success: affected > 0,
      message:
        affected > 0
          ? `User role updated successfully for ${affected} record(s)`
          : 'No record updated. Please check user ID or data.',
      affectedRows: affected
    };
  } catch (error) {
    console.error('❌ approve Service Error:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};
