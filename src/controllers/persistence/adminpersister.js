
const MongooseHelper = require('../../models/MongooseHelper');
const AdminModel= MongooseHelper.getModel('AdminModel');
const CompanyModel= MongooseHelper.getModel('CompanyModel');
const ReactivateModel= MongooseHelper.getModel('ReactivationRequestModel');
const SkillModel= MongooseHelper.getModel('SkillModel');
const StatusModel= MongooseHelper.getModel('StatusModel');
const DeveloperStatusModel = MongooseHelper.getModel('DeveloperStatusModel');
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
 * @param {*} callback
 */
  async findAdmin(username, email ) {
    return AdminModel.findOne().or([{email: email}, {username: username}]);
  }
  /**
 * save admin
 * @param {Object} admin admin
 * @return {Promise}
 */
  async persistAdmin(admin) {
    return admin.save();
  }

  /**
 * update admin
 * @param {string} username
 * @param {Object} admin admin
 *  @return {Promise}
 */
  async updateAdmin(username, admin ) {
    return AdminModel.findOneAndUpdate({username: username}, {$set: admin}, {new: true});
  }


  /**
 *
 * @return {Promise}
 */
  async getRequests() {
    return ReactivateModel.find({});
  }

  /**
 *
 * @param {*} User Key queries
 * @return {object}
 */
  async findRequest(User) {
    return ReactivateModel.findOne({username: User.username});
  }

  /**
 * Delete Request
 * @param {*} User Key queries
 * @param {*} callback
 * @return {object}
 */
  async deleteRequestOr(User, callback) {
    const queries=[];
    Object.entries(User).forEach(function(query) {
      const obj={};
      obj[query[0].toString()]=query[1];
      queries.push(obj);
    });

    return ReactivateModel.findOneAndRemove({$or: queries}, callback);
  }

  /**
 *
 * @param {*} User Key queries
 * @param {*} callback
 * @return {Promise}
 */
  async findCompanyOr(User) {
    const queries=[];
    Object.entries(User).forEach(function(query) {
      const obj={};
      obj[query[0].toString()]=query[1];
      queries.push(obj);
    });

    return CompanyModel.findOne({$or: queries});
  }

  /**
* save Company
* @param {CompanyModel} company company
* @return {Promise}
*/
  async persistCompany(company) {
    Object.keys(company).forEach((key) => {
      if (typeof company[key] === String) {
        company[key] = company[key].trim();
      }
    });
    return company.save();
  }

  /**
 * update Company
 * @param {string} username
 * @param {Object} company company
 * @param {*} callback
 * @return {*} update admin
 */
  async updateCompany(username, company) {
    return CompanyModel.findOneAndUpdate({username: username}, {$set: company}, {new: true});
  }

  /**
* save Skill
* @param {SkillModel} skill skill
* @return {Promise}
*/
  async persistSkill(skill) {
    Object.keys(skill).forEach((key) => {
      if (typeof skill[key] === String) {
        skill[key] = skill[key].trim();
      }
    });
    return skill.save();
  }

  /**
 *
 * @param {*} Skill Key queries
 * @param {*} callback
 * @return {Promise}
 */
  async findSkillOr(Skill) {
    const queries=[];
    Object.entries(Skill).forEach(function(query) {
      const obj={};
      obj[query[0].toString()]=query[1];
      queries.push(obj);
    });

    return SkillModel.findOne({$or: queries});
  }

  /**
 *
 * @param {*} Skill Key queries
 * @param {*} callback
 * @return {Promise}
 */
  async findSkillAll(Skill) {
    const queries=[];
    Object.entries(Skill).forEach(function(query) {
      const obj={};
      obj[query[0].toString()]=query[1];
      queries.push(obj);
    });

    return SkillModel.find({$or: queries});
  }

  /**
 * update skill
 * @param {string} username
 * @param {Object} skill skill
 * @return {*} update admin
 */
  async updateSkill(username, skill) {
    return SkillModel.findOneAndUpdate({SkillName: username}, {$set: skill}, {new: true});
  }
  /**
* save Status
* @param {StatusModel} status Status
* @return {Promise}
*/
  async persistStatus(status) {
    Object.keys(status).forEach((key) => {
      if (typeof status[key] === String) {
        status[key] = status[key].trim();
      }
    });
    return status.save();
  }

  /**
*
* @param {*} status Key queries
* @return {Promise}
*/
  async findStatusOr(status) {
    const queries=[];
    Object.entries(status).forEach(function(query) {
      const obj={};
      obj[query[0].toString()]=query[1];
      queries.push(obj);
    });

    return StatusModel.findOne({$or: queries});
  }

  /**
*
* @param {*} status Key queries
* @param {*} callback
* @return {Promise}
*/
  async findStatusAll(status) {
    const queries=[];
    Object.entries(status).forEach(function(query) {
      const obj={};
      obj[query[0].toString()]=query[1];
      queries.push(obj);
    });

    return StatusModel.find({$or: queries});
  }

  /**
* update Status
* @param {string} username
* @param {Object} status Status
* @return {*} update admin
*/
  async updateStatus(username, status) {
    return StatusModel.findOneAndUpdate({StatusName: username}, {$set: status}, {new: true});
  }
  /**
 * assign status to company
 * @param {string} username
 * @param {*}  statusId
 * @return {Promise} update Company
 */
  async assignStatus(username, statusId) {
    return CompanyModel.findOneAndUpdate({username: username}, {'$push': {'company_status': statusId}}, {new: true});
  }

  /**
 * deprive status from company
 * @param {string} username
 * @param {*}  statusId
 * @return {Promise} update Company
 */
  async depriveStatus(username, statusId) {
    return CompanyModel.findOneAndUpdate({username: username}, {'$pull': {'company_status': statusId}}, {new: true});
  }

  /**
  * findDeveloperStatus
  * @param {String} name
  * @param {String} description
  * @return {Promise}
  */
  async findDeveloperStatus(name) {
    return DeveloperStatusModel.findOne({name});
  }


  /**
  * addDeveloperStatus
  * @param {String} name
  * @param {String} description
  * @return {Promise}
  */
  async addDeveloperStatus(name, description) {
    const developerStatusModel = new DeveloperStatusModel();
    developerStatusModel.name = name;
    developerStatusModel.description = description;
    return developerStatusModel.save();
  }

  /**
  * updateDeveloperStatus
  * @param {String} developer
  * @return {Promise}
  */
  async updateDeveloperStatus(developer) {
    return developer.save();
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


module.exports = {AdminPersister: AdminPersister};
