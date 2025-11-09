const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisePool } = require('../config/database');
const jwtConfig = require('../config/jwt');

exports.login = async ({ role, email, password }) => {
  if (!email || !password) throw new Error('Email and password are required');

  const userType = role?.toLowerCase() === 'admin' ? 'admin' : 'ms';
  const loginId = email.trim();
  // Phone number login can be added similarly if needed

  // Step 1: Get user details from DB
  const [existingRows] = await promisePool.execute(
    'SELECT reg_id, password, user_type, is_approved, is_deleted FROM registration_tbl WHERE (email = ? OR mobile_no = ?) AND is_deleted = 0 AND is_approved = 1',
    [loginId, loginId]
  );
 
  if (!existingRows.length) throw new Error('Invalid loginID or password');

  const userRecord = existingRows[0];
  const hashedPassword = userRecord.password; // Stored hashed password

  // Step 2: Validate password first
  const isValid = await bcrypt.compare(password, hashedPassword);

  if (!isValid) throw new Error('Invalid password');

  // Step 3: Check if user is approved
  if (userRecord.is_approved !== 1) {
    throw new Error('Your account is not yet approved. Please contact the administrator for approval.');
  }

  // Deleted users check
  if (userRecord.is_deleted === 1) {
    throw new Error('Your account has been deactivated. Please contact support for assistance.');
  }

  // Step 4: Validate role/user_type match
  if (userRecord.user_type !== userType) {
    const requestedRoleName = userType === 'admin' ? 'Administrator' : 'Medical Staff';
    throw new Error(`You are not authorized to login as ${requestedRoleName}. Please contact the administrator.`);
  }

  // Step 5: Call SP with the same hash (only after all validations pass)
  const [spResult] = await promisePool.execute('CALL sp_validate_login(?, ?, ?)', [
    userType,
    loginId,
    hashedPassword
  ]);
 

  const rows = spResult[0] || spResult;
  if (!rows.length) throw new Error('Invalid email or password');

  const userRow = rows[0];

  // Step 6: Fetch full record
const [dbRows] = await promisePool.execute(
  'SELECT reg_id, login_id, user_type, full_name, email, profile_img_path FROM registration_tbl WHERE reg_id = ?',
  [userRow.reg_id]
);
  const user = dbRows[0];


  // Step 7: JWT
  const token = jwt.sign(
    {
      userId: user.reg_id,
      email: user.email,
      userType: user.user_type,
    },
    jwtConfig.secret || process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: jwtConfig.expiresIn || '1d' }
  );

  console.log('✅ Login success for', user.email);

  return {
    token,
    user: {
      id: user.reg_id,
      name: user.full_name,
      email: user.email,
      userType: user.user_type,
      role: user.user_type === 'admin' ? 'Administrator' : 'Medical Staff',
      profilePic: user.profile_img_path || '/uploads/default_profile.png',
    },
  };
};


/**
 * Step 1: Validate user and security question answers
 */
exports.validateForgotPassword = async ({
  email,
  mobileNo,
  favoriteFood,
  childhoodNickname,
  motherMaidenName,
  hobbies
}) => {
  if (!email || !mobileNo) {
    throw new Error('Email and mobile number are required');
  }

  const [spResult] = await promisePool.execute(
    'CALL sp_checkupdate_forgotpassword(?, ?, ?, ?, ?, ?)',
    [
      email.trim(),
      mobileNo.trim(),
      favoriteFood?.trim() || null,
      childhoodNickname?.trim() || null,
      motherMaidenName?.trim() || null,
      hobbies?.trim() || null
    ]
  );

  const rows = spResult[0] || spResult;
  const result = rows[0];

  if (!result) throw new Error('Unexpected database response');

  if (result.status === 'INVALID EMAIL OR MOBILE NO') {
    return {
      success: false,
      message: 'Invalid email or mobile number.',
      data: result
    };
  }

  if (result.status === 'FAIL') {
    return {
      success: false,
      message: `Only ${result.matched_answers} answer(s) matched. Please try again.`,
      data: result
    };
  }

  // PASS case
  return {
    success: true,
    message: 'Validation successful. You may proceed to reset your password.',
    data: {
      reg_id: result.v_reg_id || result.reg_id,
      matched_answers: result.matched_answers,
      status: result.status
    }
  };
};


/**
 * Step 2: Reset password using reg_id and status (PASS)
 */

exports.resetPassword = async ({ regId, newPassword, confirmPassword, status }) => {
  
  if (newPassword !== confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  if (status !== 'PASS') {
    throw new Error('You are not authorized to reset the password.');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Call SP
  const [spResult] = await promisePool.execute('CALL sp_update_password(?, ?, ?)', [
    regId,
    hashedPassword,
    status
  ]);

  // Check response
  const rows = spResult[0] || spResult;
  const result = rows?.[0] || {};

  if (result.status === 'INVALID USER') {
    return {
      success: false,
      message: 'Invalid user ID or operation not permitted.'
    };
  }

  return {
    success: true,
    message: 'Password updated successfully. You can now log in.'
  };
};