
const MongooseHelper = require('../../models/MongooseHelper');
/**
 * test
 */
class VerificationPersistor {
  /**
   * constructor
   */
  constructor() {
  }

  /**
 * update User
 * @param {string} username
 * @param {Object} updatedFields fields to update
 * @param {Object} Model user model
 *  @return {Promise}
 */
  async updateUser(username, updatedFields, Model) {
    const userModel = MongooseHelper.getModel(Model);
    updatedFields.audit_on = Date.now();
    return userModel.findOneAndUpdate({username: username}, {$set: updatedFields}, {new: true});
  }

  /**
 * verify user email
 * @param {string} email
 * @param {string} verifier
 * @param {*} Model
 *  @return {Promise}
 */
  async verifyEmail(email, verifier, Model) {
    const userModel = MongooseHelper.getModel(Model);
    return userModel.findOne().and([{email: email}, {verifier: verifier}]);
  }

  /**
 * verify user passwordCode
 * @param {String} passwordCode
 * @param {String} Model
 *  @return {Promise}
 */
  async verifyPasswordCode(passwordCode, Model) {
    const userModel = MongooseHelper.getModel(Model);
    return userModel.findOne({passwordCode: passwordCode});
  }
}


module.exports = {VerificationPersistor: VerificationPersistor};
