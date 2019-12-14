/* eslint-disable padded-blocks */
import 'regenerator-runtime/runtime';
const DeveloperPersistor = require('../persistence/developerpersistor');
const ObjectAlterer = require('../testhelpers/objectalterer');
const {APIStatus} = require('../../src/models/classes/DevResponse');
const Util = require('../../src/controllers/utilities');
require('../../src/models/JobApplication.js');
require('../../src/models/ProjectApplication.js');
require('../../src/models/Developer');
const Developer = require('../../src/models/MongooseHelper').getModel('DeveloperModel');
const {
  DeveloperController,
  RegisterDeveloperStatus,
  ResetPasswordStatus,
  AccountAuthenticationStatus,
  DeactivateDeveloperStatus,
  ReactivateDeveloperStatus,
  AddCapacityOfProjectsStatus,
  EditDeveloperSkillsStatus,
  VerifyDeveloperStatus,
  ViewProfileStatus,
  EditDeveloperStatus,
  ForgotPasswordStatus,
  SaveJobStatus,
  ViewSavedJobsStatus,
} = require('../../src/controllers/developercontroller');
const developerController = new DeveloperController(new DeveloperPersistor());
import Chance from 'chance';
import * as apihelper from "../../src/controllers/apihelper";
const chance = new Chance();
const STRINGPASS='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERPASS='0123456789';
const validAddDeveloperRequest = {
  username: 'demodev',
  password: 'Mypassword_1#',
  firstname: 'demo',
  lastname: 'dev',
  email: 'test@demo.test',
  phone: '+9613000000',
  address: 'Beirut, Lebanon',
  gender: 'Male',
  yearsOfExperience: '0-2',
  languages: [
    {
      name: 'English',
      level: 'Fluent',
    },
  ],
  seniorityLevel: 'entry level',
  lookingFor: 'Parttime job',
  educationLevel: 'Bachelors Degree',
  education: {
    major: 'Computer Science',
    undergrad: true,
    graduationDate: Date.now() + 12 * 30 * 24 * 3600,
  },
  skills: ['X', 'Y', 'Z'],
};

const validRegisterDeveloperRequestAlterer = new ObjectAlterer(
    validAddDeveloperRequest
);

test('Test that registering developer informs success when valid information is given.', (done) => {
  const mockSendEmail = jest.spyOn(Util, 'sendEmail')
      .mockImplementation(() => {});
  const promise = developerController.registerDeveloper(
      validAddDeveloperRequest
  );
  promise.then((devResponse) => {
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.SUCCESS);
    expect(devResponse.getStatus()).toBe(APIStatus.Successful);
    mockSendEmail.mockRestore();
    done();
  });
});

test('Test that registering developer fails when valid information is given but persistor cannot add.', (done) => {
  const mockPersistor = jest
      .spyOn(developerController.developerPersistor, 'persistDeveloper')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Adding Developer'))
      );
  const promise = developerController.registerDeveloper(
      validAddDeveloperRequest
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.PersistorStatus.CANNOT_ADD);
    mockPersistor.mockRestore();
    done();
  });
});

/**
 * requestWithUsernameContainingSpaces
 * @return {RegisterDeveloperRequest} request with username containing spaces.
 */
function requestWithUsernameContainingSpaces() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    username: 'in valid',
  });
}

test('Test that registering developer fails when request with invalid username containing spaces is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithUsernameContainingSpaces()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_USERNAME);
    done();
  });
});

/**
 * requestWithUsernameLargerThan9Characters
 * @return {RegisterDeveloperRequest} request with username larger than 9 characters.
 */
function requestWithUsernameLargerThan9Characters() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    username: 'iamhereeee',
  });
}

test('Test that registering developer fails when request with invalid username > 9 characters is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithUsernameLargerThan9Characters()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_USERNAME);
    done();
  });
});

/**
 * requestWithUsernameSmallerThan3Characters
 * @return {RegisterDeveloperRequest} request with username smaller than 3 characters.
 */
function requestWithUsernameSmallerThan3Characters() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    username: 'ab',
  });
}

test('Test that registering developer fails when information with username < 3 characters is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithUsernameSmallerThan3Characters()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_USERNAME);
    done();
  });
});

/**
 * requestWithPasswordLessThan6Characters
 * @return {RegisterDeveloperRequest} request with password less than 6 characters.
 */
function requestWithPasswordLessThan6Characters() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    password: '1_Rep',
  });
}

test('Test that registering developer fails when information with password < 6 characters is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithPasswordLessThan6Characters()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_PASSWORD);
    done();
  });
});

/**
 * requestWithPasswordHavingNoSpecialCharacters
 * @return {RegisterDeveloperRequest} request with password having no special characters.
 */
function requestWithPasswordHavingNoSpecialCharacters() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    password: '11Rep1',
  });
}

test('Test that registering developer fails when information with password no special character is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithPasswordHavingNoSpecialCharacters()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_PASSWORD);
    done();
  });
});

/**
 * requestWithPasswordHavingNoNumbers
 * @return {RegisterDeveloperRequest} request with password having no numbers.
 */
function requestWithPasswordHavingNoNumbers() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    password: 'Rep_ep',
  });
}

test('Test that registering developer fails when information with password with no number is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithPasswordHavingNoNumbers()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_PASSWORD);
    done();
  });
});

/**
 * requestWithPasswordHavingNoCapitalLetters
 * @return {RegisterDeveloperRequest} request with password having no capital numbers.
 */
function requestWithPasswordHavingNoCapitalLetters() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    password: 'rep_ep1',
  });
}

test('Test that registering developer fails when information with password no capital letter is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithPasswordHavingNoCapitalLetters()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_PASSWORD);
    done();
  });
});

/**
 * requestWithInvalidEmail
 * @return {RegisterDeveloperRequest} register developer request with invalid email.
 */
function requestWithInvalidEmail() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    email: 'test@test',
  });
}

test('Test that registering developer informs failure when information with invalid email is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidEmail()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_EMAIL);
    done();
  });
});

/**
 * requestWithInvalidPhoneNumber
 * @return {RegisterDeveloperRequest} register developer request with invalid phone number
 */
function requestWithInvalidPhoneNumber() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    phone: '2334',
  });
}

test('Test that registering developer informs failure when information with invalid phone number is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidPhoneNumber()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_PHONE_NUMBER);
    done();
  });
});

/**
 * requestWithFirstNameGreaterThan250Character
 * @return {RegisterDeveloperRequest} request to first name greater than 250 character.
 */
function requestWithFirstNameGreaterThan250Character() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    firstname:
      'XBn8e42Sxm2bu2g8W1xJiCF18eD3iigJ7i4JU6AvYzxlvvpPBOTc3g8KlY27WiQA3L33588GGxrhX75D7yTNcV5nfXVFDCaL5yC8C8OR04H1erE7WJta6vyI25Xl0bTEXe2SNAnOqu7ArJwy9YfzO5YL4q0d4PzmUwcr3CC3z2m7yUxNDwoO8eA1vrZ4tQjqg4C1YcuTapuen7rNJMa1Ad7GF6o0Kt3a9Fag3sEVpx9xWNfaGpYysXbi2CIfOdE9AoHKHceiayz1K3vbSb0sN43bi1N4d4xf6TtmE0mRMsQl6rC7FZLyPN9ouBKLm8jZBEU8527KQDHxkWEvi8SWLfIcgm00vBaFMGxOU9C7BGVhhMJuDP5iK1',
  });
}

test('Test that registering developer informs failure when information with invalid first name is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithFirstNameGreaterThan250Character()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_FIRST_NAME);
    done();
  });
});

/**
 * requestWithLastNameGreaterThan250Character
 * @return {RegisterDeveloperRequest} request to last name greater than 250 character.
 */
function requestWithLastNameGreaterThan250Character() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    lastname:
      'XBn8e42Sxm2bu2g8W1xJiCF18eD3iigJ7i4JU6AvYzxlvvpPBOTc3g8KlY27WiQA3L33588GGxrhX75D7yTNcV5nfXVFDCaL5yC8C8OR04H1erE7WJta6vyI25Xl0bTEXe2SNAnOqu7ArJwy9YfzO5YL4q0d4PzmUwcr3CC3z2m7yUxNDwoO8eA1vrZ4tQjqg4C1YcuTapuen7rNJMa1Ad7GF6o0Kt3a9Fag3sEVpx9xWNfaGpYysXbi2CIfOdE9AoHKHceiayz1K3vbSb0sN43bi1N4d4xf6TtmE0mRMsQl6rC7FZLyPN9ouBKLm8jZBEU8527KQDHxkWEvi8SWLfIcgm00vBaFMGxOU9C7BGVhhMJuDP5iK1',
  });
}

