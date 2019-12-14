import {getModel} from '../../models/MongooseHelper';
const CompanyModel= getModel('CompanyModel');
const JobModel = getModel('TechJob');
const ProjectModel = getModel('TechProject');
const DeveloperModel = getModel('DeveloperModel');
const Skill = getModel('SkillModel');
const ReactivateModel= getModel('ReactivationRequestModel');
const JobApplicationModel = getModel('TechJobApp');
const ProjectApplicationModel = getModel('TechProjectApp');
const SubscriberModel = getModel('SubscriberModel');
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
    // CompanyModel.persist(company, callback);

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
 *
 * @param {*} User Key queries
 * @return {Promise}
 */
  async findRequestOr(User) {
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
 * @return {Promise}
 */
  async persistRequest(request) {
    Object.keys(request).forEach((key) => {
      if (typeof request[key] === String) {
        request[key] = request[key].trim();
      }
    });
    request=new ReactivateModel(request);
    return request.save();
  }

  /**
 * find Job
 * @param {*} jobId
 * @return {Promise}
 */
  async findJob(jobId) {
    return JobModel.findOne({'_id': jobId, 'isdeactivated': false});
  }

  /**
 * find Project
 * @param {*} projectId
 * @return {Promise}
 */
  async findProject(projectId) {
    return ProjectModel.findOne({'_id': projectId, 'isdeactivated': false});
  }

  /**
 * find All Jobs
 * @param {Array} jobIdArray
 * @return {Promise}
 */
  async findAllJobs(jobIdArray) {
    return JobModel.find({'_id': {$in: jobIdArray}, 'isdeactivated': false}).populate('Company');
  }

  /**
 * find All Projects
 * @param {Array} projectIdArray
 * @return {Promise}
 */
  async findAllProjects(projectIdArray) {
    return ProjectModel.find({'_id': {$in: projectIdArray}, 'isdeactivated': false}).populate('Developer');
  }

  /**
 * find All Projects Proposals
 * @param {Array} companyId
 * @return {Promise}
 */
  async findAllProjectProposals(companyId) {
    return ProjectApplicationModel.find({'Company': companyId, 'isdeactivated': false}).populate('Company').populate('Developer').populate('Project');
  }

  /**
 * save Job
 * @param {Object} JobModel
 * @return {Promise}
 */
  async persistJob(JobModel) {
    return JobModel.save();
  }
  /**
 * save Porject
 * @param {Object} ProjectModel
 * @return {Promise}
 */
  async persistProject(ProjectModel) {
    return ProjectModel.save();
  }
  /**
 * update Company Job List
 * @param {string} username
 * @param {*}  jobId
 * @return {Promise} update Company
 */
  async updateCompanyJobs(username, jobId) {
    return CompanyModel.findOneAndUpdate({username: username}, {'$push': {'Jobs': jobId}}, {new: true});
  }

  /**
 * update Company Job List
 * @param {string} username
 * @param {*}  projectId
 * @return {Promise} update Company
 */
  async updateCompanyProjects(username, projectId) {
    return CompanyModel.findOneAndUpdate({username: username}, {'$push': {'Projects': projectId}}, {new: true});
  }

  /**
 * Search Company by company name and description
 * @param {string} txt
 * @return {Promise} update Company
 */
  async searchCompany(txt) {
    if ( txt.plain) {
      return CompanyModel.find({$or:
          [
            {'company_name': {$regex: txt.plain, $options: 'i'}},
            {'company_description': {$regex: txt.plain, $options: 'i'}},
          ],
      }
      );
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
      return CompanyModel.find({$and: queries});
    }
    return new Promise((resolve)=>{
      resolve(false);
    });
  }

  /**
 * Search Job by Job Title and description
 * @param {string} txt
 * @return {Promise} update Company
 */
  async searchJob(txt) {
    if ( txt.plain) {
      return JobModel.find({$or:
          [
            {'JobTitle': {$regex: txt.plain, $options: 'i'}},
            {'JobDescription': {$regex: txt.plain, $options: 'i'}},
            {'JobLocation': {$regex: txt.plain, $options: 'i'}},
          ],
      }
      );
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
      return JobModel.find({$and: queries});
    }
    return new Promise((resolve)=>{
      resolve(false);
    });
  }
  /**
 * update job post
 * @param {*} jobId
 * @param {Object} updatedJob
 * @return {Promise} update Job Post
 */
  async updateJob(jobId, updatedJob) {
    updatedJob.audit_on = Date.now();
    return JobModel.findOneAndUpdate({_id: jobId}, {$set: updatedJob}, {new: true});
  }
  /**
 * update project post
 * @param {*} projectId
 * @param {Object} updatedProject
 * @return {Promise} update project Post
 */
  async updateProject(projectId, updatedProject) {
    updatedProject.audit_on = Date.now();
    return ProjectModel.findOneAndUpdate({_id: projectId}, {$set: updatedProject}, {new: true});
  }

  /**
 * check post uniqueness
 * @param {*} companyId
 * @param {String} title
 * @return {Promise} found job
 */
  async verifyJobUnique(companyId, title) {
    if (!title) return Promise.resolve(null);
    return JobModel.findOne({'Company': companyId, 'isdeactivated': false, 'JobTitle': title});
  }

  /**
 * check post uniqueness
 * @param {*} companyId
 * @param {String} title
 * @return {Promise} found project
 */
  async verifyProjectUnique(companyId, title) {
    if (!title) return Promise.resolve(null);
    return ProjectModel.findOne({'Company': companyId, 'ProjectTitle': title, 'isdeactivated': false}).populate('Company');
  }

  /**
 * Add Project Questions
 * @param {string} companyId
 * @param {*}  projectTitle
 * @param {Array}  questions
 * @return {Promise} update Company
 */
  async addQuestions(companyId, projectTitle, questions) {
    return ProjectModel.findOneAndUpdate({'Company': companyId, 'isdeactivated': false, 'ProjectTitle': projectTitle}, {'$push': {'questions': {'$each': questions}}}, {new: true});
  }

  /**
 * update Project Questions
 * @param {string} companyId
 * @param {*}  projectTitle
 * @param {Number}  index
 * @param {Array}  question
 * @return {Promise} update Company
 */
  async updateQuestions(companyId, projectTitle, index, question) {
    return ProjectModel.findOneAndUpdate({'Company': companyId, 'isdeactivated': false, 'ProjectTitle': projectTitle, 'questions.id': index}, {'$set': {'questions.$.question': question}}, {new: true});
  }

  /**
 * Add Project Questions
 * @param {string} companyId
 * @param {*}  JobTitle
 * @param {Array}  questions
 * @return {Promise} update Company
 */
  async addJobQuestions(companyId, JobTitle, questions) {
    return JobModel.findOneAndUpdate({'Company': companyId, 'isdeactivated': false, 'JobTitle': JobTitle}, {'$push': {'questions': {'$each': questions}}}, {new: true});
  }

  /**
* update Project Questions
* @param {string} companyId
* @param {*}  JobTitle
* @param {Number}  index
* @param {Array}  question
* @return {Promise} update Company
*/
  async updateJobQuestions(companyId, JobTitle, index, question) {
    return JobModel.findOneAndUpdate({'Company': companyId, 'isdeactivated': false, 'JobTitle': JobTitle, 'questions.id': index}, {'$set': {'questions.$.question': question}}, {new: true});
  }

  /**
 * Find All Job Applications
 * @param {*} companyId
 * @return {Promise}
 */
  async findAllJobApp(companyId) {
    return JobApplicationModel.find({'Company': companyId, 'isdeactivated': false}).populate('Company').populate('Developer');
  }

  /**
 * update developer
 * @param {*} devId
 * @param {Object} updatedFields
 * @return {Promise} updated dev
 */
  async updateDeveloper(devId, updatedFields) {
    return DeveloperModel.findOneAndUpdate({_id: devId}, {'$push': {'review': updatedFields}}, {new: true});
  }

  /**
 * filter subscribers based on criteria
 * @param {String} SearchCriteria
 * @return {Promise}
 */
  async filterByCriteria(SearchCriteria) {
    const subs = [];
    return SubscriberModel.find({isdeactivated: false}).then( (subscribers) =>{
      subscribers.forEach( (subscriber) =>{
        let flag = true;
        if (subscriber.SearchCriteria.All === true) {
          subs.push(subscriber);
        } else {
          Object.keys(subscriber.SearchCriteria).forEach( (key) => {
            if (key !== 'All' && subscriber.SearchCriteria[key] !== SearchCriteria[key]) flag = false;
          });
          if (flag) subs.push(subscriber);
        }
      });
      return Promise.resolve(subs);
    }).catch((err) => console.log(err));
  }


  /**
 * retrieves skill from db
 * @param {String} skillname
 * @return {Promise}
 */
  async retrieveSkill(skillname) {
    const regex = `^${skillname}$`;
    return Skill.findOne({SkillName: {'$regex': regex, '$options': 'i'}});
  }
}


module.exports = {CompanyPersister: CompanyPersister};
