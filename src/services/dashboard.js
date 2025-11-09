// src/services/dashboard.service.js
const { promisePool } = require('../config/database');

/**
 * Fetch overall dashboard statistics.
 */
exports.getDashboardStats = async (userId) => {
  // Step 1: Fetch overall stats
  const [overallResults] = await promisePool.execute('CALL sp_get_dashboard_stats()');

  // Step 2: Fetch department-wise stats
  const [deptResults] = await promisePool.execute('CALL sp_dashboard_dept_count()');

  // Extract the result sets
  const totalUsers = overallResults[0]?.[0]?.total_users || 0;
  const recentRegistrations = overallResults[1]?.[0]?.recent_registrations || 0;
  const departmentStats = deptResults[0] || [];

  // Step 3: Transform data for frontend
  const transformedStats = departmentStats.map((dept, index) => ({
    title: dept.title || `Department ${index + 1}`,
    value: dept.value || 0,
    color: getDepartmentColor(dept.title || `Department ${index + 1}`),
  }));

  // Step 4: Combine both SP results
  return {
    totalUsers,
    recentRegistrations,
    stats: transformedStats,
    departmentStats: transformedStats,
    lastUpdated: new Date().toISOString(),
    fetchedBy: userId,
  };
};


// Helper function to assign colors to departments
function getDepartmentColor(departmentName) {
  const colors = [
    '#EC4899', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#06B6D4',
    '#EF4444', '#84CC16', '#F97316', '#6366F1', '#EC4899', '#14B8A6'
  ];
  
  const hash = departmentName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Fetch full user profile by ID.
 */
exports.getUserProfile = async (userId) => {
  const [results] = await promisePool.execute('CALL sp_get_user_profile(?)', [userId]);
  const users = results[0] || [];

  if (users.length === 0) throw new Error('User not found');
  const user = users[0];

  // Support both 'dob' and 'date_of_birth' column names
  const birthDate = user.dob || user.date_of_birth
    ? new Date(user.dob || user.date_of_birth)
    : null;

  const age = birthDate
    ? new Date().getFullYear() - birthDate.getFullYear() -
      (new Date() < new Date(birthDate.setFullYear(new Date().getFullYear())) ? 1 : 0)
    : null;

  const location = user.city_name && user.state_name
    ? `${user.city_name}, ${user.state_name}`
    : user.state_name || 'Not specified';

  return {
    id: user.reg_id,
    name: user.full_name,
    title: user.title || 'Mr/Ms',
    email: user.email,
    role: user.user_type === 'admin' ? 'Medical Administrator' : 'Medical Sewadar',
    qualification: user.qualification_name || 'Not specified',
    department: user.department_name || 'Not assigned',
    profileImage: user.profile_img_path || null,
    joinedDate: user.created_datetime,
    location,
    mobile: user.mobile_no,
    address: user.address || 'Not provided',
    age,
    gender: user.gender === 1 ? 'Male' : user.gender === 2 ? 'Female' : 'Other',
    dateOfBirth: birthDate ? birthDate.toISOString().split('T')[0] : null, 
    experience: user.total_exp || 0,
    previousSewa: user.prev_sewa_perform || 'None',
    recommendedBy: user.recom_by || 'Not specified',
  };
};


/**
 * Fetch all users (for admin dashboard) with filters and pagination.
 */
// exports.getAllUsers = async (filters) => {
//   const { search = '', department = '', userType = '', page = 1, limit = 50 } = filters;
//   const offset = (page - 1) * limit;

//   const [[usersResult], [countResult]] = await Promise.all([
//     promisePool.execute('CALL sp_get_users_filtered(?, ?, ?, ?, ?)', [
//       search || null,
//       department || null,
//       userType || null,
//       limit,
//       offset,
//     ]),
//     promisePool.execute('CALL sp_get_users_count_filtered(?, ?, ?)', [
//       search || null,
//       department || null,
//       userType || null,
//     ]),
//   ]);

//   const users = usersResult[0] || [];
//   const totalUsers = countResult[0]?.[0]?.total || 0;
//   const totalPages = Math.ceil(totalUsers / limit);

//   return {
//     users: users.map((u) => ({
//       id: u.reg_id,
//       name: u.full_name,
//       title: u.title,
//       email: u.email,
//       role: u.user_type === 'admin' ? 'Administrator' : 'Medical Staff',
//       department: u.department_name || 'Not assigned',
//       qualification: u.qualification_name || 'Not specified',
//       mobile: u.mobile_no,
//       location:
//         u.city_name && u.state_name
//           ? `${u.city_name}, ${u.state_name}`
//           : 'Not specified',
//       joinedDate: u.created_datetime,
//       isPresent: u.is_present === 1,
//       hasPass: u.pass_entry === 1,
//       experience: u.total_exp || 0,
//       profileImage: u.profile_img_path || null,
//     })),
//     pagination: {
//       currentPage: page,
//       totalPages,
//       totalUsers,
//       limit,
//       hasNext: page < totalPages,
//       hasPrevious: page > 1,
//     },
//   };
// };

/**
 * Update user profile.
 */
exports.updateUserProfile = async (userId, data) => {
  const { fullName, email, mobileNo, address, stateId, cityId, departmentId, qualificationId } = data;

  if (email) {
    const [check] = await promisePool.execute('CALL sp_check_email_for_update(?, ?)', [email, userId]);
    if (check[0]?.[0]?.email_exists > 0) throw new Error('Email address already taken');
  }

  const [result] = await promisePool.execute('CALL sp_update_user_profile(?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    userId,
    fullName || null,
    email || null,
    mobileNo || null,
    address || null,
    stateId || null,
    cityId || null,
    departmentId || null,
    qualificationId || null,
  ]);

  const affected = result[0]?.affected_rows || 0;
  if (!affected) throw new Error('User not found or no changes made');
  return true;
};

/**
 * Update presence (Admin only).
 */
exports.updateUserPresence = async (userId, isPresent, passEntry) => {
  const [result] = await promisePool.execute('CALL sp_update_user_presence(?, ?, ?)', [
    userId,
    isPresent || null,
    passEntry || null,
  ]);

  const affected = result[0]?.affected_rows || 0;
  if (!affected) throw new Error('User not found');
  return true;
};

/**
 * Fetch admin dashboard summary.
 */
exports.getAdminSummary = async () => {
  const [summaryResult] = await promisePool.execute('CALL sp_get_admin_summary()');
  const summary = summaryResult[0]?.[0] || {};

  return {
    totalUsers: summary.totalUsers || 0,
    recentRegistrations: summary.recentRegistrations || 0,
    presentUsers: summary.presentUsers || 0,
    usersWithPass: summary.usersWithPass || 0,
    adminUsers: summary.adminUsers || 0,
    medicalStaff: summary.medicalStaff || 0,
    lastUpdated: new Date().toISOString(),
  };
};