test('Test that registering developer informs failure when information with invalid last name is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithLastNameGreaterThan250Character()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_LAST_NAME);
    done();
  });
});

/**
 * requestWithInvalidGender
 * @return {RegisterDeveloperRequest}
 */
function requestWithInvalidGender() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    gender:
      'InvalidGender',
  });
}

test('Test that registering developer informs failure when information with invalid gender is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidGender()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_GENDER);
    done();
  });
});

/**
 * requestWithInvalidGender
 * @return {RegisterDeveloperRequest}
 */
function requestWithInvalidAddress() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    address:
      'I am an invalid address',
  });
}

test('Test that registering developer informs failure when information with invalid address is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidAddress()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_ADDRESS);
    done();
  });
});

/**
 * requestWithInvalidGender
 * @return {RegisterDeveloperRequest}
 */
function requestWithInvalidLanguage() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    languages: [
      {
        name: 'InvalidLanguage',
        level: 'Good',
      },
    ],
  });
}

test('Test that registering developer informs failure when information with invalid language is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidLanguage()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_LANGUAGE);
    done();
  });
});

/**
 * requestWithInvalidGender
 * @return {RegisterDeveloperRequest}
 */
function requestWithInvalidLanguageLevel() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    languages: [
      {
        name: 'French',
        level: 'InvalidLevel',
      },
    ],
  });
}

test('Test that registering developer informs failure when information with invalid language level is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidLanguageLevel()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_LANGUAGE_LEVEL);
    done();
  });
});

/**
 * requestWithInvalidGender
 * @return {RegisterDeveloperRequest}
 */
function requestWithInvalidSeniorityLevel() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    seniorityLevel: 'invalid level',
  });
}

test('Test that registering developer informs failure when information with invalid seniority level is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidSeniorityLevel()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_SENIORITY_LEVEL);
    done();
  });
});

/**
 * requestWithInvalidGender
 * @return {RegisterDeveloperRequest}
 */
function requestWithInvalidYearsOfExperience() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    yearsOfExperience: '10000',
  });
}

test('Test that registering developer informs failure when information with invalid years of experience is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidYearsOfExperience()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_YEARS_OF_EXPERIENCE);
    done();
  });
});

/**
 * requestWithInvalidLookingFor
 * @return {RegisterDeveloperRequest}
 */
function requestWithInvalidLookingFor() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    lookingFor: 'Bla Bla Bla',
  });
}

test('Test that registering developer informs failure when information with invalid looking for is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidLookingFor()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_LOOKING_FOR);
    done();
  });
});

/**
 * @return {RegisterDeveloperRequest}
 */
function requestWithInvalidEducationLevel() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    educationLevel: 'Bla Bla Bla',
  });
}

test('Test that registering developer informs failure when information with invalid education level is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidEducationLevel()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_EDUCATION_LEVEL);
    done();
  });
});

/**
 * @return {RegisterDeveloperRequest}
 */
function requestWithInvalidEducation() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    educationLevel: 'N/A',
    education: {
      major: 'Computer Science',
      undergrad: false,
    },
  });
}

test('Test that registering developer informs failure when information with invalid education is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidEducation()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_EDUCATION);
    done();
  });
});

/**
 * @return {RegisterDeveloperRequest}
 */
function requestWithInvalidEducationWithGraduateButGradDateGreaterThanToday() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    educationLevel: 'Bachelors Degree',
    education: {
      major: 'Computer Science',
      undergrad: false,
      graduationDate: Date.now()/1000 + 30 * 24 * 3600,
    },
  });
}

test('Test that registering developer informs failure when information with invalid education with graduate and invalid grad date is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidEducationWithGraduateButGradDateGreaterThanToday()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_EDUCATION);
    done();
  });
});

/**
 * @return {RegisterDeveloperRequest}
 */
function requestWithInvalidEducationWithUndergraduateButGradDateLessThanToday() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    educationLevel: 'Bachelors Degree',
    education: {
      major: 'Computer Science',
      undergrad: true,
      gradutionDate: Date.now() - 30 * 24 * 3600,
    },
  });
}

test('Test that registering developer informs failure when information with invalid education with undergraduate and invalid grad date is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidEducationWithUndergraduateButGradDateLessThanToday()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_EDUCATION);
    done();
  });
});

/**
 * @return {RegisterDeveloperRequest}
 */
function requestWithInvalidSkillsHavingNoSkills() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    skills: [],
  });
}

test('Test that registering developer informs failure when information with no skills is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidSkillsHavingNoSkills()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.NO_SKILLS);
    done();
  });
});

/**
 * @return {RegisterDeveloperRequest}
 */
function requestWithInvalidSkillsHavingTwoSkills() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    skills: ['A', 'B'],
  });
}

test('Test that registering developer informs failure when information with insufficient skills is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidSkillsHavingTwoSkills()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.INSUFFICIENT_SKILLS);
    done();
  });
});

/**
 * @return {RegisterDeveloperRequest}
 */
function requestWithInvalidGithubProfile() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    githubProfile: 'yguribiru',
  });
}

test('Test that registering developer informs failure when information with invalid github profile is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidGithubProfile()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_GITHUB_PROFILE_URL);
    done();
  });
});

/**
 * @return {RegisterDeveloperRequest}
 */
function requestWithInvalidLinkedInProfile() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    linkedInProfile: 'yguribiru',
  });
}

test('Test that registering developer informs failure when information with invalid linkedin profile is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidLinkedInProfile()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_LINKEDIN_PROFILE_URL);
    done();
  });
});

/**
 * @return {RegisterDeveloperRequest}
 */
function requestWithInvalidWorkExperience() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    workExperience: {
      invalidField: '',
      invalidField2: '',
    },
  });
}

test('Test that registering developer informs failure when information with invalid work experience is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidWorkExperience()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_WORK_EXPERIENCE);
    done();
  });
});

/**
 * @return {RegisterDeveloperRequest}
 */
function requestWithInvalidCertifications() {
  return validRegisterDeveloperRequestAlterer.alterObjectWithChanges({
    certifications: {
      invalidField: '',
      invalidField2: '',
    },
  });
}

test('Test that registering developer informs failure when information with invalid certifications is given.', (done) => {
  const promise = developerController.registerDeveloper(
      requestWithInvalidCertifications()
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_CERTIFICATIONS);
    done();
  });
});

test('Test that registering developer informs failure when skills with not available skills is given.', (done) => {
  const mockPersistor = jest
      .spyOn(developerController.developerPersistor, 'retrieveDeveloperSkill')
      .mockImplementation(() =>
        Promise.resolve(null)
      );
  const promise = developerController.registerDeveloper(
      validAddDeveloperRequest
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.ONE_OR_MORE_SKILLS_UNAVAILABLE);
    mockPersistor.mockRestore();
    done();
  });
});

test('Test that registering developer informs failure when persistor fails to search for skills is given.', (done) => {
  const mockPersistor = jest
      .spyOn(developerController.developerPersistor, 'retrieveDeveloperSkill')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persistor] Cannot search for skill'))
      );
  const promise = developerController.registerDeveloper(
      validAddDeveloperRequest
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.PersistorStatus.CANNOT_SEARCH_FOR_SKILL);
    mockPersistor.mockRestore();
    done();
  });
});

test('Test that registering developer fails when valid information is given but username is already taken.', (done) => {
  const mockPersistor = jest
      .spyOn(developerController.developerPersistor, 'isDeveloperPresent')
      .mockImplementation(() =>
        Promise.resolve(true)
      );
  const promise = developerController.registerDeveloper(
      validAddDeveloperRequest
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.USERNAME_USED);
    mockPersistor.mockRestore();
    done();
  });
});

test('Test that registering developer fails when valid request is given but finding username is failing.', (done) => {
  const mockPersistor = jest
      .spyOn(developerController.developerPersistor, 'isDeveloperPresent')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Finding Developer'))
      );
  const promise = developerController.registerDeveloper(
      validAddDeveloperRequest
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(RegisterDeveloperStatus.PersistorStatus.CANNOT_SEARCH_FOR_DEVELOPER);
    mockPersistor.mockRestore();
    done();
  });
});

