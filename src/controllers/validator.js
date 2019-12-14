const validator= require('validator');
/**
 * Checks if string has at least one white space character
 * @param {string} str The string to validate.
 * @return {boolean} True if valid, False if invalid.
 */
function hasWhiteSpace(str) {
  return str.indexOf(' ') !== -1;
}

/**
   * Checks if inserted admin-username valid, ie. username consists of
   * @param {string} str The string to validate.
   * @return {boolean} True if valid, False if invalid.
   */
function validateUsername(str) {
  // eslint-disable-next-line no-useless-escape
  return (/^[a-zA-Z0-9-_\-\@\_]{6,9}$/.test(str) && !hasWhiteSpace(str));
}

/**
   * Checks if inserted string has a special character
   * @param {string} str The string to validate.
   * @param {string} ignore ignores specific characters.
   * @return {boolean} True if valid, False if invalid.
   */
function hasSpecialCharacter(str, ignore) {
  const specialChars ='!@#$%^&*()~+=`\'"/?\\|<>,.;:{}[]-_';
  const arrSpecialChar=specialChars.split('');
  for (let i=0; i<ignore.length; i++) {
    if (arrSpecialChar.indexOf(ignore[i])!=-1) {
      arrSpecialChar.splice(arrSpecialChar.indexOf(ignore[i]), 1);
    }
  }
  const specialRegex =new RegExp('[\\'+ arrSpecialChar.join('\\')+']');
  return specialRegex.test(str);
}

/**
   * Checks if inserted email is valid.
   * @param {string} email The string to validate.
   * @return {boolean} True if valid, False if invalid.
   */
function validEmailAddress(email) {
  return validator.isEmail(email);
}

/**
   * Checks if inserted password is valid.
   * @param {string} password The string to validate.
   * @return {boolean} True if valid, False if invalid.
   */
function validPassword(password) {
  return (/^(?=.*[a-z])(?=.*[0-9])(?=.*\W).*$/.test(password) && password.trim().length > 6);
}

/**
   * Checks if inserted phone number is valid.
   * @param {string} phonenumber The string to validate.
   * @return {boolean} True if valid, False if invalid.
   */
function validPhoneNumber(phonenumber) {
  return (phonenumber && /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s/0-9]*$/.test(phonenumber) && phonenumber.length>6);
}

/**
   * Checks if inserted full name is valid.
   * @param {string} fullname The string to validate.
   * @return {boolean} True if valid, False if invalid.
   */
function validFullName(fullname) {
  return (/^[a-zA-Z_ ]+$/.test(fullname) && fullname.trim().length < 250);
}

/**
   * Checks if inserted Skill name name is valid.
   * @param {string} skillname The string to validate.
   * @return {boolean} True if valid, False if invalid.
   */
function validateSkillOrStatus(skillname) {
  return (skillname.length > 0 && skillname.length <= 250 );
}

/**
   * Checks if inserted Skill description is valid.
   * @param {string} description The string to validate.
   * @return {boolean} True if valid, False if invalid.
   */
function validateDescription(description) {
  return description.trim().length < 250;
}

/**
   * Checks if inserted value is in the set of possible values
   * @param {string} yearsOfExperience The string to validate.
   * @return {boolean} True if valid, False if invalid.
   */
function validateYearsOfExperience(yearsOfExperience) {
  return ['0-2', '2-5', '5-10', '10-15', '15+'].includes(yearsOfExperience);
}

/**
   * Checks if inserted value is in the set of possible values
   * @param {string} seniorityLevel The string to validate.
   * @return {boolean} True if valid, False if invalid.
   */
function validateSeniorityLevel(seniorityLevel) {
  return ['entry level', 'junior level', 'mid-senior level', 'executive level'].includes(seniorityLevel.toLowerCase());
}

/**
   * Checks if inserted value is in the set of possible values
   * @param {string} educationLevel The string to validate.
   * @return {boolean} True if valid, False if invalid.
   */
function validateEducationLevel(educationLevel) {
  return educationLevel && ['n/a', 'high school degree', 'bachelors degree', 'masters degree', 'doctoral degree'].includes(educationLevel.toLowerCase());
}

