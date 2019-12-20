
const MongooseHelper = require('../../src/models/MongooseHelper');
const CompanyModel= MongooseHelper.getModel('CompanyModel');
const ReactivateModel= MongooseHelper.getModel('ReactivationRequestModel');
/**
 * test
 */
class CompanyPersister {
  /**
     * constructor
     */
  constructor() {
  }
  /**
   *
   * @param {*} User Key queries
   * @return {object}
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
   */
  async persistCompany(company) {
    // CompanyModel.persist(company, callback);
    Object.keys(company).forEach((key) => {
      if (typeof company[key] == String) {
        company[key] = company[key].trim();
      }
    });
    return company.save();
  }
  /**
   *
   * @param {*} User Key queries
   * @param {*} callback
   * @return {object}
   */
  findRequestOr(User) {
    const queries=[];
    Object.entries(User).forEach(function(query) {
      const obj={};
      obj[query[0].toString()]=query[1];
      queries.push(obj);
    });

    return ReactivateModel.findOne({$or: queries});
  }
  /**
   * save Request
   * @param {ReactivateModel} request company
   * @param {*} callback function return
   */
  persistRequest(request, callback) {
    // CompanyModel.persist(company, callback);

    Object.keys(request).forEach((key) => {
      if (typeof request[key] == String) {
        request[key] = request[key].trim();
      }
    });
    ReactivateModel.create(request, callback);
  }
}

module.exports = CompanyPersister;