test('Test that canLoginForSuccessfullAuthentication informs success and account status unlocked when developer has less than 3 failed attempts.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({
          username: 'testtest',
          isLocked: false,
          failedLoginAttempts: 0,
        })
      );
  const promise = developerController.canLoginForSuccessfullAuthentication(
      'testtest'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Successful);
    expect(devResponse.getMessage()).toBe(AccountAuthenticationStatus.ACCOUNT_UNLOCKED);
    mock.mockRestore();
    done();
  });
});

test('Test that notifyFailedAuthentication informs success and account status unlocked when authentication failure is informed and developer has less than 2 failed attempts.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({
          username: 'testtest',
          isLocked: false,
          failedLoginAttempts: 1,
        })
      );
  const promise = developerController.notifyFailedAuthentication(
      'testtest'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(AccountAuthenticationStatus.ACCOUNT_UNLOCKED);
    mock.mockRestore();
    done();
  });
});

test('Test that canLoginForSuccessfullAuthentication fails when user is not found', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve(null)
      );
  const promise = developerController.canLoginForSuccessfullAuthentication(
      'testtest'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(AccountAuthenticationStatus.ACCOUNT_NOT_FOUND);
    mock.mockRestore();
    done();
  });
});

test('Test that notifyFailedAuthentication fails when user is not found', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve(null)
      );
  const promise = developerController.notifyFailedAuthentication(
      'testtest'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(AccountAuthenticationStatus.ACCOUNT_NOT_FOUND);
    mock.mockRestore();
    done();
  });
});

test('Test that notifyFailedAuthentication fails when persistor can\'t search for developer', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Finding Developer'))
      );
  const promise = developerController.notifyFailedAuthentication(
      'testtest'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(AccountAuthenticationStatus.PersistorError.CANNOT_SEARCH);
    mock.mockRestore();
    done();
  });
});

test('Test that canLoginForSuccessfullAuthentication fails when persistor can\'t search for developer', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Finding Developer'))
      );
  const promise = developerController.canLoginForSuccessfullAuthentication(
      'testtest'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(AccountAuthenticationStatus.PersistorError.CANNOT_SEARCH);
    mock.mockRestore();
    done();
  });
});

test('Test that notifyFailedAuthentication informs success and account status semilocked when authentication failure is informed and developer has more than or equal 3 failed attempts.', (done)=>{
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({
          username: 'testtest',
          isLocked: false,
          failedLoginAttempts: 2,
        })
      );
  const promise = developerController.notifyFailedAuthentication('testtest');
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(AccountAuthenticationStatus.ACCOUNT_SEMILOCKED);
    mock.mockRestore();
    done();
  });
});

test('Test that notifyFailedAuthentication informs success and account status locked when developer has 5 failed attempts.', (done)=>{
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({
          username: 'testtest',
          isLocked: false,
          failedLoginAttempts: 4,
        })
      );
  const promise = developerController.notifyFailedAuthentication('testtest');
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(AccountAuthenticationStatus.ACCOUNT_LOCKED);
    expect(devResponse.getData()).toBe(process.env.supportEmail);
    mock.mockRestore();
    done();
  });
});

test('Test that can canLoginForSuccessfullAuthentication fails when account status is locked.', (done)=>{
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({
          username: 'testtest',
          isLocked: true,
        })
      );
  const promise = developerController.canLoginForSuccessfullAuthentication('testtest');
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(AccountAuthenticationStatus.ACCOUNT_LOCKED);
    expect(devResponse.getData()).toBe(process.env.supportEmail);
    mock.mockRestore();
    done();
  });
});

test('Test that admin generated reset password request succeeds with valid new password and valid token.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({
          reset_token: 'hchchc',
        })
      );
  const promise = developerController.resetPasswordByToken(
      'test@test.test',
      'hchchc',
      validAddDeveloperRequest.password,
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Successful);
    expect(devResponse.getMessage()).toBe(ResetPasswordStatus.SUCCESS);
    mock.mockRestore();
    done();
  });
});

test('Test that admin generated reset password request fails with valid new password and valid token but store developer fails.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'updateDeveloper')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Updating Developer'))
      );
  const promise = developerController.resetPasswordByToken(
      'test@test.test',
      'hchchc',
      validAddDeveloperRequest.password );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(ResetPasswordStatus.PersistorError.CANNOT_UPDATE);
    mock.mockRestore();
    done();
  });
});

test('Test that admin generated reset password request fails with invalid new password and valid token.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({
          reset_token: 'hchchc',
        })
      );
  const promise = developerController.resetPasswordByToken(
      validAddDeveloperRequest.email,
      'hchchc',
      requestWithPasswordHavingNoNumbers().password
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(ResetPasswordStatus.ValidationStatus.INVALID_PASSWORD);
    mock.mockRestore();
    done();
  });
});

test('Test that admin generated reset password request fails with valid new password and invalid token.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({
          reset_token: 'ncncnc',
        })
      );
  const promise = developerController.resetPasswordByToken(
      validAddDeveloperRequest.email,
      'invalidtoken',
      validAddDeveloperRequest.password );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(ResetPasswordStatus.TOKEN_INVALID);
    mock.mockRestore();
    done();
  });
});

test('Test that admin generated reset password request fails with valid new password but user persistor fails to find user.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Finding Developer'))
      );
  const promise = developerController.resetPasswordByToken(
      validAddDeveloperRequest.email,
      'hchchc',
      validAddDeveloperRequest.password );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(ResetPasswordStatus.PersistorError.CANNOT_SEARCH);
    mock.mockRestore();
    done();
  });
});

test('Test that admin generated reset password request fails with valid new password but user persistor doens\'t find user.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve(null)
      );
  const promise = developerController.resetPasswordByToken(
      validAddDeveloperRequest.email,
      'hchchc',
      validAddDeveloperRequest.password);
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(ResetPasswordStatus.DEVELOPER_DOESNT_EXIST);
    mock.mockRestore();
    done();
  });
});

test('Success Search Developer, text', (done) =>{
  jest.spyOn(developerController.developerPersistor, 'find').mockReturnValue(Promise.resolve([{x: 1}, {x: 2}]));
  const companyquery = {plain: 'sami'};
  const promise = developerController.search(companyquery);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Failed Searching Developer, invalid string ', (done) =>{
  const jobquery = {plain: chance.string({length: 251, pool: STRINGPASS, symbol: true})};
  const promise = developerController.search(jobquery);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.WrongDescription);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Searching Developer, Result not Found  (text)', (done) =>{
  jest.spyOn(developerController.developerPersistor, 'find').mockReturnValue(Promise.resolve(null));
  const jobquery = 'hello';
  const promise = developerController.search(jobquery);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.NoResult);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Searching Developer, Result not Found  (object)', (done) =>{
  jest.spyOn(developerController.developerPersistor, 'find').mockReturnValue(Promise.resolve(null));
  const jobquery = '{audit_on: false}';
  const promise = developerController.search(jobquery);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.NoResult);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Error Searching Developer', (done) =>{
  const findMock = jest.spyOn(developerController.developerPersistor, 'find');
  findMock.mockImplementation((x)=>{
    throw new Error(RegisterDeveloperStatus.PersistorStatus.CANNOT_SEARCH_FOR_DEVELOPER);
  });
  const jobquery = {audit_on: false};
  const promise = developerController.search(jobquery);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.PersistorStatus.CANNOT_SEARCH_FOR_DEVELOPER);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Test that developer can deactivate account when persistor works', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({isdeactivated: false})
      );
  const promise = developerController.deactivateDeveloper(
      validAddDeveloperRequest.username
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Successful);
    expect(devResponse.getMessage()).toBe(DeactivateDeveloperStatus.SUCCESS);
    mock.mockRestore();
    done();
  });
});

test('Test that developer cannot deactivate account when account is already deactivated.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({isdeactivated: true})
      );
  const promise = developerController.deactivateDeveloper(
      validAddDeveloperRequest.username
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(DeactivateDeveloperStatus.ACCOUNT_ALREADY_DEACTIVATED);
    mock.mockRestore();
    done();
  });
});

test('Test that developer cannot deactivate account when account is doesnt exist.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve(null)
      );
  const promise = developerController.deactivateDeveloper(
      validAddDeveloperRequest.username
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(DeactivateDeveloperStatus.DEVELOPER_DOESNT_EXIST);
    mock.mockRestore();
    done();
  });
});

