
const MongooseHelper = require('../../src/models/MongooseHelper');
const AdminModel= MongooseHelper.getModel('AdminModel');
/**
 * test
 */
class AdminPersister {
  /**
   * constructor
   */
  constructor() {
  }
  /**
 *
 * @param {String} username
 * @param {string} email
 */
  async findAdmin(username, email ) {
    return AdminModel.findOne().or([{email: email}, {username: username}]);
  }
  /**
 * save admin
 * @param {Object} admin admin
 * @return {promise} create admin
 */
  async persistAdmin(admin) {
    return admin.save();
  }

  /**
 * update admin
 * @param {string} username
 * @param {Object} admin admin
 * @return {promise} update admin
 */
  async updateAdmin(username, admin) {
    return AdminModel.findOneAndUpdate({username: username}, {$set: admin}, {new: true});
  }


  /**
 * verify admin email
 * @param {string} email
 * @param {string} verifier
 * @return {promise}  verified email
 */
  async verifyAdmin(email, verifier) {
    return AdminModel.findOne().and([{email: email}, {verifier: verifier}]);
  }


  /**
 *
 * @param {String} username
 * @param {*} Model
 * @param {*} Promise
 */
  async findUser(username, Model) {
    return Model.findOne({username: username});
  }
  /**
*
* @param {String} username
* @param {Object} updatedFields
* @param {*} Model
* @param {*} Promise
*/
  async updateUser(username, updatedFields, Model) {
    return Model.findOneAndUpdate({username: username}, {$set: updatedFields}, {new: true});
  }
}

module.exports = AdminPersister;
