/**
 * Developer Persistor
 */
class DeveloperPersistor {
  /**
   *
   * @param {*} username
   * @param {*} email
   * @return {Promise} boolean whether developer exists.
   */
  async isDeveloperPresent(username, email) {
    return false;
  }
  /**
   * persistDeveloper
   * @param {*} developer developer
   * @return {Promise} promise
   */
  async persistDeveloper(developer) {
    return;
  }
  /**
   * findDeveloper
   * @param {String} username
   * @param {String} email
   * @return {Promise} promise containing developer
   */
  async findDeveloper(username, email) {
    if (email === 'test@test.test' || username === 'testoto') {
      return {reset_token: 'hchchc', isdeactivated: false, _id: '123'};
    }
    if (username === 'testototo') {
      return {isdeactivated: true};
    }
    return null;
  }
  /**
   * updateDeveloper
   * @param {String} developer
   * @return {Promise} promise containing developer
   */
  async updateDeveloper(developer) {
    return;
  }


  /**
 * Mock fn for company.find()
 * @param {string} x
 * @return {Promise} update Company
 */
  find(x) {
    return [{companyName: 'test@gmail.com'}, {companyName: 'sami@g.c'}];
  }

  /**
  * Search Developer by  name and/or  username
  * @param {string} txt
  * @return {Promise} update Company
  */
  async searchDeveloper(txt) {
    const result =[];
    if ( txt.plain) {
      return this.find({$text: {$search: txt}});
    }
    const queries=[];
    Object.entries(txt).forEach(function(query) {
      const obj={};
      if (!query[1]) {
        obj[query[0].toString()]=query[1];
        queries.push(obj);
      }
    });
    if (queries != false) {
      result.push(this.find(queries));
      return result;
    }
    return new Promise((resolve)=>{
      resolve(false);
    });
  }

  /**
   * retrieveDeveloperSkill
   * @param {String} skillname
   * @return {Promise}
   */
  async retrieveDeveloperSkill(skillname) {
    return {isdeactivated: false};
  }
  /**
 * find Job
 * @param {*} jobId
 * @return {Promise}
 */
  async findJob(jobId) {
    const dummy = {'_id': '123', 'CompanyWebsite': 'www.website.com',
      'JobTitle': 'Front End Developer',
      'Email': 'contactmail@gmail.com',
      'CompanyIndustry': 'IT',
      'Company': '999',
      'questions': ['hi'],
    };
    if (dummy._id === jobId) {
      return new Promise((resolve, reject)=>{
        resolve(dummy);
      });
    }
    if (jobId==='-1') {
      return new Promise((resolve, reject)=>{
        reject(new Error('Error Occurred While Searching'));
      });
    }
    return new Promise((resolve, reject)=>{
      resolve(null);
    });
  }