test('Test that developer cannot deactivate account when persistor cannot search.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mock Persistor] Cannot search for developer.'))
      );
  const promise = developerController.deactivateDeveloper(
      validAddDeveloperRequest.username
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(DeactivateDeveloperStatus.PersistorError.CANNOT_SEARCH);
    mock.mockRestore();
    done();
  });
});

test('Test that developer cannot deactivate account when persistor cannot update developer.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'updateDeveloper')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mock Persistor] Cannot update developer.'))
      );
  const promise = developerController.deactivateDeveloper(
      'testoto'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(DeactivateDeveloperStatus.PersistorError.CANNOT_UPDATE);
    mock.mockRestore();
    done();
  });
});

test('Test that developer can reactivate account when persistor works.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({isdeactivated: true})
      );
  const promise = developerController.reactivateDeveloper(
      validAddDeveloperRequest.username
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Successful);
    expect(devResponse.getMessage()).toBe(ReactivateDeveloperStatus.SUCCESS);
    mock.mockRestore();
    done();
  });
});

test('Test that developer cannot reactivate account when account already not deactivated.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({isdeactivated: false})
      );
  const promise = developerController.reactivateDeveloper(
      validAddDeveloperRequest.username
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(ReactivateDeveloperStatus.ACCOUNT_ALREADY_ACTIVATED);
    mock.mockRestore();
    done();
  });
});

test('Test that developer cannot reactivate account when peristor cannot search for developer.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mock Persistor] Cannot search for developer.'))
      );
  const promise = developerController.reactivateDeveloper(
      validAddDeveloperRequest.username
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(ReactivateDeveloperStatus.PersistorError.CANNOT_SEARCH);
    mock.mockRestore();
    done();
  });
});

test('Test that developer cannot reactivate account when developer does not exist.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve(null)
      );
  const promise = developerController.reactivateDeveloper(
      validAddDeveloperRequest.username
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(ReactivateDeveloperStatus.DEVELOPER_DOESNT_EXIST);
    mock.mockRestore();
    done();
  });
});

test('Test that developer cannot reactivate account when cannot update developer.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'updateDeveloper')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mock Persistor] Cannot update developer.'))
      );
  const promise = developerController.reactivateDeveloper(
      'testototo'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(ReactivateDeveloperStatus.PersistorError.CANNOT_UPDATE);
    mock.mockRestore();
    done();
  });
});

test('Test that developer can add capacity of hours for projects.', (done) => {
  const promise = developerController.addCapacityOfProjects(
      'testoto',
      10
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Successful);
    expect(devResponse.getMessage()).toBe(AddCapacityOfProjectsStatus.SUCCESS);
    done();
  });
});

test('Test that developer fails to add capacity of hours for projects when developer does not exist.', (done) => {
  const promise = developerController.addCapacityOfProjects(
      validAddDeveloperRequest.username,
      10
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(AddCapacityOfProjectsStatus.DEVELOPER_DOESNT_EXIST);
    done();
  });
});

test('Test that developer fails to add capacity of hours for projects when persistor fails to retrieve developer.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mock Persistor] Cannot search for developer.'))
      );
  const promise = developerController.addCapacityOfProjects(
      validAddDeveloperRequest.username
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(AddCapacityOfProjectsStatus.PersistorError.CANNOT_SEARCH);
    mock.mockRestore();
    done();
  });
});

test('Test that developer fails to add capacity of hours for projects when persistor fails to store developer.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'updateDeveloper')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mock Persistor] Cannot update developer.'))
      );
  const promise = developerController.addCapacityOfProjects(
      'testoto',
      10
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(AddCapacityOfProjectsStatus.PersistorError.CANNOT_UPDATE);
    mock.mockRestore();
    done();
  });
});

test('Test that developer can add skills successfully given that the skills are activated and persistor is working.', (done) => {
  const mock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.resolve({username: 'username'}));
  const promise = developerController.editDeveloperSkills(
      'testoto',
      ['skillA', 'skillB', 'skillC']
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Successful);
    expect(devResponse.getMessage()).toBe(EditDeveloperSkillsStatus.SUCCESS);
    mock.mockRestore();
    done();
  });
});

test('Test that developer cannot add skills given that some of the skills are deactivated and persistor is working.', (done) => {
  const findDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.resolve({username: 'username'}));
  const retrieveDeveloperSkillMock = jest
      .spyOn(developerController.developerPersistor, 'retrieveDeveloperSkill')
      .mockImplementation(() => Promise.resolve({isdeactivated: true}));
  const promise = developerController.editDeveloperSkills(
      'username',
      ['skillA', 'skillB', 'skillC']
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(EditDeveloperSkillsStatus.SOME_SKILLS_ARE_DEACTIVATED);
    findDeveloperMock.mockRestore();
    retrieveDeveloperSkillMock.mockRestore();
    done();
  });
});

test('Test that developer cannot add skills given that some of the skills are not found but persistor is working.', (done) => {
  const findDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.resolve({username: 'username'}));
  const retrieveDeveloperSkillMock = jest
      .spyOn(developerController.developerPersistor, 'retrieveDeveloperSkill')
      .mockImplementation(() => Promise.resolve(null));
  const promise = developerController.editDeveloperSkills(
      'username',
      ['skillA', 'skillB', 'skillC']
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(EditDeveloperSkillsStatus.SOME_SKILLS_ARE_NOT_EXISTENT);
    findDeveloperMock.mockRestore();
    retrieveDeveloperSkillMock.mockRestore();
    done();
  });
});

test('Test that developer cannot add skills given that persistor cannot search for developer.', (done) => {
  const findDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.reject(new Error('[Mocked Persistor] Cannot search for developer')));
  const promise = developerController.editDeveloperSkills(
      'username',
      ['skillA', 'skillB', 'skillC']
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(EditDeveloperSkillsStatus.PersistorError.CANNOT_SEARCH_FOR_DEVELOPER);
    findDeveloperMock.mockRestore();
    done();
  });
});

test('Test that developer cannot add skills given that persistor cannot search for skill.', (done) => {
  const retrieveDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'retrieveDeveloperSkill')
      .mockImplementation(() => Promise.reject(new Error('[Mocked Persistor] Cannot search for skill')));
  const promise = developerController.editDeveloperSkills(
      'username',
      ['skillA', 'skillB', 'skillC']
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(EditDeveloperSkillsStatus.PersistorError.CANNOT_SEARCH_FOR_SKILL);
    retrieveDeveloperMock.mockRestore();
    done();
  });
});

test('Test that developer cannot add skills given that persistor cannot update developer.', (done) => {
  const updateDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'updateDeveloper')
      .mockImplementation(() => Promise.reject(new Error('[Mocked Persistor] Cannot updating developer')));
  const promise = developerController.editDeveloperSkills(
      'testoto',
      ['skillA', 'skillB', 'skillC']
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(EditDeveloperSkillsStatus.PersistorError.CANNOT_UPDATE_DEVELOPER);
    updateDeveloperMock.mockRestore();
    done();
  });
});

test('Test that developer cannot add skills given that developer does not exist.', (done) => {
  const promise = developerController.editDeveloperSkills(
      'username',
      ['skillA', 'skillB', 'skillC']
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(EditDeveloperSkillsStatus.DEVELOPER_DOESNT_EXIST);
    done();
  });
});

test('Test that developer can verify his account from mail given a compatible verifier.', (done) => {
  const mock = jest.spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.resolve({verifier: 'iamverifier'}));
  const promise = developerController.verifyAccount(
      'username',
      'iamverifier'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Successful);
    expect(devResponse.getMessage()).toBe(VerifyDeveloperStatus.SUCCESS);
    mock.mockRestore();
    done();
  });
});

test('Test that developer cannot verify his account from mail given an incompatible verifier.', (done) => {
  const mock = jest.spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.resolve({verifier: 'iamverifier'}));
  const promise = developerController.verifyAccount(
      'username',
      'iamnotverifier'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VerifyDeveloperStatus.INCORRECT_VERIFIER);
    mock.mockRestore();
    done();
  });
});

test('Test that developer cannot verify his account from mail given that the developer doesnt exist.', (done) => {
  const mock = jest.spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.resolve(null));
  const promise = developerController.verifyAccount(
      'username',
      'iamverifier'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VerifyDeveloperStatus.DEVELOPER_DOESNT_EXIST);
    mock.mockRestore();
    done();
  });
});

