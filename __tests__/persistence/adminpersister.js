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
   * find admin
   * @param {*} username
   * @param {*} email
   * @return {Promise}
   */
  async findAdmin(username, email) {
    const dummy = new AdminModel({
      'email': 'salah.awad@outlook.com',
      'password': 'admin@123',
      'username': 'sawada',
      'Active': true,
      'isdeactivated': false,
    });
    dummy.setPassword(dummy.password);
    if (dummy.email === email || dummy.username === username) {
      return dummy;
    }
    return null;
  }
  /**
   * save admin
   * @param {*} admin admin
   * @param {*} callback function return
   */
  async persistAdmin(admin) {
    return new AdminModel(admin);
  }
  /**
   * update admin
   * @param {String} username
   * @param {String} admin admin
   */
  async updateAdmin(username, admin) {
    const dummy = new AdminModel({
      'email': 'salah.awad@outlook.com',
      'password': 'admin@123',
      'username': 'sawada',
      'firstname': 'Salah',
      'lastname': 'Awad',
      'isdeactivated': false,
    });
    if (dummy.username === username) {
      let key;
      for (key in admin) {
        if (dummy[key]) {
          dummy[key] = admin[key];
        }
      }
      return dummy;
    }
    return null;
  }

  /**
 * verify admin email
 * @param {string} email
 * @param {string} verifier
 * @return {promise}  verified email
 */ async verifyAdmin(email, verifier) {
    const dummy = JSON.parse('{"email": "salah.awad@outlook.com", "password": "admin@123", "username": "sawada", "verifier": "12345", "Active":false}');

    if (email === dummy.email && verifier === dummy.verifier) {
      return dummy;
    }
    return null;
  }
  /**
     *
     * @param {*} User
     * @param {*} callback
     * @return {boolean}
     */
  async findCompanyOr(User) {
    // eslint-disable-next-line no-multi-str
    const dum =JSON.parse('{"_id": "999","email": "salah.awad@outlook.com","password": "admin@123","code_verifier": "fff","pwd_reset_code": "aaa","username": "sawada","is_verified": true,"isdeactivated": false}');
    if (dum.email === User.email || dum.username === User.username || dum._id === User._id) {
      return dum;
    }

    return null;
  }
  /**
 * update Company
 * @param {string} username
 * @param {Object} company company
 * @return {*} update company
 */
  async udpateCompany(username, company) {
    const dum=JSON.parse('{"_id": "999","email": "salah.awad@outlook.com","password": "admin@123","code_verifier": "fff","pwd_reset_code": "aaa","username": "sawada","is_verified": true,"isdeactivated": false}');
    if (username!=dum.username) return null;
    const result=company;
    let i;
    for (i in dum) {
      if (company[i]) result[i]=company[i];
      else result[i]=dum[i];
    }
    return new Promise((resolve)=>{
      resolve(result);
    });
  }
  /**
 *
 * @param {*} User Key queries
 * @param {*} callback
 * @return {object}
 */
  async findRequestOr(User) {
    const requester=JSON.parse('{""email": "salah.awad@outlook.com", "username": "sawada", "is_verified":"true", "isdeactivated":"false"}');
    if (requester.username==User.username || requester.email==User.email) {
      return requester;
    }
  }
  /**
 * Delete Request
 * @param {*} User Key queries
 * @param {*} callback
 * @return {object}
 */
  async deleteRequestOr(User) {
    return 1;
  }

  /**
 * verify admin passwordCode
 * @param {string} passwordCode
 *  @return {Promise}
 */
  async verifyPasswordCode(passwordCode) {
    const dummy = new AdminModel({
      'email': 'salah.awad@outlook.com',
      'password': 'admin@123',
      'username': 'sawada',
      'passwordCode': '12345',
      'isdeactivated': false,
    });

    if (dummy.passwordCode === passwordCode) {
      return dummy;
    }
    return null;
  }

  /**
  * findDeveloperStatus
  * @param {String} name
  * @param {String} description
  *  @return {Promise}
  */
  async findDeveloperStatus(name) {
    if (name === 'found dev status') {
      return {name: 'found dev status', description: 'I am description.'};
    }
    return null;
  }

  /**
  * addDeveloperStatus
  * @param {String} name
  * @param {String} description
  * @return {Promise}
  */
  async addDeveloperStatus(name, description) {
    return null;
  }

  /**
  * addDeveloperStatus
  * @param {String} developer
  * @return {Promise}
  */
  async updateDeveloperStatus(developer) {
    return;
  }

  /**
 *
 * @param {String} username
 * @param {*} Model
 * @param {*} Promise
 */
  async findUser(username, Model) {
    const company = {
      email: 'salah.awad@outlook.com', username: 'libroC',
      is_verified: true, isdeactivated: true, Jobs: [],
    };
    const admin = {
      'email': 'salah.awad@outlook.com',
      'password': 'admin@123',
      'username': 'sawada',
      'passwordCode': '12345',
      'isdeactivated': false,
    };
    if (Model === 'admin' && username === admin.username) return admin;
    if (Model==='company' && username === company.username) return company;
    return null;
  }
  /**
*
* @param {String} username
* @param {Object} updatedFields
* @param {*} Model
* @param {*} Promise
*/
  async updateUser(username, updatedFields, Model) {
    const company = {
      email: 'salah.awad@outlook.com', username: 'libroC',
      is_verified: true, isdeactivated: true, Jobs: [],
    };
    const admin = {
      'email': 'salah.awad@outlook.com',
      'password': 'admin@123',
      'username': 'sawada',
      'passwordCode': '12345',
      'isdeactivated': false,
    };
    if (Model === 'admin' && username === admin.username) {
      let key;
      for (key in updatedFields) {
        if (admin[key]) {
          admin[key] = updatedFields[key];
        }
      }
      return admin;
    }
    if (Model==='company' && username === company.username) {
      let key;
      for (key in updatedFields) {
        if (admin[key]) {
          admin[key] = updatedFields[key];
        }
      }
      return admin;
    }
    return null;
  }
}


module.exports = AdminPersister;