/**
   * @param {string} educationLevel
   * @param {string} education
   * @return {boolean}
   */
function validateEducation(educationLevel, education) {
  if (!education) {
    return false;
  }
  if (educationLevel === 'N/A') {
    if (education) {
      return false;
    }
    return true;
  }
  if (!education.graduationDate || (Date.now()/1000 < education.graduationDate && !education.undergrad)) {
    return false;
  }
  if (!education.graduationDate || (Date.now()/1000 > education.graduationDate && education.undergrad)) {
    return false;
  }
  return true;
}

/**
   * Checks if inserted value is in the set of possible values
   * @param {string} employmentTime The string to validate.
   * @return {boolean} True if valid, False if invalid.
   */
function validateEmploymentTime(employmentTime) {
  return ['full time job', 'part time job', 'projects'].includes(employmentTime.toLowerCase());
}

/**
   * Checks if inserted value is in the set of possible values
   * @param {string} monthlySalary The string to validate.
   * @return {boolean} True if valid, False if invalid.
   */
function validateMonthlySalary(monthlySalary) {
  return ['0-1000', '1000-2000', '2000-3000', '3000-5000', '5000-10000', '10000+'].includes(monthlySalary);
}

/**
   * Checks if inserted value is valid website url
   * @param {string} website The string to validate.
   * @return {boolean} True if valid, False if invalid.
   */
function validateWebsite(website) {
  return validator.isURL(website);
}

/**
   * Checks if inserted value is in the set of possible values
   * @param {string} gender
   * @return {boolean}
   */
function validateGender(gender) {
  return ['Male', 'Female', 'Prefer not to disclose'].includes(gender);
}

/**
     * Checks if inserted value is in the set of possible values
     * @param {string} languageLevel
     * @return {boolean}
     */
function validateLanguageLevel(languageLevel) {
  return ['Fluent', 'Good', 'Bad'].includes(languageLevel);
}

/**
     * Checks if inserted value is in the set of possible values
     * @param {string} language
     * @return {boolean}
     */
function validateLanguage(language) {
  return ['English', 'French', 'German', 'Spanish'].includes(language);
}

/**
     * @param {string} website
     * @return {boolean}
     */
function validateGithubProfile(website) {
  return website.startsWith('https://github.com');
}

/**
     * @param {string} website
     * @return {boolean}
     */
function validateLinkedInProfile(website) {
  return website.startsWith('https://www.linkedin.com/in/');
}

/**
     * @param {string} lookingFor
     * @return {boolean}
     */
function validateLookingFor(lookingFor) {
  return ['Fulltime job', 'Parttime job', 'Projects'].includes(lookingFor);
}

/**
     * @param {string} address
     * @return {boolean}
     */
function validateSimpleAddress(address) {
  return address && address.split(', ').length == 2;
}

/**
     * @param {string} workExperience
     * @return {boolean}
     */
function validateWorkExperience(workExperience) {
  if (!workExperience) {
    return false;
  }
  if (typeof workExperience !== Array) {
    return false;
  }
  for (const oneExperience of workExperience) {
    if (!oneExperience.title || !oneExperience.company || !oneExperience.description) {
      return false;
    }
  }
  return true;
}

/**
     * @param {string} certifications
     * @return {boolean}
     */
function validateCertifications(certifications) {
  if (!certifications) {
    return false;
  }
  if (typeof certifications !== Array) {
    return false;
  }
  for (const certification of certifications) {
    if (!certification.title || !certification.details) {
      return false;
    }
  }
  return true;
}

module.exports = {
  hasWhiteSpace,
  validateUsername,
  validFullName,
  validPhoneNumber,
  hasSpecialCharacter,
  validPassword,
  validEmailAddress,
  validateSkillOrStatus,
  validateDescription,
  validateYearsOfExperience,
  validateSeniorityLevel,
  validateEducationLevel,
  validateEducation,
  validateEmploymentTime,
  validateMonthlySalary,
  validateWebsite,
  validateGender,
  validateLanguage,
  validateLanguageLevel,
  validateGithubProfile,
  validateLinkedInProfile,
  validateLookingFor,
  validateSimpleAddress,
  validateWorkExperience,
  validateCertifications,
};

