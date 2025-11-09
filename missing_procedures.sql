-- Missing stored procedures for dashboard functionality
-- Run these in your MySQL database

USE snm_dispensary;

-- Procedure to get state details
DELIMITER ;;
CREATE PROCEDURE sp_get_state_details(IN p_country_id VARCHAR(20))
BEGIN
    SELECT id, state_name, country_id
    FROM state_tbl
    WHERE is_deleted = 0
    AND (p_country_id IS NULL OR p_country_id = '' OR country_id = p_country_id)
    ORDER BY state_name;
END ;;
DELIMITER ;

-- Procedure to get department by ID
DELIMITER ;;
CREATE PROCEDURE sp_get_department_by_id(IN p_id BIGINT UNSIGNED)
BEGIN
    IF p_id = 0 THEN
        -- Get all departments
        SELECT id, department_name
        FROM department_tbl
        WHERE is_deleted = 0
        ORDER BY department_name;
    ELSE
        -- Get specific department
        SELECT id, department_name
        FROM department_tbl
        WHERE id = p_id AND is_deleted = 0;
    END IF;
END ;;
DELIMITER ;

-- Procedure to get qualification by ID
DELIMITER ;;
CREATE PROCEDURE sp_get_qualification_by_id(IN p_id BIGINT UNSIGNED)
BEGIN
    IF p_id = 0 THEN
        -- Get all qualifications
        SELECT id, qualification_name
        FROM qualification_tbl
        WHERE is_deleted = 0
        ORDER BY qualification_name;
    ELSE
        -- Get specific qualification
        SELECT id, qualification_name
        FROM qualification_tbl
        WHERE id = p_id AND is_deleted = 0;
    END IF;
END ;;
DELIMITER ;