  /**
 * persist Job
 * @param {Object} jobApplication
 * @return {Promise}
 */
  async persistJobApplication(jobApplication) {
    Promise.resolve(1);
  }
  /**
* Find Job Application
* @param {*} jobId
* @param {*} devId
* @return {Promise}
*/
  async findJobApp(jobId, devId) {
    const dummy = {
      '_id': '123',
      'Developer': '456',
      'isdeactivated': false,
      'answers': ['hi', 'ho', 'hi'],
    };
    if (dummy._id === jobId && dummy.Developer == devId && !dummy.isdeactivated) {
      return new Promise((resolve, reject)=>{
        resolve(dummy);
      });
    }
    if (jobId==='-1') {
      return new Promise((resolve, reject)=>{
        reject(new Error('Error Occurred While Searching'));
      });
    }
    return new Promise((resolve, reject)=>{
      resolve(null);
    });
  }
  /**
* Find All Job Applications
* @param {*} devId
* @return {Promise}
*/
  async findAllJobApp(devId) {
    if (devId=='123') {
      return [{_id: 123}, {_id: 456}];
    }
    return null;
  }
  // //////////////
  /**
 * persist Project
 * @param {Object} jobApplication
 * @return {Promise}
 */
  async persistProjectApplication(jobApplication) {
    Promise.resolve(1);
  }
  /**
* Find Project Application
* @param {*} jobId
* @param {*} devId
* @return {Promise}
*/
  async findProjectApp(jobId, devId) {
    const dummy = {
      'developerUsername': 'testoto',
      '_id': '123',
      'Developer': '456',
      'isdeactivated': false,
      'answers': ['hi', 'ho', 'hi'],
    };
    if (dummy.developerUsername === jobId && dummy.Developer == devId && !dummy.isdeactivated) {
      return new Promise((resolve, reject)=>{
        resolve(dummy);
      });
    }
    if (jobId==='-1') {
      return new Promise((resolve, reject)=>{
        reject(new Error('Error Occurred While Searching'));
      });
    }
    return new Promise((resolve, reject)=>{
      resolve(null);
    });
  }
  /**
* Find All Job Applications
* @param {*} devId
* @return {Promise}
*/
  async findAllProjectApp(devId) {
    if (devId=='123') {
      return [{_id: 123}, {_id: 456}];
    }
    return null;
  }
  /**
 * find Job
 * @param {*} projectId
 * @return {Promise}
 */
  async findProject(projectId) {
    const dummy = {'_id': '123',
      'ProjectDescription': 'www.website.com',
      'ProjectTitle': 'Front End Developer',
      'Email': 'contactmail@gmail.com',
      'ProjectLength': 20,
      'Company': '999',
      'questions': ['hi'],
      'YearsOfExperience': 200,
      'FixedBudget': true,
      'Skills': 'java',

    };
    if (dummy._id === projectId) {
      return new Promise((resolve, reject)=>{
        resolve(dummy);
      });
    }
    if (projectId==='-1') {
      return new Promise((resolve, reject)=>{
        reject(new Error('Error Occurred While Searching'));
      });
    }
    return new Promise((resolve, reject)=>{
      resolve(null);
    });
  }

  /**
 * Check if email exists
 * @param {String} email
 * @return {Promise}
 */
  async verifyEmailUnique(email) {
    const subscriber = {
      email: 'salah.awad@outlook.com',
      username: 'hasank',
      SearchCriteria: {
        All: true,
      },
    };

    return email === subscriber.email ? subscriber : null;
  }

  /**
* add subscriber to list
* @param {String} subscriberUsername
* @param {Object} subscriberObject
* @return {Promise}
*/
  async persistSubscriber(subscriberUsername, subscriberObject) {
    subscriberObject.isdeactivated = false;
    const subscriber = {
      email: 'salah.awad@outlook.com',
      username: 'hasank',
      SearchCriteria: {
        All: true,
      },
      isdeactivated: true,
    };

    if (subscriberUsername === subscriber.username) {
      subscriber.email = subscriberObject.email;
      subscriber.SearchCriteria = subscriberObject.SearchCriteria;
      subscriber.All = subscriberObject.All;
      return subscriber;
    }
    return {username: subscriberUsername, ...subscriberObject};
  }

  /**
* deactivate subscriber
* @param {String} subscriberEmail
* @param {String} subscriberKey
* @return {Promise}
*/
  async deactivateSubscriber(subscriberEmail, subscriberKey) {
    const subscriber = {
      email: 'salah.awad@outlook.com',
      username: 'sawada',
      SearchCriteria: {},
      isdeactivated: false,
      UnsubscriptionKey: '1234',
    };

    if (subscriberEmail === subscriber.email && subscriberKey === subscriber.UnsubscriptionKey) {
      subscriber.isdeactivated = true;
      return subscriber;
    }
    return null;
  }

  /**
   * @param {*} username
   */
  async findCompany(username) {
    return null;
  }

  /**
   * @param {*} username
   * @param {*} jobID
   * @return {Promise}
   */
  async doesJobExist(username, jobID) {
    return false;
  }

  /**
   * @param {SavedJobModel} savedJobModel
   */
  async persistJobSave(savedJobModel) {
    return;
  }

  /**
   * @param {String} username
   * @param {String} offset
   * @param {String} length
   */
  async findSavedJobs(username, offset, length) {
    return null;
  }
}

module.exports = DeveloperPersistor;
