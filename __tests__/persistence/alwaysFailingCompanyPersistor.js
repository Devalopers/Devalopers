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
     * @param {*} User
     * @param {*} callback
     * @return {integer}
     */
  findCompanyOr(User) {
    if (User.username === 'falseVal' || User.email==='falseVal') {
      return new Promise((resolve) => {
        throw new Error('Error finding user');
      });

    }
    return new Promise((resolve) => {
      resolve(null);
    });
  }
  /**
 * save admin
 * @param {*} company company
 * @return {*} Error
 */
  persistCompany(company) {
    return new Promise((resolve) => {
      throw new Error('Error persisting user');
    });
    
  }


  /**
 * update Company
 * @param {string} username
 * @param {Object} company company
 * @param {*} callback
 */
  updateCompany(username, company) {
    throw new Error('Error updating user');
  }
}

module.exports = CompanyPersister;