test('Test that developer cannot verify his account from mail given that the persistor cannot search for developer.', (done) => {
  const mock = jest.spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.reject(new Error('[Mocked Persistor] Cannot search for developer.')));
  const promise = developerController.verifyAccount(
      'username',
      'iamverifier'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VerifyDeveloperStatus.PersistorError.CANNOT_SEARCH);
    mock.mockRestore();
    done();
  });
});

test('Test that developer cannot verify his account from mail given that the persistor cannot update developer.', (done) => {
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.resolve({verifier: 'iamverifier'}));
  const updateDeveloperMock = jest.spyOn(developerController.developerPersistor, 'updateDeveloper')
      .mockImplementation(() => Promise.reject(new Error('[Mocked Persistor] Cannot update developer')));
  const promise = developerController.verifyAccount(
      'username',
      'iamverifier'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VerifyDeveloperStatus.PersistorError.CANNOT_UPDATE);
    findDeveloperMock.mockRestore();
    updateDeveloperMock.mockRestore();
    done();
  });
});

test('Test that developer cannot verify his account from mail given that account is already verified.', (done) => {
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.resolve({isVerified: true, verifier: 'iamverifier'}));
  const promise = developerController.verifyAccount(
      'username',
      'iamverifier'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VerifyDeveloperStatus.ACCOUNT_ALREADY_VERIFIED);
    findDeveloperMock.mockRestore();
    done();
  });
});

test('Successfully Applied to Job', (done) =>{
  const developerUsername='testoto';
  const jobId = '123';
  const answers = ['1'];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyJob(developerUsername, jobId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.SuccessfulJobApplicationPersist);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Failed Applying to Job, invalid file type', (done) =>{
  const developerUsername='testoto';
  const jobId = '123';
  const answers = ['1'];
  const cvFile ={
    name: 'hello.txt',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyJob(developerUsername, jobId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_FILE);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

// test('Failed Applying to Job, error uploading file', (done) =>{
//   const developerUsername='testoto';
//   const jobId = '123';
//   const answers = ['1'];
//   const cvFile ={
//     name: 'hi.jpg',
//     mv:  function(x, callback) {
//       callback(1);
//     },
//   };
//   const promise = developerController.applyJob(developerUsername, jobId, cvFile, answers);
//   promise.then((response) => {
//     expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.ErrorUpload);
//     expect(response.status).toBe(APIStatus.Failed);
//     done();
//   });
// });

test('Failed Applying to Job, invalid answer data type', (done) =>{
  const developerUsername='testoto';
  const jobId = '123';
  const answers = '12';
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyJob(developerUsername, jobId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.WrongAnswerType);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Applying to Job, invalid answer length ( 0 )', (done) =>{
  const developerUsername='testoto';
  const jobId = '123';
  const answers = [];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyJob(developerUsername, jobId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.NoAnswersFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Applying to Job, invalid answer length, Out of bound', (done) =>{
  const developerUsername='testoto';
  const jobId = '123';
  const answers = [1, 2, 3, 4];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyJob(developerUsername, jobId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.AnswerOutOfBound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Applying to Job, invalid answer, too long', (done) =>{
  const developerUsername='testoto';
  const jobId = '123';
  const answers = [chance.string({length: 251, pool: STRINGPASS, symbol: true})];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyJob(developerUsername, jobId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.WrongAnswerDescription);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Applying to Job, Developer doesnt exist', (done) =>{
  const developerUsername='ali';
  const jobId = '123';
  const answers = ['1'];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyJob(developerUsername, jobId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(EditDeveloperSkillsStatus.DEVELOPER_DOESNT_EXIST);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Applying to Job, answers and questions are not equivalent', (done) =>{
  const developerUsername='testoto';
  const jobId = '123';
  const answers = ['1', '32', '1'];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyJob(developerUsername, jobId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.UnequivlentResponse);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Applying to Job, Already Applied', (done) =>{
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'findJobApp')
      .mockImplementation(() => Promise.resolve({isVerified: true, verifier: 'iamverifier'}));
  const developerUsername='testoto';
  const jobId = '123';
  const answers = ['1'];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyJob(developerUsername, jobId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.JobApplicationExist);
    expect(response.status).toBe(APIStatus.Failed);
    findDeveloperMock.mockRestore();
    done();
  });
});

test('Error Applying to Job, Persist Job Application Error', (done) =>{
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'persistJobApplication')
      .mockImplementation(() => Promise.reject(RegisterDeveloperStatus.ValidationStatus.PersistjobApplicationError));
  const developerUsername='testoto';
  const jobId = '123';
  const answers = ['1'];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyJob(developerUsername, jobId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.PersistjobApplicationError);
    expect(response.status).toBe(APIStatus.Failed);
    findDeveloperMock.mockRestore();
    done();
  });
});

test('Error Applying to Job, Find Job Error', (done) =>{
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'findJob')
      .mockImplementation(() => Promise.reject(RegisterDeveloperStatus.ValidationStatus.FindJobError));
  const developerUsername='testoto';
  const jobId = '123';
  const answers = ['1'];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyJob(developerUsername, jobId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.FindJobError);
    expect(response.status).toBe(APIStatus.Failed);
    findDeveloperMock.mockRestore();
    done();
  });
});

test('Error Applying to Job, Find Developer Error', (done) =>{
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.reject(RegisterDeveloperStatus.ValidationStatus.FindDeveloperError));
  const developerUsername='testoto';
  const jobId = '123';
  const answers = ['1'];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyJob(developerUsername, jobId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.FindDeveloperError);
    expect(response.status).toBe(APIStatus.Failed);
    findDeveloperMock.mockRestore();
    done();
  });
});

// //////////////////////////////////////////////////////////////////


test('Successfully Applied to Project', (done) =>{
  const developerUsername='testoto';
  const projectId = '123';
  const answers = ['1'];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyProject(developerUsername, projectId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.SuccessfulProjectApplicationPersist);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Failed Applying to Project, invalid file type', (done) =>{
  const developerUsername='testoto';
  const projectId = '123';
  const answers = ['1'];
  const cvFile ={
    name: 'hello.txt',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyProject(developerUsername, projectId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_FILE);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

// test('Failed Applying to Job, error uploading file', (done) =>{
//   const developerUsername='testoto';
//   const jobId = '123';
//   const answers = ['1'];
//   const cvFile ={
//     name: 'hi.jpg',
//     mv:  function(x, callback) {
//       callback(1);
//     },
//   };
//   const promise = developerController.applyJob(developerUsername, jobId, cvFile, answers);
//   promise.then((response) => {
//     expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.ErrorUpload);
//     expect(response.status).toBe(APIStatus.Failed);
//     done();
//   });
// });

test('Failed Applying to Project, invalid answer data type', (done) =>{
  const developerUsername='testoto';
  const projectId = '123';
  const answers = '12';
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyProject(developerUsername, projectId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.WrongAnswerType);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Applying to Project, invalid answer length ( 0 )', (done) =>{
  const developerUsername='testoto';
  const projectId = '123';
  const answers = [];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyProject(developerUsername, projectId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.NoAnswersFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Applying to Project, invalid answer length, Out of bound', (done) =>{
  const developerUsername='testoto';
  const projectId = '123';
  const answers = [1, 2, 3, 4];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyProject(developerUsername, projectId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.AnswerOutOfBound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Applying to Project, invalid answer, too long', (done) =>{
  const developerUsername='testoto';
  const projectId = '123';
  const answers = [chance.string({length: 251, pool: STRINGPASS, symbol: true})];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyProject(developerUsername, projectId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.WrongAnswerDescription);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Applying to Project, Developer doesnt exist', (done) =>{
  const developerUsername='ali';
  const projectId = '123';
  const answers = ['1'];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyProject(developerUsername, projectId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(EditDeveloperSkillsStatus.DEVELOPER_DOESNT_EXIST);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Applying to Project, answers and questions are not equivalent', (done) =>{
  const developerUsername='testoto';
  const projectId = '123';
  const answers = ['1', '32', '1'];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyProject(developerUsername, projectId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.UnequivlentResponse);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Applying to Project, Already Applied', (done) =>{
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'findProjectApp')
      .mockImplementation(() => Promise.resolve({isVerified: true, verifier: 'iamverifier'}));
  const developerUsername='testoto';
  const projectId = '123';
  const answers = ['1'];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyProject(developerUsername, projectId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.ProjectApplicationExist);
    expect(response.status).toBe(APIStatus.Failed);
    findDeveloperMock.mockRestore();
    done();
  });
});

test('Error Applying to Project, Persist Project Application Error', (done) =>{
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'persistProjectApplication')
      // eslint-disable-next-line max-len
      .mockImplementation(() => Promise.reject(RegisterDeveloperStatus.ValidationStatus.PersistprojectApplicationError));
  const developerUsername='testoto';
  const projectId = '123';
  const answers = ['1'];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyProject(developerUsername, projectId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.PersistProjectApplicationError);
    expect(response.status).toBe(APIStatus.Failed);
    findDeveloperMock.mockRestore();
    done();
  });
});

