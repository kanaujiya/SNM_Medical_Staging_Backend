const bcrypt = require("bcryptjs");
const { promisePool } = require("../config/database");
const { sanitizeInput } = require("../utils/sanitize");
const { validators } = require("../utils/validators");

/**
 * ============================================================
 * 🔽 Get dropdown data (states, departments, qualifications)
 * ============================================================
 */
exports.getDropdownData = async () => {
  let connection;
  try {
    connection = await promisePool.getConnection();

    console.log('Fetching dropdown data: states, departments, qualifications, sewa locations');

    // Get states
    const [statesResult] = await connection.execute('CALL sp_get_state_details(?)', [null]);

    // Get departments
    const [departmentsResult] = await connection.execute('CALL sp_get_department_by_id(?)', [0]);

    // Get qualifications
    const [qualificationsResult] = await connection.execute('CALL sp_get_qualification_by_id(?)', [0]);

    // Get sewa locations
    const [sewaLocationsResult] = await connection.execute('CALL sp_get_sewalocation_by_id(?)', [0]);

    return {
      states: statesResult[0] || [],
      departments: departmentsResult[0] || [],
      qualifications: qualificationsResult[0] || [],
      sewaLocations: sewaLocationsResult[0] || []
    };

  } catch (error) {
    console.error('Dropdown Data Error:', error);
    throw new Error('Failed to fetch dropdown data');
  } finally {
    if (connection) connection.release();
  }
};

/**
 * ============================================================
 * 🏙️ Get cities based on stateId
 * ============================================================
 */
exports.getCitiesByState = async (stateId) => {
  const connection = await promisePool.getConnection();
  try {
    const [cities] = await connection.execute("CALL sp_get_city_details(?)", [stateId]);
    return cities[0] || [];
  } catch (error) {
    console.error("City Fetch Error:", error);
    throw new Error("Unable to fetch cities for the given state");
  } finally {
    connection.release();
  }
};

/**
 * ============================================================
 * 📧 Check if an email already exists
 * ============================================================
 */
exports.checkEmailExists = async (email) => {
  const cleanEmail = sanitizeInput(email.toLowerCase());
  if (!validators.email(cleanEmail)) throw new Error("Invalid email format");

  const [rows] = await promisePool.execute(
    "SELECT reg_id FROM registration_tbl WHERE email = ? AND is_deleted = 0",
    [cleanEmail]
  );
  return rows.length > 0;
};

/**
 * ============================================================
 * 🧾 Register user (without files)
 * ============================================================
 */
exports.registerUser = async (body) => {
  const {
    fullName,
    email,
    password,
    confirmPassword,
    mobileNo,
    dateOfBirth,
    address,
    stateId,
    cityId,
    departmentId,
    qualificationId,
    userType = "ms",
    title = "Mr",
    gender = 1,
    experience = 0,
    lastSewa = "",
    recommendedBy = "",
    samagamHeldIn = "",
    isAaproved = 0 // 
  } = body;

  // ✅ Sanitize inputs
  const data = {
    fullName: sanitizeInput(fullName) || "",
    email: sanitizeInput(email?.toLowerCase()) || "",
    mobileNo: sanitizeInput(mobileNo) || "",
    address: sanitizeInput(address) || "",
    userType: sanitizeInput(userType) || "ms",
    title: sanitizeInput(title) || "Mr",
    lastSewa: sanitizeInput(lastSewa) || "",
    recommendedBy: sanitizeInput(recommendedBy) || "",
    samagamHeldIn: sanitizeInput(samagamHeldIn) || "",
  };

  // ✅ Validation;
  if (password !== confirmPassword) throw new Error("Passwords do not match");
  
  // ✅ Check duplicates
  const [[existingEmail], [existingMobile]] = await Promise.all([
    promisePool.execute(
      "SELECT reg_id FROM registration_tbl WHERE email = ? AND is_deleted = 0",
      [data.email]
    ),
    promisePool.execute(
      "SELECT reg_id FROM registration_tbl WHERE mobile_no = ? AND is_deleted = 0",
      [data.mobileNo]
    ),
  ]);

  if (existingEmail.length > 0) throw new Error("Email already registered");
  if (existingMobile.length > 0) throw new Error("Mobile number already registered");

  // ✅ Prepare data
  const hashedPassword = await bcrypt.hash(password, 60);
  const loginId = `${data.userType}_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 5)}`;

  const genderValue =
    typeof gender === "string"
      ? gender.toLowerCase() === "female"
        ? 2
        : gender.toLowerCase() === "other" || gender.toLowerCase() === "others"
        ? 3
        : 1
      : gender;

  const paramArr = [
    "insert",
    0,
    data.userType,
    loginId,
    data.title,
    data.fullName,
    data.email,
    hashedPassword,
    data.mobileNo,
    dateOfBirth,
    genderValue,
    data.address,
    parseInt(stateId) || 0,
    parseInt(cityId) || 0,
    parseInt(qualificationId) || 0,
    parseInt(departmentId) || 0,
    1,
    1,
    "",
    "",
    1,
    0,
    1,
    "",
    parseFloat(experience) || 0.0,
    data.lastSewa,
    data.recommendedBy,
    data.samagamHeldIn,
    0,
    "", "", "", "",
    parseInt(isAaproved) || 0 
  ];

  const connection = await promisePool.getConnection();
  try {
    await connection.execute(
      `CALL sp_save_user_profile(
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`,
      paramArr
    );

    return {
      success: true,
      message: "Registration successful!",
      data: { email: data.email, fullName: data.fullName, userType: data.userType, loginId },
    };
  } catch (error) {
    console.error("Registration Error:", error);
    throw new Error(error.message || "Registration failed, please try again.");
  } finally {
    connection.release();
  }
};

