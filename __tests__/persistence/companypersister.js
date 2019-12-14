
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
     * @param {*} User
     * @param {*} callback
     * @return {boolean}
     */
  async findCompanyOr(User) {
    // eslint-disable-next-line no-multi-str
    const dum =JSON.parse('{"_id": "999","email": "salah.awad@outlook.com","password": "admin@123","code_verifier": "fff","pwd_reset_code": "aaa","username": "sawada","is_verified": true,"isdeactivated": false, "Jobs":["123","456"]}');
    dum.filterData =function() {
      return 1;
    };
    if (dum.email === User.email || dum.username === User.username || dum._id === User._id) {
      return dum;
    }

    return null;
  }
  /**
     * save Company
     * @param {*} Company Company
     * @param {*} callback function return
     */
  async persistCompany(Company ) {
    return 1;
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
* save Request
* @param {ReactivateModel} request company
* @param {*} callback function return
*/
  async persistRequest(request) {
    // CompanyModel.persist(company, callback)
    return 1;
  }

  /**
 * save Job
 * @param {Object} JobModel
 * @return {Promise}
 */
  async persistJob(JobModel) {
    return JobModel;
  }

  /**
 * save Project
 * @param {Object} ProjectModel
 * @return {Promise}
 */
  async persistProject(ProjectModel) {
    return ProjectModel;
  }

  /**
 * update Company Job List
 * @param {string} username
 * @param {*}  jobId
 * @return {Promise} update Company
 */
  async updateCompanyJobs(username, jobId) {
    const company = {
      email: 'salah.awad@outlook.com', username: 'sawada',
      is_verified: true, isdeactivated: false, Jobs: [],
    };
    if (!(company.username === username)) {
      return null;
    }
    company.Jobs.push(jobId);
    return company;
  }

  /**
 * update Company Job List
 * @param {string} username
 * @param {*}  projectId
 * @return {Promise} update Company
 */
  async updateCompanyProjects(username, projectId) {
    const company = {
      email: 'salah.awad@outlook.com', username: 'sawada',
      is_verified: true, isdeactivated: false, Projects: [],
    };
    if (!(company.username === username)) {
      return null;
    }
    company.Projects.push(projectId);
    return company;
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
 * Search Company by company name and description
 * @param {string} txt
 * @return {Promise} update Company
 */
  async searchCompany(txt) {
    const result =[];
    if ( txt.plain) {
      return this.find({$text: {$search: txt}});
    }
    const queries=[];
    Object.entries(txt).forEach(function(query) {
      const obj={};
      if (query[1]) {
        obj[query[0].toString()]=query[1];
        queries.push(obj);
      }
    });
    if (queries != false) {
      result.push(this.findCompanyOr(queries));
      return result;
    }
    if (!txt.error) {
      return false;
    }
    throw new Error('Error Occurred While Searching');
  }
  /**
  * Search Company by company name and description
  * @param {string} txt
  * @return {Promise} update Company
  */
  async searchJob(txt) {
    const result =[];
    if ( txt.plain) {
      return this.find({$text: {$search: txt}});
    }
    const queries=[];
    Object.entries(txt).forEach(function(query) {
      const obj={};
      if (query[1]) {
        obj[query[0].toString()]=query[1];
        queries.push(obj);
      }
    });
    if (queries != false) {
      return this.findJob(queries[0]).then((usr)=>{
        result.push(usr);
        return result;
      }).catch((err)=>{
        return err;
      });
    }
    return new Promise((resolve)=>{
      resolve(false);
    });
  }
  /**
 * find Job
 * @param {*} job
 * @return {Promise}
 */
  async findJob(job) {
    const dummy = {'_id': '123', 'CompanyWebsite': 'www.website.com',
      'JobTitle': 'Front End Developer',
      'Email': 'contactmail@gmail.com',
      'CompanyIndustry': 'IT',
      'Company': '999',
      'questions': ['hi'],
    };
    if (dummy._id === job._id) {
      return new Promise((resolve, reject)=>{
        resolve(dummy);
      });
    }
    if (job.JobTitle==='-1') {
      return new Promise((resolve, reject)=>{
        reject(new Error('Error Occurred While Searching'));
      });
    }
    return new Promise((resolve, reject)=>{
      resolve(null);
    });
  }

  /**
* find All Jobs
* @param {Array} jobIdArray
* @return {Promise}
*/
  async findAllJobs(jobIdArray) {
    const job = [{'_id': '123', 'CompanyWebsite': 'www.website.com',
      'JobTitle': 'Front End Developer',
      'Email': 'contactmail@gmail.com',
      'CompanyIndustry': 'IT',
    },
    {'_id': '456', 'CompanyWebsite': 'www.website.com',
      'JobTitle': 'Front End Developer',
      'Email': 'contactmail@gmail.com',
      'CompanyIndustry': 'IT',
    }];
    const foundJobs = [];
    jobIdArray.forEach( (id) => {
      let i = 0;
      for (i; i<job.length; i++) {
        if (job[i]._id === id) {
          foundJobs.push(job);
        }
      }
    });
    return foundJobs;
  }
  /**
 * update job post
 * @param {*} jobId
 * @param {Object} updatedJob
 * @return {Promise} update Job Post
 */
  async updateJob(jobId, updatedJob) {
    const dummy = {'_id': '123', 'CompanyWebsite': 'www.website.com',
      'JobTitle': 'Front End Developer',
      'Email': 'contactmail@gmail.com',
      'CompanyIndustry': 'IT',
      'Fulfilled': false,
      'isdeactivated': false,
    };
    if (dummy._id === jobId) {
      let key;
      for (key in updatedJob) {
        if (key in dummy) {
          dummy[key] = updatedJob[key];
        }
      }
      return dummy;
    }
    return null;
  }

  /**
 * update project post
 * @param {*} projectId
 * @param {Object} updatedProject
 * @return {Promise} update project Post
 */
  async updateProject(projectId, updatedProject) {
    const dummy = {
      '_id': '123',
      'ProjectTitle': 'Devaloper',
      'ProjectLength': '2 years',
      'FixedBudget': '1000',
      'YearsOfExperience': '0-2',
      'Skills': 'c++',
      'Email': 'email@gmail.com',
      'ProjectDescription': 'Devalopers ',
      'Fulfilled': false,
      'isdeactivated': false,
      'filterData': function() {
        return 1;
      },
    };
    if (dummy._id === projectId) {
      let key;
      for (key in updatedProject) {
        if (key in dummy) {
          dummy[key] = updatedProject[key];
        }
      }
      return dummy;
    }
    return null;
  }
  /**
 * check job uniqueness
 * @param {*} companyId
 * @param {String} jobTitle
 * @return {Promise} update Job Post
 */
  async verifyJobUnique(companyId, jobTitle) {
    const dummy = {'_id': '123', 'CompanyWebsite': 'www.website.com',
      'JobTitle': 'Front End Developer',
      'Email': 'contactmail@gmail.com',
      'CompanyIndustry': 'IT',
      'Fulfilled': false,
      'isdeactivated': false,
      'questions': ['hi'],
    };
    if (dummy.JobTitle === jobTitle) {
      return dummy;
    }
    return null;
  }

  /**
 * check project uniqueness
 * @param {*} companyId
 * @param {String} projectTitle
 * @return {Promise} update Job Post
 */
  async verifyProjectUnique(companyId, projectTitle) {
    const dummy = {
      'ProjectTitle': 'Devaloper',
      'ProjectLength': '2 years',
      'FixedBudget': '1000',
      'YearsOfExperience': '0-2',
      'Skills': 'c++',
      'Email': 'email@gmail.com',
      'ProjectDescription': 'Devalopers ',
      'questions': ['hi'],

    };
    if (dummy.ProjectTitle === projectTitle) {
      return dummy;
    }
    return null;
  }
  /**
 * check project uniqueness
 * @param {*} companyId
 * @param {String} projectTitle
 * @param {*} questions
 * @return {Promise} update Job Post
 */
  async addQuestions(companyId, projectTitle, questions) {
    const dummy = {
      'ProjectTitle': 'Devaloper',
      'ProjectLength': '2 years',
      'FixedBudget': '1000',
      'YearsOfExperience': '0-2',
      'Skills': 'c++',
      'Email': 'email@gmail.com',
      'ProjectDescription': 'Devalopers ',
      'questions': ['hi'],

    };
    if (dummy.ProjectTitle === projectTitle) {
      return dummy;
    }
    return null;
  }
  /**
 * check project uniqueness
 * @param {*} companyId
 * @param {String} projectTitle
 * @param {Number} index
 * @param {*} questions
 * @return {Promise} update Job Post
 */
  async updateQuestions(companyId, projectTitle, index, questions) {
    const dummy = {
      'ProjectTitle': 'Devaloper',
      'ProjectLength': '2 years',
      'FixedBudget': '1000',
      'YearsOfExperience': '0-2',
      'Skills': 'c++',
      'Email': 'email@gmail.com',
      'ProjectDescription': 'Devalopers ',
      'questions': ['hi'],

    };
    if (dummy.ProjectTitle === projectTitle && dummy.questions[index]) {
      return dummy;
    }
    return null;
  }

  /**
 * add job questions
 * @param {*} companyId
 * @param {String} jobTitle
 * @param {*} questions
 * @return {Promise} update Job Post
 */
  async addJobQuestions(companyId, jobTitle, questions) {
    const dummy = {'_id': '123', 'CompanyWebsite': 'www.website.com',
      'JobTitle': 'Front End Developer',
      'Email': 'contactmail@gmail.com',
      'CompanyIndustry': 'IT',
      'Company': '999',
    };
    if (dummy.JobTitle === jobTitle) {
      return dummy;
    }
    return null;
  }
  /**
* update job quesion
* @param {*} companyId
* @param {String} jobTitle
* @param {Number} index
* @param {*} questions
* @return {Promise} update Job Post
*/
  async updateJobQuestions(companyId, jobTitle, index, questions) {
    const dummy = {'_id': '123', 'CompanyWebsite': 'www.website.com',
      'JobTitle': 'Front End Developer',
      'Email': 'contactmail@gmail.com',
      'CompanyIndustry': 'IT',
      'Company': '999',
      'questions': ['hi', 'o', 'c'],
    };
    if (dummy.JobTitle === jobTitle && dummy.questions[index]) {
      return dummy;
    }
    return null;
  }

  /**
 * Find All Job Applications
 * @param {*} companyId
 * @return {Promise}
 */
  async findAllJobApp(companyId) {
    const app =
      {'_id': '123',
        'isdeactivated': false,
        'answers': ['i do', 'ok', 'maybe'],
        'JobTitle': 'Web Developer',
        'Company': '456',
      };


    if (companyId === app.Company && !app.isdeactivated) {
      return app;
    }
    return null;
  }

  /**
 * update developer
 * @param {*} devId
 * @param {Object} updatedFields
 * @return {Promise} updated dev
 */
  async updateDeveloper(devId, updatedFields) {
    const dummy = {
      'username': 'developer',
      'email': 'contactmail@gmail.com',
      '_id': '123',
      'review': [],
    };
    if (devId === dummy._id ) {
      dummy.review.push(updatedFields);
      return dummy;
    } else {
      return null;
    }
  }

  /**
 * retrieves skill from db
 * @param {String} skillname
 * @return {Promise}
 */
  async retrieveSkill(skillname) {
    const skills =[
      {
        SkillName: 'Java',
        SkillDescription: 'programming language',
      },
      {
        SkillName: 'C',
        SkillDescription: 'programming language',
      },
      {
        SkillName: 'C++',
        SkillDescription: 'programming language',
      },
    ];

    for (let i=0; i< skills.length; i++) {
      if (skillname.toLowerCase() === skills[i].SkillName.toLowerCase()) return skills[i];
    }
    return null;
  }
}
module.exports = CompanyPersister;