test('Error Applying to Project, Find Project Error', (done) =>{
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'findProject')
      .mockImplementation(() => Promise.reject(RegisterDeveloperStatus.ValidationStatus.FindProjectError));
  const developerUsername='testoto';
  const projectId = '123';
  const answers = ['1'];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyProject(developerUsername, projectId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.FindProjectError);
    expect(response.status).toBe(APIStatus.Failed);
    findDeveloperMock.mockRestore();
    done();
  });
});

test('Error Applying to Project, Find Developer Error', (done) =>{
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.reject(RegisterDeveloperStatus.ValidationStatus.FindDeveloperError));
  const developerUsername='testoto';
  const projectId = '123';
  const answers = ['1'];
  const cvFile ={
    name: 'hi.jpg',
    mv: async function(x, callback) {
      callback(null);
    },
  };
  const promise = developerController.applyProject(developerUsername, projectId, cvFile, answers);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.FindDeveloperError);
    expect(response.status).toBe(APIStatus.Failed);
    findDeveloperMock.mockRestore();
    done();
  });
});


test('Test that getting developer profile succeeds for working persistor and developer found', (done) =>{
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.resolve({username: 'test', email: 'testemail'}));
  const promise = developerController.viewProfile('test');
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(ViewProfileStatus.SUCCESS);
    findDeveloperMock.mockRestore();
    done();
  });
});

test('Test that getting developer profile succeeds for working persistor but developer not found', (done) =>{
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.resolve(null));
  const promise = developerController.viewProfile('test');
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(ViewProfileStatus.DEVELOPER_DOESNT_EXIST);
    findDeveloperMock.mockRestore();
    done();
  });
});

test('Test that getting developer profile fails for not working persistor', (done) =>{
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.reject(new Error('[Mocked Persistor] Cannot search for developer')));
  const promise = developerController.viewProfile('test');
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(ViewProfileStatus.PersistorError.CANNOT_SEARCH);
    findDeveloperMock.mockRestore();
    done();
  });
});

test('Test that update developer fails when invalid attributes are given', (done) =>{
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.resolve({}));
  const promise = developerController.editDeveloper('testuser', {
    invalidAttribute: 'invalid',
  });
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(EditDeveloperStatus.ValidationStatus.INVALID_ATTRIBUTES_PASSED);
    findDeveloperMock.mockRestore();
    done();
  });
});

test('Test that update developer fails when incompatible things are changed', (done) =>{
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.resolve(new Developer(validAddDeveloperRequest)));
  const promise = developerController.editDeveloper('testuser', {
    educationLevel: 'N/A',
  });
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(EditDeveloperStatus.ValidationStatus.INVALID_EDUCATION);
    findDeveloperMock.mockRestore();
    done();
  });
});

test('Test that update developer fails when skills are not present', (done) =>{
  const retrieveDeveloperSkillMock = jest.spyOn(developerController.developerPersistor, 'retrieveDeveloperSkill')
      .mockImplementation(() => Promise.resolve(null));
  const promise = developerController.editDeveloper('testuser', {
    skills: ['A', 'B', 'C'],
  });
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(EditDeveloperStatus.ONE_OR_MORE_SKILLS_UNAVAILABLE);
    retrieveDeveloperSkillMock.mockRestore();
    done();
  });
});

test('Test that update developer fails when there is no developer', (done) =>{
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.resolve(null));
  const promise = developerController.editDeveloper('testuser', {
    firstname: 'Hello',
  });
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(EditDeveloperStatus.DEVELOPER_NOT_FOUND);
    findDeveloperMock.mockRestore();
    done();
  });
});

test('Test that update developer fails when one of the skills is deactivated', (done) => {
  const retrieveDeveloperSkillMock = jest.spyOn(developerController.developerPersistor, 'retrieveDeveloperSkill')
      .mockImplementation(() => Promise.resolve({isdeactivated: true}));
  const promise = developerController.editDeveloper('testuser', {
    skills: ['A', 'B', 'C'],
  });
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(EditDeveloperStatus.ONE_OR_MORE_SKILLS_UNAVAILABLE);
    retrieveDeveloperSkillMock.mockRestore();
    done();
  });
});

test('Test that update developer succeeds when everything is valid.', (done) => {
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.resolve(new Developer(validAddDeveloperRequest)));
  const mockSendEmail = jest.spyOn(Util, 'sendEmail')
      .mockImplementation(() => {});
  const promise = developerController.editDeveloper(validAddDeveloperRequest.username, {
    firstname: 'hello',
    email: validAddDeveloperRequest.email,
    password: validAddDeveloperRequest.password,
  });
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(EditDeveloperStatus.DEVELOPER_UPDATED_SUCCESSFULLY);
    findDeveloperMock.mockRestore();
    mockSendEmail.mockRestore();
    done();
  });
});

test('Test that update developer fails when trying to change username.', (done) => {
  const promise = developerController.editDeveloper(validAddDeveloperRequest.username, {
    username: 'hello',
  });
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(EditDeveloperStatus.CHANGING_USERNAME_FORBIDDEN);
    done();
  });
});

test('Test that update developer succeeds when giving no changes.', (done) => {
  const promise = developerController.editDeveloper(validAddDeveloperRequest.username, {
  });
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(EditDeveloperStatus.NO_CHANGE);
    done();
  });
});

test('Test that update developer fails when giving wrong password.', (done) => {
  const findDeveloperMock = jest.spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() => Promise.resolve(new Developer(validAddDeveloperRequest)));
  const promise = developerController.editDeveloper(validAddDeveloperRequest.username, {
    password: 'invalidpass',
  });
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(EditDeveloperStatus.ValidationStatus.INVALID_PASSWORD);
    findDeveloperMock.mockRestore();
    done();
  });
});

test('Developer Subscribe to job alert invalid email', (done) => {
  const subscriber ='{"email": "salah.awadoutlook.com", "SearchCriteria": "{}"}';
  const username = 'sawada';
  const promise = developerController.subsrcibeAlerts(username, JSON.parse(subscriber));
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.ValidationStatus.INVALID_EMAIL);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Developer Subscribe to job alert, email already in database', (done) => {
  const subscriber ={
    email: 'salah.awad@outlook.com', SearchCriteria: {
      'SeniorityLevel': 'Entry level',
    },
  };
  const username = 'sawada';
  const promise = developerController.subsrcibeAlerts(username, subscriber);
  promise.then((response) => {
    expect(response.message).toBe(RegisterDeveloperStatus.EMAIL_USED);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Developer Subscribe to job alert, successfully subscribed', (done) => {
  const subscriber ={
    email: 'salah.awad123@outlook.com', SearchCriteria: {
    },
  };
  const username = 'sawada';
  const promise = developerController.subsrcibeAlerts(username, subscriber);
  promise.then((response) => {
    expect(response.message).toBe('Successfully Subscribed');
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.data.All).toBe(true);
    done();
  });
});

test('Developer Subscribe to job alert, successfully updated subscribtion', (done) => {
  const username = 'sawada';
  const subscriber ={
    email: 'salah.awad123@outlook.com', SearchCriteria: {
      'SeniorityLevel': 'Entry level',
    },
  };

  const promise = developerController.subsrcibeAlerts(username, subscriber);
  promise.then((response) => {
    expect(response.message).toBe('Successfully Subscribed');
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.data.All).toBe(false);
    expect(response.data.SeniorityLevel).toBe('Entry level');
    done();
  });
});


test('Developer Subscribe to job alert, Find Error', (done) => {
  const username = 'sawada';
  const subscriber ={
    email: 'salah.awad123@outlook.com', SearchCriteria: {
      'SeniorityLevel': 'Entry level',
    },
  };
  const myMock = jest
      .spyOn(developerController.developerPersistor, 'verifyEmailUnique')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Finding User'))
      );
  const promise = developerController.subsrcibeAlerts(username, subscriber);
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(RegisterDeveloperStatus.PersistorStatus.CANNOT_SEARCH);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    done();
  });
});


