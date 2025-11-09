const { promisePool } = require('../config/database');
const ExcelJS = require('exceljs');

const toCamelCase = (obj) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    const camelKey = key
      .toLowerCase()
      .replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    newObj[camelKey] = obj[key];
  });
  return newObj;
};

exports.getSewaLocations = async () => {
  let connection;
  try {
    connection = await promisePool.getConnection();
    const [resultSets] = await connection.execute(
      `CALL sp_get_sewalocation_by_id(?)`,
      [0] // 0 => get all sewa locations
    );
    const results = resultSets[0] || resultSets;
    return results.map(toCamelCase);
  } catch (error) {
    console.error('❌ getSewaLocations Error:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

exports.masterSearch = async ({
  searchKey = null,
  departmentId = null,
  qualificationId = null,
  sewaLocationId = null,
  cityId = null,
  stateId = null,
  isPresent = null,
  passEntry = null,
  page = 1,
  limit = 10,
  sortBy = 'fullName',
  sortOrder = 'ASC'
}) => {
  let connection;

  try {
    connection = await promisePool.getConnection();

    // ✅ Call SP with 10 parameters (as per your definition)
    const [resultSets] = await connection.query(
      'CALL sp_master_search(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        searchKey,
        departmentId,
        qualificationId,
        sewaLocationId,
        cityId,
        stateId,
        isPresent,
        passEntry,
        page,
        limit
      ]
    );

    /**
     * ✅ MySQL returns 2 result sets from your SP:
     *  - resultSets[0] → actual paginated data
     *  - resultSets[1] → total count (from SELECT FOUND_ROWS())
     */
    const results = resultSets[0] || [];
    const totalRecords = resultSets[1]?.[0]?.TOTAL_RECORDS || 0;

    // ✅ Convert column names to camelCase
    const formattedResults = results.map((row) => {
      const formatted = {};
      Object.keys(row).forEach((key) => {
        const camelKey = key
          .toLowerCase()
          .replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        formatted[camelKey] = row[key];
      });

      // Normalize "YES"/"NO" fields to 1/0 for UI binding
      formatted.isPresent = formatted.isPresent === 'YES' ? 1 : 0;
      formatted.passEntry = formatted.passEntry === 'YES' ? 1 : 0;

      return formatted;
    });

    // ✅ Build pagination object
    const totalPages = Math.ceil(totalRecords / limit);
    const currentCount = formattedResults.length;

    const pagination = {
      current: page,
      total: totalPages,
      count: currentCount,
      totalRecords
    };

    // ✅ Optional: apply frontend sorting (if MySQL doesn’t do it)
    formattedResults.sort((a, b) => {
      const fieldA = (a?.[sortBy] ?? '').toString().toLowerCase();
      const fieldB = (b?.[sortBy] ?? '').toString().toLowerCase();
      if (!fieldA && !fieldB) return 0;
      if (!fieldA) return 1;
      if (!fieldB) return -1;
      return sortOrder === 'ASC'
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    });

    return {
      data: formattedResults,
      pagination
    };
  } catch (error) {
    console.error('Master Search Service Error:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

// ✅ Export to Excel
exports.exportToExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Master Search Data');

  if (!data.length) return null;

  sheet.columns = Object.keys(data[0]).map((key) => ({
    header: key,
    key,
    width: 25
  }));

  data.forEach((row) => sheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

exports.approveUser = async (regId) => {
  try {
    // ✅ Call your stored procedure
    const [resultSets] = await promisePool.execute(
      `CALL sp_update_IsApproved(?, ?)`,
      [regId, 1] // 1 means approved (true)
    );

    const affected =
      resultSets?.affectedRows ||
      resultSets?.[0]?.affected_rows ||
      0;

    return {
      success: affected > 0,
      message:
        affected > 0
          ? `User with ID ${regId} approved successfully`
          : `No record updated. Please check regId: ${regId}`,
      affectedRows: affected
    };
  } catch (error) {
    console.error('❌ approveUser Service Error:', error);
    throw error;
  }
};


// ✅ Update selected users' values
exports.updateSelectedUsers = async (userUpdates) => {
  const queries = userUpdates.map((u) =>
    promisePool.execute(
      `UPDATE registration_tbl 
       SET is_present = ?, pass_entry = ?, department_id = ?, qualification_id = ? 
       WHERE reg_id = ?`,
      [u.is_present, u.pass_entry, u.department_id, u.qualification_id, u.reg_id]
    )
  );

  await Promise.all(queries);
  return true;
};