/**
 * ============================================================
 * 🧾 Register user
 * ============================================================
 */
exports.createUser = async (data = {}, filePaths = {}) => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid registration data provided");
  }

  // Destructure fields in correct SP/paramArr order
  const {
    userType = "ms",                // 3
    loginId = "",                   // 4  (generated if blank)
    title = "Mr",                   // 5
    fullName = "",                  // 6
    email = "",                     // 7
    password = "",                  // 8
    confirmPassword = "",           // 
    mobileNo = "",                  // 9
    dateOfBirth = "",               // 10
    gender = 1,                     // 11
    address = "",                   // 12
    stateId = 0,                    // 13
    cityId = 0,                     // 14
    qualificationId = 0,            // 15
    departmentId = 0,               // 16
    availableDayId = 1,             // 17
    shiftTimeId = 1,                // 18
    isPresent = 0,                  // 21
    passEntry = 0,                  // 22
    sewaLocationId = 1,             // 23
    remark = "",                    // 24
    experience = 0,                 // 25
    lastSewa = "",                  // 26
    recommendedBy = "",             // 27
    samagamHeldIn = "",             // 28
    isDeleted = 0,                  // 29
    favoriteFood = "",              // 30
    childhoodNickname = "",         // 31
    motherMaidenName = "",          // 32
    hobbies = "",                   // 33
    isAaproved = 0                  // 34 (for p_is_approved)
  } = data;

  // Validate required fields
  const requiredFields = [
    "fullName", "email", "password", "confirmPassword", "mobileNo", "dateOfBirth"
  ];
  const missing = requiredFields.filter((f) => !data[f]);
  if (missing.length) throw new Error(`Missing required fields: ${missing.join(", ")}`);
  if (password !== confirmPassword) throw new Error("Passwords do not match");

 

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Generate loginId if not provided
  const generatedLoginId =
    loginId || `${userType}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Gender normalization (numeric for SP)
  let genderValue = 1;
  if (typeof gender === "string") {
    const lower = gender.toLowerCase();
    if (lower === "female") genderValue = 2;
    else if (lower === "other" || lower === "others") genderValue = 3;
  } else {
    genderValue = gender;
  }

  const paramArr = [
    "insert",                          // 1 p_action
    0,                                 // 2 p_id
    userType,                          // 3 p_user_type
    generatedLoginId,                  // 4 p_login_id
    title,                             // 5 p_title
    fullName,                          // 6 p_full_name
    email,                             // 7 p_email
    hashedPassword,                    // 8 p_password
    mobileNo,                          // 9 p_mobile_no
    dateOfBirth,                       // 10 p_dob
    genderValue,                       // 11 p_gender
    address,                           // 12 p_address
    parseInt(stateId) || 0,            // 13 p_state_id
    parseInt(cityId) || 0,             // 14 p_city_id
    parseInt(qualificationId) || 0,    // 15 p_qualification_id
    parseInt(departmentId) || 0,       // 16 p_department_id
    parseInt(availableDayId) || 1,     // 17 p_available_day_id
    parseInt(shiftTimeId) || 1,        // 18 p_shifttime_id
    filePaths.profileImagePath || "",  // 19 p_profile_img_path
    filePaths.certificatePath || "",   // 20 p_certificate_doc_path
    parseInt(isPresent) || 0,          // 21 p_is_present
    parseInt(passEntry) || 0,          // 22 p_pass_entry
    parseInt(sewaLocationId) || 1,     // 23 p_sewa_location_id
    remark,                            // 24 p_remark
    parseFloat(experience) || 0.0,     // 25 p_total_exp
    lastSewa,                          // 26 p_prev_sewa_perform
    recommendedBy,                     // 27 p_recom_by
    samagamHeldIn,                     // 28 p_samagam_held_in
    parseInt(isDeleted) || 0,          // 29 p_is_deleted
    favoriteFood,                      // 30 p_favorite_food
    childhoodNickname,                 // 31 p_childhood_nickname
    motherMaidenName,                  // 32 p_mother_maiden_name
    hobbies,                           // 33 p_hobbies
    parseInt(isAaproved) || 0          // 34 p_is_approved
  ];

  for (let i = 0; i < paramArr.length; i++) {
    if (paramArr[i] === undefined) paramArr[i] = null;
  }

  try {
    await promisePool.execute(
      `CALL sp_save_user_profile(
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`,
      paramArr
    );

    return {
      success: true,
      message: "User registered successfully!",
      data: {
        fullName,
        email,
        userType,
        loginId: generatedLoginId,
        profileImage: filePaths.profileImagePath || "",
        certificate: filePaths.certificatePath || "",
        isAaproved: parseInt(isAaproved) || 0
      }
    };
  } catch (error) {
    console.error("Registration Error:", error);
    throw new Error(error.message || "Registration failed, please try again.");
  }
};