test('Developer Subscribe to job alert, Persist Error', (done) => {
  const username = 'sawada';
  const subscriber ={
    email: 'salah.awad123@outlook.com', SearchCriteria: {
      'SeniorityLevel': 'Entry level',
    },
  };
  const myMock = jest
      .spyOn(developerController.developerPersistor, 'persistSubscriber')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error persisting User'))
      );
  const promise = developerController.subsrcibeAlerts(username, subscriber);
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(RegisterDeveloperStatus.PersistorStatus.CANNOT_SUBSCRIBE);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    done();
  });
});

test('Developer unsubscribe, successfully unsubscribed', (done) => {
  const email = 'salah.awad@outlook.com';
  const UnsubscriptionKey = '1234';
  const promise = developerController.unsubsrcibeAlerts(email, UnsubscriptionKey);
  promise.then((response) => {
    expect(response.message).toBe('Successfully unSubscribed');
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Developer un subscribe from job alert, account not found', (done) => {
  const email = 'hasankataya@outlook.com';
  const UnsubscriptionKey = '1234';
  const promise = developerController.unsubsrcibeAlerts(email, UnsubscriptionKey);
  promise.then((response) => {
    expect(response.message).toBe(AccountAuthenticationStatus.ACCOUNT_NOT_FOUND);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Developer unsubscribe to job alert,  Error updating settings', (done) => {
  const email = 'hasankataya@outlook.com';
  const UnsubscriptionKey = '1234';
  const myMock = jest
      .spyOn(developerController.developerPersistor, 'deactivateSubscriber')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error updating User'))
      );
  const promise = developerController.unsubsrcibeAlerts(email, UnsubscriptionKey);
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(RegisterDeveloperStatus.PersistorStatus.CANNOT_SUBSCRIBE);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    done();
  });
});

test('Test that forget password succeeds when account is existent.', (done) => {
  const findDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({username: validAddDeveloperRequest.username})
      );
  const updateDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'updateDeveloper')
      .mockImplementation(() =>
        Promise.resolve()
      );
  const mockSendEmail = jest.spyOn(Util, 'sendEmail')
      .mockImplementation(() => {});
  const promise = developerController.forgotPassword(validAddDeveloperRequest.email);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(ForgotPasswordStatus.RESET_LINK_SENT);
    findDeveloperMock.mockRestore();
    updateDeveloperMock.mockRestore();
    mockSendEmail.mockRestore();
    done();
  });
});

test('Test that forget password fails when account is not existent.', (done) => {
  const findDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve(null)
      );
  const promise = developerController.forgotPassword(validAddDeveloperRequest.email);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(ForgotPasswordStatus.DEVELOPER_NOT_FOUND);
    findDeveloperMock.mockRestore();
    done();
  });
});

test('Test that forget password fails when persistor cannot search for developer.', (done) => {
  const findDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persistor] Cannot search for developer'))
      );
  const promise = developerController.forgotPassword(validAddDeveloperRequest.email);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(ForgotPasswordStatus.PersistorError.CANNOT_SEARCH);
    findDeveloperMock.mockRestore();
    done();
  });
});

test('Test that forget password fails when persistor cannot update developer with reset code.', (done) => {
  const findDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({username: validAddDeveloperRequest.username})
      );
  const updateDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'updateDeveloper')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persistor] Cannot update developer'))
      );
  const promise = developerController.forgotPassword(validAddDeveloperRequest.email);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(ForgotPasswordStatus.PersistorError.CANNOT_UPDATE);
    findDeveloperMock.mockRestore();
    updateDeveloperMock.mockRestore();
    done();
  });
});

test('Test that saving job succeeds when company, job, and developer are available.', (done) => {
  const findDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({username: validAddDeveloperRequest.username, saved_jobs: []})
      );
  const findCompanyMock = jest
      .spyOn(developerController.developerPersistor, 'findCompany')
      .mockImplementation(() =>
        Promise.resolve({username: 'iamcorp'})
      );
  const findJobMock = jest
      .spyOn(developerController.developerPersistor, 'findJob')
      .mockImplementation(() =>
        Promise.resolve({JobTitle: 'Software developer'})
      );
  const updateDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'persistJobSave')
      .mockImplementation(() =>
        Promise.resolve()
      );
  const promise = developerController.saveJob(validAddDeveloperRequest.username, 'iamcorp', 939);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(SaveJobStatus.JOB_SAVED);
    findDeveloperMock.mockRestore();
    findCompanyMock.mockRestore();
    findJobMock.mockRestore();
    updateDeveloperMock.mockRestore();
    done();
  });
});

test('Test that saving job fails when company is not available.', (done) => {
  const findDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({username: validAddDeveloperRequest.username})
      );
  const findCompanyMock = jest
      .spyOn(developerController.developerPersistor, 'findCompany')
      .mockImplementation(() =>
        Promise.resolve(null)
      );
  const promise = developerController.saveJob(validAddDeveloperRequest.username, 'iamcorp', 2932);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(SaveJobStatus.COMPANY_NOT_FOUND);
    findDeveloperMock.mockRestore();
    findCompanyMock.mockRestore();
    done();
  });
});

test('Test that saving job fails when developer is not available.', (done) => {
  const findDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve(null)
      );
  const findCompanyMock = jest
      .spyOn(developerController.developerPersistor, 'findCompany')
      .mockImplementation(() =>
        Promise.resolve({username: 'iamcorp'})
      );
  const promise = developerController.saveJob(validAddDeveloperRequest.username, 'iamcorp', 2932);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(SaveJobStatus.DEVELOPER_NOT_FOUND);
    findDeveloperMock.mockRestore();
    findCompanyMock.mockRestore();
    done();
  });
});

test('Test that saving job fails when job is not available.', (done) => {
  const findDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({username: validAddDeveloperRequest.username})
      );
  const findCompanyMock = jest
      .spyOn(developerController.developerPersistor, 'findCompany')
      .mockImplementation(() =>
        Promise.resolve({username: 'iamcorp'})
      );
  const findJobMock = jest
      .spyOn(developerController.developerPersistor, 'findJob')
      .mockImplementation(() =>
        Promise.resolve(null)
      );
  const promise = developerController.saveJob(validAddDeveloperRequest.username, 'iamcorp', 2932);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(SaveJobStatus.JOB_NOT_FOUND);
    findDeveloperMock.mockRestore();
    findCompanyMock.mockRestore();
    findJobMock.mockRestore();
    done();
  });
});

test('Test that saving job fails when update fails.', (done) => {
  const findDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({username: validAddDeveloperRequest.username, saved_jobs: []})
      );
  const findCompanyMock = jest
      .spyOn(developerController.developerPersistor, 'findCompany')
      .mockImplementation(() =>
        Promise.resolve({username: 'iamcorp'})
      );
  const findJobMock = jest
      .spyOn(developerController.developerPersistor, 'findJob')
      .mockImplementation(() =>
        Promise.resolve({JobTitle: 'Software developer'})
      );
  const updateDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'persistJobSave')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persistor] Cannot update developer'))
      );
  const promise = developerController.saveJob(validAddDeveloperRequest.username, 'iamcorp', 2932);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(SaveJobStatus.PersistorError.CANNOT_UPDATE);
    findDeveloperMock.mockRestore();
    findCompanyMock.mockRestore();
    findJobMock.mockRestore();
    updateDeveloperMock.mockRestore();
    done();
  });
});

test('Test that saving job fails when finding developer fails.', (done) => {
  const findDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persistor] Cannot search for developer'))
      );
  const findCompanyMock = jest
      .spyOn(developerController.developerPersistor, 'findCompany')
      .mockImplementation(() =>
        Promise.resolve({username: 'iamcorp'})
      );
  const findJobMock = jest
      .spyOn(developerController.developerPersistor, 'findJob')
      .mockImplementation(() =>
        Promise.resolve({JobTitle: 'Software developer'})
      );
  const promise = developerController.saveJob(validAddDeveloperRequest.username, 'iamcorp', 2932);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(SaveJobStatus.PersistorError.CANNOT_SEARCH_FOR_DEVELOPER);
    findDeveloperMock.mockRestore();
    findCompanyMock.mockRestore();
    findJobMock.mockRestore();
    done();
  });
});

test('Test that saving job fails when finding company fails.', (done) => {
  const findDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({username: validAddDeveloperRequest.username, saved_jobs: []})
      );
  const findCompanyMock = jest
      .spyOn(developerController.developerPersistor, 'findCompany')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persistor] Cannot search for company'))
      );
  const promise = developerController.saveJob(validAddDeveloperRequest.username, 'iamcorp', 2932);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(SaveJobStatus.PersistorError.CANNOT_SEARCH_FOR_COMPANY);
    findDeveloperMock.mockRestore();
    findCompanyMock.mockRestore();
    done();
  });
});

