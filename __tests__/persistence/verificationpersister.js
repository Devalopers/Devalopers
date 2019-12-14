
const MongooseHelper = require('../../src/models/MongooseHelper');
const AdminModel= MongooseHelper.getModel('AdminModel');
const CompanyModel= MongooseHelper.getModel('CompanyModel');
/**
 * test
 */
class VerificationPersister {
  /**
   * constructor
   */
  constructor() {
  }

  /**
   * update admin
   * @param {String} username
   * @param {String} updatedUser admin
   * @param {Sting} type of user
   */
  async updateUser(username, updatedUser, type) {
    const dummyAdmin = {
      'email': 'salah.awad@outlook.com',
      'password': 'admin@123',
      'username': 'sawada',
      'fullname': 'Salah Awad',
      'isdeactivated': false,
      'Active': false,
    };

    const dummyCompany = {
      'email': 'libroC@gmail.com',
      'password': 'company@123',
      'username': 'libroo',
      'isdeactivated': false,
    };
    let updated;
    if (type == 'CompanyModel') updated = dummyCompany;
    else if (type == 'AdminModel') updated = dummyAdmin;
    if (updated.username === username) {
      let key;
      for (key in updatedUser) {
        if (updated[key]) {
          updated[key] = updatedUser[key];
        }
      }
      return updated;
    }
    return null;
  }

  /**
 * verify user email
 * @param {string} email
 * @param {string} verifier
 * @param {String} type
 * @return {promise}  verified email
 */ async verifyEmail(email, verifier, type) {
    const dummyAdmin = {
      'email': 'salah.awad@outlook.com',
      'password': 'admin@123',
      'username': 'sawada',
      'fullname': 'Salah Awad',
      'isdeactivated': false,
      'verifier': '12345',
      'Active': false,
    };

    const dummyCompany = {
      'email': 'libroC@gmail.com',
      'password': 'company@123',
      'username': 'libroo',
      'isdeactivated': false,

    };
    let dummy;
    if (type == 'CompanyModel') dummy = dummyCompany;
    else if (type == 'AdminModel') dummy = dummyAdmin;
    if (email === dummy.email && verifier === dummy.verifier) {
      return dummy;
    }
    return null;
  }

  /**
 * verify admin passwordCode
 * @param {string} passwordCode
 * @param {String} type
 *  @return {Promise}
 */
  async verifyPasswordCode(passwordCode, type) {
    const dummyAdmin = new AdminModel({
      'email': 'salah.awad@outlook.com',
      'password': 'admin@123',
      'username': 'sawada',
      'passwordCode': '12345',
      'isdeactivated': false,
    });

    const dummyCompany = new CompanyModel({
      'email': 'libroC@gmail.com',
      'password': 'company@123',
      'username': 'libroo',
      'isdeactivated': false,
    });
    let dummy;
    if (type == 'CompanyModel') dummy = dummyCompany;
    else if (type == 'AdminModel') dummy = dummyAdmin;
    if (dummy.passwordCode === passwordCode) {
      return dummy;
    }
    return null;
  }
}


module.exports = {VerificationPersister: VerificationPersister};
