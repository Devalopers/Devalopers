/* eslint-disable require-jsdoc */
import {getModel} from '../../models/MongooseHelper';
const DeveloperModel = getModel('DeveloperModel');
const Skill = getModel('SkillModel');
const JobModel = getModel('TechJob');
const JobApplicationModel = getModel('TechJobApp');
const ProjectApplicationModel = getModel('TechProjectApp');
const ProjectModel = getModel('TechProject');
const SubscriberModel = getModel('SubscriberModel');
const CompanyModel = getModel('CompanyModel');
const SavedJobsModel = getModel('SavedJobsModel');
export default class {
  async persistDeveloper(developer) {
    return developer.save();
  }
  async isDeveloperPresent(username, email) {
    const developer = await DeveloperModel.findOne({$or: [{username}, {email}]});
    if (developer) {
      return true;
    }
    return false;
  }
  async findDeveloper(username, email) {
    return await DeveloperModel.findOne({$or: [{username}, {email}]});
  }

  async updateDeveloper(developer) {
    return developer.save();
  }
  async searchDeveloper(txt) {
    if ( txt.plain) {
      return DeveloperModel.find({$or:
          [
            {'fullname': {$regex: txt.plain, $options: 'i'}},
            {'username': {$regex: txt.plain, $options: 'i'}},
            {'location': {$regex: txt.plain, $options: 'i'}},
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
      return DeveloperModel.find({$and: queries});
    }
    return new Promise((resolve)=>{
      resolve(false);
    });
  }

  async retrieveDeveloperSkill(skillname) {
    return Skill.findOne({SkillName: skillname});
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
 * persist Job
 * @param {Object} jobApplication
 * @return {Promise}
 */
  async persistJobApplication(jobApplication) {
    return jobApplication.save();
  }
  /**
 * Find Job Application
 * @param {*} jobId
 * @param {*} devId
 * @return {Promise}
 */
  async findJobApp(jobId, devId) {
    return JobApplicationModel.findOne({'JobId': jobId, 'Developer': devId, 'isdeactivated': false});
  }
  /**
 * Find All Job Applications
 * @param {*} devId
 * @return {Promise}
 */
  async findAllJobApp(devId) {
    return JobApplicationModel.find({'Developer': devId, 'isdeactivated': false});
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
 * persist Project
 * @param {Object} projectApplication
 * @return {Promise}
 */
  async persistProjectApplication(projectApplication) {
    return projectApplication.save();
  }
  /**
* Find Project Application
* @param {*} projectId
* @param {*} devId
* @return {Promise}
*/
  async findProjectApp(projectId, devId) {
    return ProjectApplicationModel.findOne({'ProjectId': projectId, 'Developer': devId, 'isdeactivated': false});
  }

  /**
 * Find All Project Applications
 * @param {*} devId
 * @return {Promise}
 */
  async findAllProjectApp(devId) {
    return ProjectApplicationModel.find({'Developer': devId, 'isdeactivated': false});
  }

  /**
 * Check if email exists
 * @param {String} email
 * @return {Promise}
 */
  async verifyEmailUnique(email) {
    return SubscriberModel.findOne({email: email});
  }

  /**
 * add subscriber to list
 * @param {String} subscriberUsername
 * @param {Object} subscriberObject
 * @return {Promise}
 */
  async persistSubscriber(subscriberUsername, subscriberObject) {
    subscriberObject.isdeactivated = false;
    return SubscriberModel.findOneAndUpdate(
        {username: subscriberUsername}, {$set: subscriberObject}, {upsert: true, new: true, setDefaultsOnInsert: true}
    );
  }

  /**
 * deactivate subscriber
 * @param {String} subscriberEmail
 * @param {String} subscriberKey
 * @return {Promise}
 */
  async deactivateSubscriber(subscriberEmail, subscriberKey) {
    const subscriberObject = {isdeactivated: true};
    return SubscriberModel.findOneAndUpdate({email: subscriberEmail, UnsubscriptionKey: subscriberKey}, {$set: subscriberObject}, {new: true});
  }

  async findCompany(username) {
    return CompanyModel.findOne({username});
  }

  async doesJobExist(username, jobID) {
    const record = await SavedJobsModel.findOne({username, jobID});
    if (record) {
      return true;
    }
    return false;
  }

  /**
   * @param {SavedJobModel} savedJobModel
   */
  async persistJobSave(savedJobModel) {
    return savedJobModel.save();
  }

  /**
   * @param {*} username
   * @param {*} offset
   * @param {*} length
   */
  async findSavedJobs(username, offset, length) {
    return SavedJobsModel.find({username})
        .setOptions({skip: offset, limit: length})
        .sort({createdAt: 'descending'});
  }
}