test('Test that saving job fails when finding job fails.', (done) => {
  const findDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({username: validAddDeveloperRequest.username, saved_jobs: []})
      );
  const findCompanyMock = jest
      .spyOn(developerController.developerPersistor, 'findCompany')
      .mockImplementation(() =>
        Promise.resolve({username: 'iamcorp'})
      );
  const findJobMock = jest
      .spyOn(developerController.developerPersistor, 'findJob')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persistor] Cannot search for job'))
      );
  const promise = developerController.saveJob(validAddDeveloperRequest.username, 'iamcorp', 2932);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(SaveJobStatus.PersistorError.CANNOT_SEARCH_FOR_JOB);
    findDeveloperMock.mockRestore();
    findCompanyMock.mockRestore();
    findJobMock.mockRestore();
    done();
  });
});

test('Test that saving job fails when job is already there.', (done) => {
  const findDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({username: validAddDeveloperRequest.username, saved_jobs: []})
      );
  const findCompanyMock = jest
      .spyOn(developerController.developerPersistor, 'findCompany')
      .mockImplementation(() =>
        Promise.resolve({username: 'iamcorp'})
      );
  const findJobMock = jest
      .spyOn(developerController.developerPersistor, 'findJob')
      .mockImplementation(() =>
        Promise.resolve({})
      );
  const doesJobExistsMock = jest
      .spyOn(developerController.developerPersistor, 'doesJobExist')
      .mockImplementation(() =>
        Promise.resolve(true)
      );
  const promise = developerController.saveJob(validAddDeveloperRequest.username, 'iamcorp', 2932);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(SaveJobStatus.JOB_ALREADY_SAVED);
    findDeveloperMock.mockRestore();
    findCompanyMock.mockRestore();
    findJobMock.mockRestore();
    doesJobExistsMock.mockRestore();
    done();
  });
});

test('Test that saving job persistor cannot know if job is already there.', (done) => {
  const findDeveloperMock = jest
      .spyOn(developerController.developerPersistor, 'findDeveloper')
      .mockImplementation(() =>
        Promise.resolve({username: validAddDeveloperRequest.username, saved_jobs: []})
      );
  const findCompanyMock = jest
      .spyOn(developerController.developerPersistor, 'findCompany')
      .mockImplementation(() =>
        Promise.resolve({username: 'iamcorp'})
      );
  const findJobMock = jest
      .spyOn(developerController.developerPersistor, 'findJob')
      .mockImplementation(() =>
        Promise.resolve({})
      );
  const doesJobExistsMock = jest
      .spyOn(developerController.developerPersistor, 'doesJobExist')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persistor] Cannot search if job saved'))
      );
  const promise = developerController.saveJob(validAddDeveloperRequest.username, 'iamcorp', 2932);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(SaveJobStatus.PersistorError.CANNOT_SEARCH_IF_JOB_EXISTS);
    findDeveloperMock.mockRestore();
    findCompanyMock.mockRestore();
    findJobMock.mockRestore();
    doesJobExistsMock.mockRestore();
    done();
  });
});

test('Test that viewing job history shows the last saved job.', (done) => {
  const findSavedJobMock = jest
      .spyOn(developerController.developerPersistor, 'findSavedJobs')
      .mockImplementation(() =>
        Promise.resolve([{username: validAddDeveloperRequest.username, jobID: 'KDJKAD'}])
      );
  const findJobMock = jest
      .spyOn(developerController.developerPersistor, 'findJob')
      .mockImplementation(() =>
        Promise.resolve({isdeactivated: true})
      );
  const promise = developerController.savedJobHistory(validAddDeveloperRequest.username, 0, 1);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(ViewSavedJobsStatus.RETRIEVE_SUCCESSFULL);
    expect(response.data).toStrictEqual(['KDJKAD']);
    findSavedJobMock.mockRestore();
    findJobMock.mockRestore();
    done();
  });
});

test('Test that viewing job history shows the last 2 saved jobs.', (done) => {
  const findSavedJobsMock = jest
      .spyOn(developerController.developerPersistor, 'findSavedJobs')
      .mockImplementation(() =>
        Promise.resolve([{username: validAddDeveloperRequest.username, jobID: 'KDJKAD'},
          {username: validAddDeveloperRequest.username, jobID: 'JIWHFE'}])
      );
  const findJobMock = jest
      .spyOn(developerController.developerPersistor, 'findJob')
      .mockImplementation(() =>
        Promise.resolve({isdeactivated: true})
      );
  const promise = developerController.savedJobHistory(validAddDeveloperRequest.username, 0, 2);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(ViewSavedJobsStatus.RETRIEVE_SUCCESSFULL);
    expect(response.data).toStrictEqual(['KDJKAD', 'JIWHFE']);
    findSavedJobsMock.mockRestore();
    findJobMock.mockRestore();
    done();
  });
});

test('Test that viewing job history cannot show saved jobs.', (done) => {
  const findSavedJobsMock = jest
      .spyOn(developerController.developerPersistor, 'findSavedJobs')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persistor] Cannot search for saved jobs'))
      );
  const findJobMock = jest
      .spyOn(developerController.developerPersistor, 'findJob')
      .mockImplementation(() =>
        Promise.resolve({isdeactivated: true})
      );
  const promise = developerController.savedJobHistory(validAddDeveloperRequest.username, 0, 2);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(ViewSavedJobsStatus.PersistorError.CANNOT_SEARCH_FOR_SAVED_JOB);
    findSavedJobsMock.mockRestore();
    findJobMock.mockRestore();
    done();
  });
});

test('Test that viewing job history return empty job array when not found job is given.', (done) => {
  const findSavedJobsMock = jest
      .spyOn(developerController.developerPersistor, 'findSavedJobs')
      .mockImplementation(() =>
        Promise.resolve([{username: validAddDeveloperRequest.username, jobID: 'KDJKAD'}])
      );
  const findJobMock = jest
      .spyOn(developerController.developerPersistor, 'findJob')
      .mockImplementation(() =>
        Promise.resolve(null)
      );
  const promise = developerController.savedJobHistory(validAddDeveloperRequest.username, 0, 2);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(ViewSavedJobsStatus.RETRIEVE_SUCCESSFULL);
    expect(response.data).toStrictEqual([]);
    findSavedJobsMock.mockRestore();
    findJobMock.mockRestore();
    done();
  });
});

test('Test that viewing job history fails when persistor cannot search for job.', (done) => {
  const findSavedJobsMock = jest
      .spyOn(developerController.developerPersistor, 'findSavedJobs')
      .mockImplementation(() =>
        Promise.resolve([{username: validAddDeveloperRequest.username, jobID: 'KDJKAD'}])
      );
  const findJobMock = jest
      .spyOn(developerController.developerPersistor, 'findJob')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persistor] Cannot search for saved jobs'))
      );
  const promise = developerController.savedJobHistory(validAddDeveloperRequest.username, 0, 2);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(ViewSavedJobsStatus.PersistorError.CANNOT_SEARCH_FOR_SAVED_JOB);
    findSavedJobsMock.mockRestore();
    findJobMock.mockRestore();
    done();
  });
});

test('Testing get location on valid ip addresses', (done) => {
  const TestCases = [
    {
      ipAddress: '80.81.156.38',
      expectedResult: 'LB',
    },
    {
      ipAddress: '54.25.36.14',
      expectedResult: 'US',
    },
    {
      ipAddress: '58.75.26.77',
      expectedResult: 'KR',
    },
  ];
  TestCases.forEach((testCase) => {
    expect(apihelper.getLocation(testCase.ipAddress)).toBe(testCase.expectedResult);
  });
  done();
});

test('Testing get location on non valid ip addresses', (done) => {
  const TestCases = [
    {
      ipAddress: '192.168.1.1',
      expectedResult: null,
    },
    {
      ipAddress: '192.168.1.1',
      expectedResult: null,
    },
    {
      ipAddress: '192.168.1.1',
      expectedResult: null,
    },
    {
      ipAddress: '192.168.1.1',
      expectedResult: null,
    },
  ];
  TestCases.forEach((testCase) => {
    expect(apihelper.getLocation(testCase.ipAddress)).toBe(testCase.expectedResult);
  });
  done();
});
